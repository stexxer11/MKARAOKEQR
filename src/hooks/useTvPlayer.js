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
  const retryTimerRef = useRef(null)

  function safePlay() {
    try {
      if (!playerRef.current) return

      playerRef.current.mute()
      playerRef.current.playVideo()

      setTimeout(() => {
        try {
          playerRef.current?.unMute()
          playerRef.current?.setVolume(100)
          playerRef.current?.playVideo()
        } catch {}
      }, 600)

    } catch {}
  }

  function showIntroAfterStart() {
    clearTimeout(introTimerRef.current)

    setShowIntro(true)

    introTimerRef.current = setTimeout(() => {
      setShowIntro(false)
    }, 3500)
  }

  function handleReady({ target }) {
    playerRef.current = target
    hasStartedRef.current = false

    clearTimeout(retryTimerRef.current)

    retryTimerRef.current = setTimeout(() => {
      safePlay()
    }, 500)
  }

  async function handleStateChange({ data }) {
    switch (data) {
      case 0:
        clearTimeout(introTimerRef.current)
        clearTimeout(retryTimerRef.current)

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

      case 1:
        if (!hasStartedRef.current) {
          hasStartedRef.current = true
          setLoadingSong(false)
          showIntroAfterStart()
        }
        break

      case 2:
        clearTimeout(retryTimerRef.current)

        retryTimerRef.current = setTimeout(() => {
          safePlay()
        }, 500)

        break

      case 3:
        clearTimeout(retryTimerRef.current)

        retryTimerRef.current = setTimeout(() => {
          safePlay()
        }, 900)

        break

      default:
        break
    }
  }

  function handleError() {
    clearTimeout(introTimerRef.current)
    clearTimeout(retryTimerRef.current)

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