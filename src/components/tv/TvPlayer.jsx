import YouTube from "react-youtube"

function TvPlayer({
  currentSong,
  onReady,
  onStateChange,
  onError,
}) {

  if (!currentSong) return null

  return (
    <div className="absolute inset-0 z-0 bg-black">
      <YouTube
        videoId={currentSong.youtube_id}
        className="w-full h-full"
        iframeClassName="w-full h-full"
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
        }}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={onError}
      />
    </div>
  )
}

export default TvPlayer