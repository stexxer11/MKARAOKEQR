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
  const soundTimerRef = useRef(null)
  const hasStartedRef = useRef(false)
  const endingRef = useRef(false)

  function safePlay() {
    try {
      playerRef.current?.playVideo()
    } catch {}
  }

  function forceSound() {
    try {
      playerRef.current?.unMute()
      playerRef.current?.setVolume(100)
      playerRef.current?.playVideo()
    } catch {}
  }

  function forcePlayWithSound() {
    safePlay()

    clearInterval(soundTimerRef.current)

    let tries = 0

    soundTimerRef.current = setInterval(() => {
      tries++

      forceSound()

      if (tries >= 8) {
        clearInterval(soundTimerRef.current)
      }
    }, 600)
  }

  function showIntroAfterStart() {
    clearTimeout(introTimerRef.current)

    setShowIntro(true)

    introTimerRef.current = setTimeout(() => {
      setShowIntro(false)
    }, 2500)
  }

  function handleReady({ target }) {
    playerRef.current = target
    hasStartedRef.current = false
    endingRef.current = false

    setLoadingSong(true)
    setShowIntro(false)

    forcePlayWithSound()
  }

  async function finishSong() {
    if (endingRef.current) return

    endingRef.current = true

    clearTimeout(introTimerRef.current)
    clearInterval(soundTimerRef.current)

    hasStartedRef.current = false

    const finishedId = currentSong?.id

    setShowIntro(false)
    setLoadingSong(false)
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
      endingRef.current = false
    }, 500)
  }

  async function handleStateChange({ data }) {
    switch (data) {
      case 0:
        await finishSong()
        break

      case 1:
        setLoadingSong(false)

        if (!hasStartedRef.current) {
          hasStartedRef.current = true
          forceSound()
          showIntroAfterStart()
        }

        break

      case 2:
        setTimeout(() => {
          forcePlayWithSound()
        }, 300)
        break

      case 3:
        if (!hasStartedRef.current) {
          setLoadingSong(true)
        }

        setTimeout(() => {
          safePlay()
        }, 700)

        break

      case 5:
        forcePlayWithSound()
        break

      default:
        break
    }
  }

  function handleError() {
    clearTimeout(introTimerRef.current)
    clearInterval(soundTimerRef.current)

    hasStartedRef.current = false
    endingRef.current = false

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