import TvQr from "./TvQr"

function TvIdle({ qrUrl, queue }) {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden">

      {/* LOGO ARRIBA */}
      <div className="absolute top-10 text-center z-10">
        <h1 className="text-7xl font-black text-cyan-400 animate-tvLogo">
          MKARAOKE
        </h1>

        <p className="text-zinc-400 mt-4 text-xl">
          Escanea y canta desde tu celular
        </p>
      </div>

      {/* QR GRANDE CENTRO */}
      <TvQr
        qrUrl={qrUrl}
        size={280}
        className="z-20"
      />

      {/* COLA */}
      {!!queue.length && (
        <div className="absolute bottom-8 z-10">
          <div className="px-6 py-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
            <span className="text-white font-bold">
              {queue.length} canciones en espera
            </span>
          </div>
        </div>
      )}

    </div>
  )
}

export default TvIdle