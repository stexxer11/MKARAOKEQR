import TvQr from "./TvQr"

function TvOverlay({ currentSong, qrUrl }) {

  if (!currentSong) return null

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">

      <div className="absolute top-8 left-8 px-8 py-5 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10">

        <p className="text-cyan-300 text-sm font-black tracking-[0.35em] uppercase">
          Cantando ahora
        </p>

        <h1 className="mt-2 text-4xl font-black text-white">
          {currentSong.artist_name || "Invitado"}
        </h1>

        <p className="mt-2 text-xl text-white/70 max-w-xl truncate">
          {currentSong.title}
        </p>

      </div>

      <div className="absolute top-8 right-8">
        <TvQr qrUrl={qrUrl} />
      </div>

    </div>
  )
}

export default TvOverlay