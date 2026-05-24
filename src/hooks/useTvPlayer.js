import { useRef } from "react"

function useTvPlayer({ setLoadingSong, setCurrentSong }) {
  const playerRef = useRef(null)

  const safePlay = () => {
    try {
      playerRef.current?.unMute()
      playerRef.current?.setVolume(100)
      playerRef.current?.playVideo()
    } catch {}
  }

  const handleReady = ({ target }) => {
    playerRef.current = target
    safePlay()
    setLoadingSong(false)
  }

  const handleStateChange = async ({ data }) => {
    switch (data) {
      // ended
      case 0:
        try {
          await fetch("/api/next")
        } catch {}

        setCurrentSong(null)
        break

      // playing
      case 1:
        safePlay()
        break

      // paused
      case 2:
        setTimeout(safePlay, 200)
        break
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