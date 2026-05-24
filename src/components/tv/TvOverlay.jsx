import TvQr from "./TvQr"

function TvOverlay({
  currentSong,
  qrUrl,
}) {

  if (!currentSong) return null

  return (

    <div className="absolute inset-0 z-30 pointer-events-none">

      {/* BOTTOM INFO */}
      <div
        className="
          absolute bottom-0 left-0 right-0
          p-6 md:p-10
        "
      >

        <div
          className="
            max-w-4xl
            animate-[tvOverlayIn_0.6s_ease]
          "
        >

          <div
            className="
              inline-flex items-center gap-3
              px-5 py-3
              rounded-full
              bg-black/40
              border border-white/10
              backdrop-blur-2xl
              mb-5
            "
          >

            <div
              className="
                w-3 h-3
                bg-red-500
                rounded-full
                animate-pulse
              "
            />

            <span
              className="
                text-white
                font-black
                tracking-[0.2em]
              "
            >
              EN VIVO
            </span>

          </div>

          <h1
            className="
              text-white
              text-3xl md:text-6xl
              font-black
              leading-tight
              drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]
            "
          >
            {currentSong.title}
          </h1>

          <div className="flex items-center gap-4 mt-6">

            {currentSong.avatar && (

              <img
                src={currentSong.avatar}
                className="
                  w-14 h-14 md:w-20 md:h-20
                  rounded-full
                  border border-cyan-400
                  object-cover
                "
              />

            )}

            <div>

              <p className="text-zinc-400 text-sm md:text-lg">
                Cantando ahora
              </p>

              <p
                className="
                  text-cyan-400
                  text-2xl md:text-4xl
                  font-black
                "
              >
                {currentSong.artist_name}
              </p>

            </div>

          </div>

        </div>

      </div>

      <TvQr qrUrl={qrUrl} />

    </div>
  )
}

export default TvOverlay