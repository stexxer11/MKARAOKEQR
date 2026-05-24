import { useRef, useCallback } from "react"

function useTvPlayer({ setLoadingSong, setCurrentSong }) {
  const playerRef = useRef(null)
  const timeoutRef = useRef(null)

  const safePlay = useCallback(() => {
    const player = playerRef.current

    if (!player) return

    try {
      player.unMute()
      player.setVolume(100)
      player.playVideo()
    } catch (error) {
      console.error("Player error:", error)
    }
  }, [])

  const handleReady = useCallback(
    ({ target }) => {
      playerRef.current = target

      safePlay()
      setLoadingSong(false)
    },
    [safePlay, setLoadingSong]
  )

  const handleStateChange = useCallback(
    async ({ data }) => {
      switch (data) {
        // ended
        case 0:
          try {
            await fetch("/api/next")
          } catch (error) {
            console.error("Next song error:", error)
          }

          setCurrentSong(null)
          break

        // paused
        case 2:
          clearTimeout(timeoutRef.current)

          timeoutRef.current = setTimeout(() => {
            safePlay()
          }, 200)

          break

        default:
          break
      }
    },
    [safePlay, setCurrentSong]
  )

  const handleError = useCallback(() => {
    setCurrentSong(null)
  }, [setCurrentSong])

  return {
    playerRef,
    handleReady,
    handleStateChange,
    handleError,
  }
}

export default useTvPlayer