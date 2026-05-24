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

  function safePlay() {
    try {
      playerRef.current?.unMute()
      playerRef.current?.setVolume(100)
      playerRef.current?.playVideo()
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
    safePlay()
  }

  async function handleStateChange({ data }) {
    switch (data) {
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

      case 1:
        safePlay()

        if (!hasStartedRef.current) {
          hasStartedRef.current = true
          setLoadingSong(false)
          showIntroAfterStart()
        }

        break

      case 2:
        setTimeout(safePlay, 200)
        break

      default:
        break
    }
  }

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