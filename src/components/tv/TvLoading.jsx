function TvLoading() {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-lg">

      <div className="text-center">

        <div className="w-24 h-24 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />

        <p className="mt-8 text-3xl font-bold tracking-widest text-white">
          Cargando canción...
        </p>

      </div>

    </div>
  )
}

export default TvLoading