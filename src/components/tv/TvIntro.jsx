function TvIntro({ currentSong }) {

  if (!currentSong) return null

  return (

    <div
      className="
        absolute inset-0 z-[100]
        bg-black/95
        overflow-hidden
        flex items-center justify-center
      "
    >

      {/* GLOW */}
      <div
        className="
          absolute
          w-[1000px]
          h-[1000px]
          bg-cyan-500/20
          rounded-full
          blur-[180px]
          animate-pulse
        "
      />

      {/* CONTENT */}
      <div
        className="
          relative z-20
          text-center px-10
          animate-[tvSongReveal_0.8s_cubic-bezier(0.22,1,0.36,1)]
        "
      >

        <p
          className="
            text-cyan-400
            text-2xl
            tracking-[0.5em]
            mb-6
            font-black
          "
        >
          SIGUIENTE ARTISTA
        </p>

        {currentSong.avatar && (

          <img
            src={currentSong.avatar}
            className="
              w-40 h-40
              rounded-full
              mx-auto
              object-cover
              border-4 border-cyan-400
              shadow-[0_0_90px_rgba(34,211,238,0.7)]
            "
          />

        )}

        <h1
          className="
            text-white
            text-7xl
            font-black
            mt-8
            uppercase
            tracking-wide
          "
        >
          {currentSong.artist_name}
        </h1>

        <p
          className="
            text-zinc-400
            text-2xl
            mt-6
          "
        >
          {currentSong.title}
        </p>

      </div>

    </div>
  )
}

export default TvIntro