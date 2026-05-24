import { useRef } from "react"
import supabase from "../services/supabase"

function useTvPlayer({
  currentSong,
  setLoadingSong,
  setCurrentSong,
  setShowIntro,
}) {

  const playerRef = useRef(null)

  const handleReady = (e) => {

    playerRef.current = e.target

    try {
      e.target.unMute()
      e.target.setVolume(100)
      e.target.playVideo()
    } catch (err) {}

    setLoadingSong(false)
    setShowIntro(true)

    setTimeout(() => {
      setShowIntro(false)
    }, 2800)
  }

  const handleStateChange = async (e) => {

    if (e.data === 0) {

      if (!currentSong?.id) return

      await supabase
        .from("songs_queue")
        .delete()
        .eq("id", currentSong.id)

      setCurrentSong(null)
      setShowIntro(false)
      setLoadingSong(false)
    }

    if (e.data === 1) {
      try {
        playerRef.current?.unMute()
        playerRef.current?.setVolume(100)
      } catch (err) {}
    }

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

    setCurrentSong(null)
    setShowIntro(false)
    setLoadingSong(false)
  }

  return {
    playerRef,
    handleReady,
    handleStateChange,
    handleError,
  }
}

export default useTvPlayer