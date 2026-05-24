function TvIntro({ currentSong }) {

  if (!currentSong) return null

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 backdrop-blur-xl">

      <div className="text-center animate-[fadeIn_0.8s_ease]">

        <p className="text-cyan-300 text-3xl font-bold tracking-[0.4em] uppercase mb-8">
          Próximo cantante
        </p>

        <h1 className="text-8xl font-black text-white drop-shadow-[0_0_40px_rgba(34,211,238,0.8)]">
          {currentSong.artist_name || "Invitado"}
        </h1>

        <div className="mt-10 h-1 w-96 mx-auto bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full" />

        <h2 className="mt-10 text-4xl text-white/80 font-semibold max-w-5xl mx-auto">
          {currentSong.title}
        </h2>

      </div>

    </div>
  )
}

export default TvIntro