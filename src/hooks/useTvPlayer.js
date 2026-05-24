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

  const hasStartedRef = useRef(false)

  // =========================
  // PLAY
  // =========================

  function safePlay() {

    try {

      playerRef.current?.mute()

      playerRef.current?.playVideo()

    } catch {}
  }

  // =========================
  // SOUND
  // =========================

  function enableSound() {

    try {

      playerRef.current?.unMute()

      playerRef.current?.setVolume(100)

    } catch {}
  }

  // =========================
  // INTRO
  // =========================

  function showIntroAfterStart() {

    clearTimeout(introTimerRef.current)

    setShowIntro(true)

    introTimerRef.current = setTimeout(() => {

      setShowIntro(false)

    }, 2500)
  }

  // =========================
  // READY
  // =========================

  function handleReady({ target }) {

    playerRef.current = target

    hasStartedRef.current = false

    setLoadingSong(true)

    safePlay()
  }

  // =========================
  // STATE CHANGE
  // =========================

  async function handleStateChange({ data }) {

    switch (data) {

      // =====================
      // ENDED
      // =====================

      case 0:

        clearTimeout(introTimerRef.current)

        hasStartedRef.current = false

        if (currentSong?.id) {

          await supabase
            .from("songs_queue")
            .delete()
            .eq("id", currentSong.id)
        }

        setLoadingSong(false)

        setShowIntro(false)

        setCurrentSong(null)

        break

      // =====================
      // PLAYING
      // =====================

      case 1:

        // YA ESTA REPRODUCIENDO
        // QUITAR LOADING INMEDIATAMENTE

        if (!hasStartedRef.current) {

          hasStartedRef.current = true

          setLoadingSong(false)

          enableSound()

          showIntroAfterStart()
        }

        break

      // =====================
      // PAUSED
      // =====================

      case 2:

        setTimeout(() => {

          safePlay()

        }, 300)

        break

      // =====================
      // BUFFERING
      // =====================

      case 3:

        setLoadingSong(true)

        break

      // =====================
      // CUED
      // =====================

      case 5:

        safePlay()

        break

      default:
        break
    }
  }

  // =========================
  // ERROR
  // =========================

  function handleError() {

    clearTimeout(introTimerRef.current)

    hasStartedRef.current = false

    setLoadingSong(false)

    setShowIntro(false)

    setCurrentSong(null)
  }

  return {
    handleReady,
    handleStateChange,
    handleError,
  }
}

export default useTvPlayer