// src/hooks/useTvPlayer.js

import { useRef } from "react"
import supabase from "../services/supabase"

function useTvPlayer({
  currentSong,
  setCurrentSong,
  setLoadingSong,
  setShowIntro,
}) {
  const playerRef = useRef(null)

  const introTimerRef = useRef(null)
  const transitionTimerRef = useRef(null)
  const retryTimerRef = useRef(null)

  const screenPhaseRef = useRef("idle")
  const endingRef = useRef(false)

  function clearTimers() {
    clearTimeout(introTimerRef.current)
    clearTimeout(transitionTimerRef.current)
    clearTimeout(retryTimerRef.current)
  }

  function forcePlay() {
    try {
      playerRef.current?.playVideo()
      playerRef.current?.unMute()
      playerRef.current?.setVolume(100)
    } catch {}
  }

  function handleReady({ target }) {
    playerRef.current = target

    endingRef.current = false
    screenPhaseRef.current = "loading"

    setLoadingSong(true)
    setShowIntro(false)

    forcePlay()

    retryTimerRef.current = setTimeout(() => {
      forcePlay()
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
      case 0:
        await finishSong()
        break

      case 1:
        if (screenPhaseRef.current === "loading") {
          screenPhaseRef.current = "intro"

          setLoadingSong(false)
          setShowIntro(true)

          forcePlay()

          clearTimeout(introTimerRef.current)

          introTimerRef.current = setTimeout(() => {
            screenPhaseRef.current = "transition"

            transitionTimerRef.current = setTimeout(() => {
              screenPhaseRef.current = "playing"
              setShowIntro(false)
            }, 1200)

          }, 3500)
        }

        break

      case 2:
        retryTimerRef.current = setTimeout(() => {
          forcePlay()
        }, 400)

        break

      case 3:
        if (screenPhaseRef.current === "loading") {
          setLoadingSong(true)
        }

        retryTimerRef.current = setTimeout(() => {
          forcePlay()
        }, 800)

        break

      case 5:
        if (screenPhaseRef.current === "loading") {
          forcePlay()
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
    playerRef.current = null
  }

  return {
    handleReady,
    handleStateChange,
    handleError,
  }
}

export default useTvPlayer