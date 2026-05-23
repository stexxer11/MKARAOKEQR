function NowPlayingCard({
  currentSong,
}) {

  if (!currentSong) return null

  return (

    <div className="relative px-4 mt-6">

      <div className="glass border border-cyan-500/20 rounded-2xl overflow-hidden">

        <div className="p-4">

          <p className="text-cyan-400 text-xs font-bold">
            🔴 SONANDO AHORA
          </p>

          <h2 className="text-lg font-black mt-1">
            {currentSong.title}
          </h2>

          <p className="text-zinc-400 text-sm">
            {currentSong.artist_name}
          </p>

        </div>

      </div>

    </div>
  )
}

export default NowPlayingCard