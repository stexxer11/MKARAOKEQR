import TvQr from "./TvQr"

function TvOverlay({ currentSong, qrUrl }) {

  if (!currentSong) return null

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">

      {/* INFO CANCIÓN */}
      <div
        className="
          absolute bottom-8 left-8
          max-w-4xl
          px-8 py-6
          rounded-3xl
          bg-black/65 backdrop-blur-xl
          border border-white/10
          shadow-2xl
          animate-[songInfoIn_0.8s_ease_forwards]
        "
      >
        <p className="text-cyan-300 text-sm font-black tracking-[0.35em] uppercase">
          Cantando ahora
        </p>

        <h1 className="mt-2 text-5xl font-black text-white">
          {currentSong.artist_name || "Invitado"}
        </h1>

        <p className="mt-3 text-2xl text-white/80 line-clamp-2">
          {currentSong.title}
        </p>
      </div>

      {/* QR ABAJO DERECHA */}
      <div className="absolute bottom-8 right-8 animate-[qrIn_0.9s_ease_forwards]">
        <TvQr qrUrl={qrUrl} />
      </div>

    </div>
  )
}

export default TvOverlay