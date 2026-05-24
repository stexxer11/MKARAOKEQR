import { useRef } from "react"
import supabase from "../services/supabase"

function useTvPlayer({
  currentSong,
  setLoadingSong,
  setCurrentSong,
}) {
  const playerRef = useRef(null)

  function safePlay() {
    try {
      playerRef.current?.unMute()
      playerRef.current?.setVolume(100)
      playerRef.current?.playVideo()
    } catch {}
  }

  function handleReady({ target }) {
    playerRef.current = target
    safePlay()
    setLoadingSong(false)
  }

  async function handleStateChange({ data }) {
    switch (data) {

      // ENDED
      case 0:
        if (currentSong?.id) {
          await supabase
            .from("songs_queue")
            .delete()
            .eq("id", currentSong.id)
        }

        setCurrentSong(null)
        break

      // PLAYING
      case 1:
        safePlay()
        setLoadingSong(false)
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