import YouTube from "react-youtube"
import { useRef, useMemo } from "react"

function TvPlayer({
  currentSong,
  onReady,
  onStateChange,
  onError,
}) {

  const playerRef = useRef(null)
const opts = useMemo(
    () => ({
      width: "100%",
      height: "100%",
      host: "https://www.youtube-nocookie.com",
      playerVars: {
        autoplay: 1,
        controls: 0,
        rel: 0,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        enablejsapi: 1,
        iv_load_policy: 3,
      },
    }),
    []
  )

  if (!currentSong?.youtube_id) {
    return null
  }

  const handleReady = (e) => {

    playerRef.current = e.target

    try {

      e.target.unMute()
      e.target.setVolume(100)
      e.target.playVideo()

    } catch (err) {
      console.error(err)
    }

    onReady?.(e)
  }

  return (

    <div className="absolute inset-0 overflow-hidden">

      <YouTube
        videoId={currentSong.youtube_id}
        opts={opts}
        onReady={handleReady}
        onStateChange={onStateChange}
        onError={onError}

        className="
          absolute inset-0
          w-full h-full
        "

        iframeClassName="
          w-full h-full
          pointer-events-none
        "
      />

      {/* OVERLAY OSCURO */}
      <div className="absolute inset-0 bg-black/45" />

    </div>
  )
}

export default TvPlayer