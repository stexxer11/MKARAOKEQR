import { useRef } from "react"

function useTvPlayer({ setLoadingSong, setCurrentSong }) {

  const playerRef = useRef(null)

  const handleReady = (e) => {

    playerRef.current = e.target

    try {
      e.target.unMute()
      e.target.setVolume(100)
      e.target.playVideo()
    } catch (err) {}

    setLoadingSong(false)
  }

  const handleStateChange = async (e) => {

    // ended
    if (e.data === 0) {

      try {
        await fetch("/api/next") // opcional o Supabase directo
      } catch {}

      setCurrentSong(null)
    }

    // playing
    if (e.data === 1) {
      try {
        playerRef.current?.unMute()
        playerRef.current?.setVolume(100)
      } catch {}
    }

    // paused auto-resume
    if (e.data === 2) {
      setTimeout(() => {
        playerRef.current?.playVideo()
      }, 200)
    }
  }

  const handleError = () => {
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