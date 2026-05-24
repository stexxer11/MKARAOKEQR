// src/components/tv/TvIntro.jsx

function TvIntro({ currentSong }) {
  return (
    <div
      className="
        absolute inset-0 z-40
        flex items-center justify-center
        bg-black/70 backdrop-blur-md
        animate-[tvIntroFadeIn_0.8s_ease]
      "
    >
      <div
        className="
          text-center px-8
          animate-[tvIntroFloat_3s_ease-in-out_infinite]
        "
      >
        <div
          className="
            w-44 h-44 mx-auto mb-8
            rounded-full
            bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600
            p-1
            shadow-[0_0_70px_rgba(34,211,238,0.55)]
          "
        >
          <div
            className="
              w-full h-full rounded-full bg-black
              flex items-center justify-center
              text-6xl font-black text-white
            "
          >
            {(currentSong?.artist_name || "A").charAt(0).toUpperCase()}
          </div>
        </div>

        <p className="text-cyan-300 text-xl font-bold tracking-[0.4em] mb-4">
          EN EL ESCENARIO
        </p>

        <h1 className="text-6xl font-black text-white">
          {currentSong?.artist_name || "Artista"}
        </h1>

        <p className="text-zinc-300 text-2xl mt-5 max-w-4xl">
          {currentSong?.title}
        </p>
      </div>
    </div>
  )
}

export default TvIntro