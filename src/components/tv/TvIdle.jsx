import TvQr from "./TvQr"

function TvIdle({
  qrUrl,
  queue,
}) {

  return (

    <div
      className="
        absolute inset-0
        flex flex-col
        items-center justify-center
        overflow-hidden
      "
    >

      <div
        className="
          absolute
          w-[1200px]
          h-[1200px]
          bg-cyan-500/10
          blur-[200px]
          rounded-full
          animate-pulse
        "
      />

      <div
        className="
          relative z-10
          text-center
          animate-[fadeIn_1s_ease]
        "
      >

        <h1 className="text-7xl md:text-8xl font-black tracking-widest">

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            M
          </span>

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            KARAOKE
          </span>

        </h1>

        <p
          className="
            text-zinc-400
            mt-8
            text-lg md:text-2xl
          "
        >
          Escanea y canta desde tu celular
        </p>

      </div>

      <TvQr qrUrl={qrUrl} />

      {queue.length > 0 && (

        <div
          className="
            absolute bottom-8 left-1/2
            -translate-x-1/2
          "
        >

          <div
            className="
              px-6 py-4
              rounded-3xl
              bg-white/10
              border border-white/10
              backdrop-blur-2xl
            "
          >

            <span
              className="
                text-white
                text-lg
                font-black
              "
            >
              {queue.length} canciones en espera
            </span>

          </div>

        </div>

      )}

    </div>
  )
}

export default TvIdle