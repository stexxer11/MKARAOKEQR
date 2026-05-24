import { useRef } from "react"
import supabase from "../services/supabase"

function useTvPlayer({
  currentSong,
  setLoadingSong,
  setCurrentSong,
  setShowIntro,
  setVideoReady,
}) {

  const playerRef = useRef(null)

  const handleReady = (e) => {

    playerRef.current = e.target

    try {
      e.target.unMute()
      e.target.setVolume(100)
      e.target.playVideo()
    } catch (err) {
      console.error(err)
    }
  }

  const handleStateChange = async (e) => {

    // =====================
    // PLAYING REAL
    // =====================

    if (e.data === 1) {

      try {
        playerRef.current?.unMute()
        playerRef.current?.setVolume(100)
      } catch (err) {}

      setVideoReady(true)
      setLoadingSong(false)
      setShowIntro(true)

      setTimeout(() => {
        setShowIntro(false)
      }, 2800)
    }

    // =====================
    // ENDED
    // =====================

    if (e.data === 0) {

      if (currentSong?.id) {
        await supabase
          .from("songs_queue")
          .delete()
          .eq("id", currentSong.id)
      }

      setVideoReady(false)
      setShowIntro(false)
      setLoadingSong(false)
      setCurrentSong(null)
    }

    // =====================
    // PAUSED
    // =====================

    if (e.data === 2) {

      setTimeout(() => {
        try {
          playerRef.current?.playVideo()
        } catch (err) {}
      }, 250)
    }
  }

  const handleError = async () => {

    if (currentSong?.id) {
      await supabase
        .from("songs_queue")
        .delete()
        .eq("id", currentSong.id)
    }

    setVideoReady(false)
    setShowIntro(false)
    setLoadingSong(false)
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