import YouTube from "react-youtube"
import { useRef } from "react"

function TvPlayer({
  currentSong,
  onReady,
  onStateChange,
  onError,
}) {

  const playerRef = useRef(null)

  const opts = {
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
      mute: 0,
      enablejsapi: 1,
      iv_load_policy: 3,
    },
  }

  if (!currentSong) return null

  return (
    <div className="absolute inset-0">
      <YouTube
        videoId={currentSong.youtube_id}
        opts={opts}
        onReady={(e) => {
          playerRef.current = e.target
          onReady?.(e)
        }}
        onStateChange={onStateChange}
        onError={onError}
        className="w-full h-full scale-[1.3]"
        iframeClassName="w-full h-full pointer-events-none"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60" />
    </div>
  )
}

export default TvPlayer