function TvIntro({ currentSong }) {
  if (!currentSong) return null

  return (
    <div
      className="
        absolute inset-0 z-[120]
        bg-black
        flex items-center justify-center
        overflow-hidden
      "
    >

      {/* GLOW BACKGROUND */}
      <div
        className="
          absolute w-[900px] h-[900px]
          rounded-full
          bg-cyan-500/10
          blur-[180px]
          animate-tvGlow
        "
      />

      <div
        className="
          absolute w-[600px] h-[600px]
          rounded-full
          bg-purple-500/10
          blur-[150px]
          animate-pulse
        "
      />

      {/* DJ CARD */}
      <div
        className="
          relative z-20
          text-center
          px-10
          animate-tvSongReveal
        "
      >

        <p
          className="
            text-cyan-400
            text-xl
            font-black
            tracking-[0.45em]
            mb-8
          "
        >
          PREPARANDO ARTISTA
        </p>

        {/* AVATAR DJ */}
        <div className="relative mx-auto w-44 h-44">

          <div
            className="
              absolute inset-0
              rounded-full
              border-4 border-cyan-400/20
              animate-spin
            "
          />

          <div
            className="
              absolute -inset-4
              rounded-full
              border border-purple-500/30
              animate-pulse
            "
          />

          {currentSong.avatar ? (
            <img
              src={currentSong.avatar}
              className="
                w-44 h-44
                rounded-full
                object-cover
                border-4 border-cyan-400
                shadow-[0_0_90px_rgba(34,211,238,0.55)]
              "
            />
          ) : (
            <div
              className="
                w-44 h-44
                rounded-full
                bg-cyan-400/20
                border-4 border-cyan-400
                flex items-center justify-center
                text-7xl font-black text-cyan-300
                shadow-[0_0_90px_rgba(34,211,238,0.55)]
              "
            >
              {currentSong.artist_name?.charAt(0) || "A"}
            </div>
          )}

        </div>

        <h1
          className="
            text-white
            text-5xl
            font-black
            uppercase
            mt-8
          "
        >
          {currentSong.artist_name}
        </h1>

        <p
          className="
            text-zinc-400
            text-xl
            mt-4
            max-w-4xl
          "
        >
          {currentSong.title}
        </p>

        {/* FAKE DJ EQUALIZER */}
        <div className="flex justify-center gap-2 mt-10 h-12 items-end">

          <div className="w-3 bg-cyan-400 rounded-full animate-[djBar_0.8s_ease-in-out_infinite]" />
          <div className="w-3 bg-blue-500 rounded-full animate-[djBar_1s_ease-in-out_infinite]" />
          <div className="w-3 bg-purple-500 rounded-full animate-[djBar_0.7s_ease-in-out_infinite]" />
          <div className="w-3 bg-cyan-400 rounded-full animate-[djBar_1.1s_ease-in-out_infinite]" />
          <div className="w-3 bg-blue-500 rounded-full animate-[djBar_0.9s_ease-in-out_infinite]" />

        </div>

        <p className="text-zinc-500 text-sm mt-6 tracking-[0.3em]">
          SINCRONIZANDO AUDIO
        </p>

      </div>

    </div>
  )
}

export default TvIntro