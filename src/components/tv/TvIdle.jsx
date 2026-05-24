import TvQr from "./TvQr"

function TvIdle({
  qrUrl,
  queue,
}) {

  return (

    <div
      className="
        absolute inset-0
        grid place-items-center
        overflow-hidden
        bg-black
      "
    >

      {/* GLOW AMBIENTE */}
      <div
        className="
          absolute
          w-[1100px]
          h-[1100px]
          bg-cyan-500/10
          blur-[180px]
          rounded-full
          animate-tvGlow
        "
      />

      <div
        className="
          absolute
          w-[800px]
          h-[800px]
          bg-purple-500/10
          blur-[180px]
          rounded-full
          bottom-[-250px]
          right-[-150px]
        "
      />

      {/* LOGO ARRIBA */}
      <div
        className="
          absolute
          top-10
          left-1/2
          -translate-x-1/2
          z-10
          text-center
          animate-[fadeIn_0.8s_ease]
        "
      >

        <h1
          className="
            text-6xl
            md:text-8xl
            font-black
            tracking-widest
            animate-tvLogo
          "
        >

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
            mt-5
            text-lg
            md:text-2xl
            tracking-wide
          "
        >
          Escanea y canta desde tu celular
        </p>

      </div>

      {/* QR GRANDE CENTRADO */}
      <div
        className="
          relative
          z-20
          flex items-center justify-center
          animate-[fadeIn_1s_ease]
        "
      >

        <TvQr
          qrUrl={qrUrl}
          size={280}
          className="
            animate-tvQr
          "
        />

      </div>

      {/* COLA ABAJO */}
      {queue.length > 0 && (

        <div
          className="
            absolute
            bottom-8
            left-1/2
            -translate-x-1/2
            z-20
          "
        >

          <div
            className="
              px-6
              py-3
              rounded-2xl
              bg-black/45
              border
              border-white/10
              backdrop-blur-xl
              shadow-[0_0_30px_rgba(0,0,0,0.35)]
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