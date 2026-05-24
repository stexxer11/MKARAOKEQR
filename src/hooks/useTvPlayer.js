import { useRef } from "react"
import supabase from "../services/supabase"

function useTvPlayer({
  currentSong,
  setLoadingSong,
  setCurrentSong,
  setShowIntro,
}) {
  const playerRef = useRef(null)
  const introTimerRef = useRef(null)

  function safePlay() {
    try {
      playerRef.current?.unMute()
      playerRef.current?.setVolume(100)
      playerRef.current?.playVideo()
    } catch {}
  }

  function showSongIntro() {
    setShowIntro(true)

    clearTimeout(introTimerRef.current)

    introTimerRef.current = setTimeout(() => {
      setShowIntro(false)
    }, 3500)
  }

  function handleReady({ target }) {
    playerRef.current = target
    safePlay()
  }

  async function handleStateChange({ data }) {
    switch (data) {

      // ENDED
      case 0:
        clearTimeout(introTimerRef.current)

        if (currentSong?.id) {
          await supabase
            .from("songs_queue")
            .delete()
            .eq("id", currentSong.id)
        }

        setShowIntro(false)
        setLoadingSong(false)
        setCurrentSong(null)
        break

      // PLAYING
      case 1:
        safePlay()
        setLoadingSong(false)
        showSongIntro()
        break

      // PAUSED
      case 2:
        setTimeout(safePlay, 200)
        break

      default:
        break
    }
  }

  function handleError() {
    clearTimeout(introTimerRef.current)

    setLoadingSong(false)
    setShowIntro(false)
    setCurrentSong(null)
  }

  return {
    playerRef,
    handleReady,
    handleStateChange,
    handleError,
  }
}

export default useTvPlayer