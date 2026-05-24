// src/components/tv/TvPlayer.jsx

import YouTube from "react-youtube"

function TvPlayer({
  currentSong,
  onReady,
  onStateChange,
  onError,
}) {

  if (!currentSong) return null

  return (
    <YouTube
      videoId={currentSong.video_id}
      opts={{
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
        },
      }}
      onReady={onReady}
      onStateChange={onStateChange}
      onError={onError}
      className="absolute inset-0 w-full h-full"
    />
  )
}

export default TvPlayer