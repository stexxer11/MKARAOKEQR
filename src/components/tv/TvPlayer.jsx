import YouTube from "react-youtube"

function TvPlayer({
  currentSong,
  onReady,
  onStateChange,
  onError,
}) {
  if (!currentSong) return null

  // =========================
  // READY
  // =========================

  function handlePlayerReady(event) {

    try {

      // evitar autoplay block
      event.target.mute()

      setTimeout(() => {

        try {

          event.target.playVideo()

          // fullscreen visual limpia
          const iframe = document.querySelector("iframe")

          if (iframe) {

            iframe.setAttribute(
              "allow",
              "autoplay; fullscreen"
            )

            iframe.style.pointerEvents = "none"
          }

        }
        catch (err) {
          console.error("AUTOPLAY PLAY ERROR:", err)
        }

      }, 500)

    }
    catch (err) {
      console.error("AUTOPLAY READY ERROR:", err)
    }

    // callback externo
    if (onReady) {
      onReady(event)
    }
  }

  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden">

      {/* BLOQUEAR CLICKS */}
      <div className="absolute inset-0 z-50" />

      <YouTube
        key={`${currentSong.id}-${currentSong.youtube_id}`}
        videoId={currentSong.youtube_id}

        className="absolute inset-0 w-full h-full"
        iframeClassName="absolute inset-0 w-full h-full"

        opts={{
          width: "100%",
          height: "100%",

          playerVars: {

            // =========================
            // AUTOPLAY
            // =========================

            autoplay: 1,

            // =========================
            // UI OFF
            // =========================

            controls: 0,
            disablekb: 1,
            fs: 0,

            // =========================
            // YOUTUBE CLEAN
            // =========================

            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,

            // =========================
            // MOBILE
            // =========================

            playsinline: 1,

            // =========================
            // API
            // =========================

            enablejsapi: 1,
            origin: window.location.origin,

            // =========================
            // EXTRA CLEAN
            // =========================

            showinfo: 0,
            mute: 1,
          },
        }}

        onReady={handlePlayerReady}
        onStateChange={onStateChange}
        onError={onError}
      />

    </div>
  )
}

export default TvPlayer