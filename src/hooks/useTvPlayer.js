// src/hooks/useTvPlayer.js

import { useRef } from "react"
import supabase from "../services/supabase"

function useTvPlayer({
  currentSong,
  setCurrentSong,
  setLoadingSong,
  setShowIntro,
  setTvStage,
}) {
  const playerRef = useRef(null)

  const introTimerRef = useRef(null)
  const retryTimerRef = useRef(null)
  const soundTimerRef = useRef(null)

  const screenPhaseRef = useRef("idle")
  const endingRef = useRef(false)

  function clearTimers() {
    clearTimeout(introTimerRef.current)
    clearTimeout(retryTimerRef.current)
    clearInterval(soundTimerRef.current)
  }

  function forcePlay() {
    try {
      playerRef.current?.playVideo()
      playerRef.current?.unMute()
      playerRef.current?.setVolume(100)
    } catch {}
  }

  function forcePlayLoop() {
    clearInterval(soundTimerRef.current)

    let tries = 0

    soundTimerRef.current = setInterval(() => {
      tries++

      forcePlay()

      if (tries >= 8) {
        clearInterval(soundTimerRef.current)
      }
    }, 600)
  }

  function handleReady({ target }) {
    playerRef.current = target

    endingRef.current = false
    screenPhaseRef.current = "loading"

    setTvStage("loading")
    setLoadingSong(true)
    setShowIntro(false)

    forcePlay()

    retryTimerRef.current = setTimeout(() => {
      forcePlay()
      forcePlayLoop()
    }, 700)
  }

  async function finishSong() {
    if (endingRef.current) return

    endingRef.current = true
    screenPhaseRef.current = "ended"

    clearTimers()

    const finishedId = currentSong?.id

    setLoadingSong(false)
    setShowIntro(false)
    setCurrentSong(null)
    setTvStage("idle")

    playerRef.current = null

    if (finishedId) {
      try {
        const { error } = await supabase
          .from("songs_queue")
          .delete()
          .eq("id", finishedId)

        if (error) throw error
      } catch (error) {
        console.error("Delete finished song error:", error)
      }
    }

    setTimeout(() => {
      screenPhaseRef.current = "idle"
      endingRef.current = false
    }, 500)
  }

  async function handleStateChange({ data }) {
    switch (data) {
      // TERMINÓ
      case 0:
        await finishSong()
        break

      // PLAYING
      case 1:
        if (screenPhaseRef.current === "loading") {
          screenPhaseRef.current = "intro"

          setLoadingSong(false)
          setShowIntro(true)
          setTvStage("intro")

          forcePlay()
          forcePlayLoop()

          clearTimeout(introTimerRef.current)

          introTimerRef.current = setTimeout(() => {
            screenPhaseRef.current = "playing"

            setShowIntro(false)
            setTvStage("playing")
          }, 3500)
        }

        break

      // PAUSADO
      case 2:
        if (
          screenPhaseRef.current === "loading" ||
          screenPhaseRef.current === "intro" ||
          screenPhaseRef.current === "playing"
        ) {
          retryTimerRef.current = setTimeout(() => {
            forcePlay()
            forcePlayLoop()
          }, 400)
        }

        break

      // BUFFERING
      case 3:
        if (screenPhaseRef.current === "loading") {
          setLoadingSong(true)
          setTvStage("loading")
        }

        retryTimerRef.current = setTimeout(() => {
          forcePlay()
        }, 800)

        break

      // CUED
      case 5:
        if (screenPhaseRef.current === "loading") {
          forcePlay()
          forcePlayLoop()
        }

        break

      default:
        break
    }
  }

  function handleError() {
    clearTimers()

    endingRef.current = false
    screenPhaseRef.current = "idle"

    setLoadingSong(false)
    setShowIntro(false)
    setCurrentSong(null)
    setTvStage("idle")

    playerRef.current = null
  }

  return {
    handleReady,
    handleStateChange,
    handleError,
  }
}

export default useTvPlayer