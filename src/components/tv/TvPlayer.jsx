import YouTube from "react-youtube"

function TvPlayer({
  currentSong,
  onReady,
  onStateChange,
  onError,
}) {

  if (!currentSong) return null

  return (

    <div className="absolute inset-0 z-0 bg-black overflow-hidden">

      <YouTube
        key={currentSong.id}

        videoId={currentSong.youtube_id}

        className="
          absolute inset-0
          w-full h-full
          pointer-events-none
        "

        iframeClassName="
          absolute inset-0
          w-full h-full
          pointer-events-none
        "

        opts={{
          width: "100%",
          height: "100%",

          playerVars: {
            autoplay: 1,
            mute: 1,

            controls: 0,
            disablekb: 1,
            fs: 0,

            iv_load_policy: 3,
            modestbranding: 1,

            playsinline: 1,
            rel: 0,

            start: 0,

            enablejsapi: 1,

            origin: "https://mkaraokeqr.vercel.app",

            // IMPORTANTE
            widget_referrer:
              "https://mkaraokeqr.vercel.app",
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