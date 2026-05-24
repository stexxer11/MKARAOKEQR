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
        "

        iframeClassName="
          absolute inset-0
          w-full h-full
        "

        opts={{
          width: "100%",
          height: "100%",

          playerVars: {

            // =====================
            // AUTOPLAY AGRESIVO
            // =====================

            autoplay: 1,
            mute: 0,

            // =====================
            // PLAYER
            // =====================

            controls: 0,
            disablekb: 1,
            fs: 0,

            iv_load_policy: 3,
            modestbranding: 1,

            playsinline: 1,
            rel: 0,

            start: 0,

            // =====================
            // BACKGROUND PLAYBACK
            // =====================

            enablejsapi: 1,

            origin:
              "https://mkaraokeqr.vercel.app",

            widget_referrer:
              "https://mkaraokeqr.vercel.app",

            // =====================
            // MEJORAS
            // =====================

            cc_load_policy: 0,
            showinfo: 0,

            // IMPORTANTE
            // ayuda en algunos navegadores
            autoplay_policy:
              "no-user-gesture-required",
          },
        }}

        onReady={event => {

          try {

            const player = event.target

            // =====================
            // FORCE PLAY
            // =====================

            player.playVideo()

            setTimeout(() => {
              player.playVideo()
            }, 300)

            setTimeout(() => {

              player.unMute()

              player.setVolume(100)

              player.playVideo()

            }, 800)

            setTimeout(() => {

              player.unMute()

              player.setVolume(100)

              player.playVideo()

            }, 2000)

          } catch {}

          onReady?.(event)
        }}

        onStateChange={event => {

          try {

            const player = event.target

            // =====================
            // SI SE PAUSA SOLO
            // =====================

            if (event.data === 2) {

              setTimeout(() => {

                try {

                  player.playVideo()

                  player.unMute()

                  player.setVolume(100)

                } catch {}

              }, 300)
            }

            // =====================
            // BUFFERING
            // =====================

            if (event.data === 3) {

              setTimeout(() => {

                try {
                  player.playVideo()
                } catch {}

              }, 500)
            }

          } catch {}

          onStateChange?.(event)
        }}

        onError={onError}
      />

    </div>
  )
}

export default TvPlayer