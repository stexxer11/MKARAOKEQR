import TvQr from "./TvQr"

function TvIdle({ qrUrl, queue }) {
  return (
    <div className="absolute inset-0 grid place-items-center">

      {/* LOGO ARRIBA (no afecta el centro) */}
      <div className="absolute top-10 text-center z-10">
        <h1 className="text-7xl font-black text-cyan-400">
          MKARAOKE
        </h1>

        <p className="text-zinc-400 mt-4 text-xl">
          Escanea y canta desde tu celular
        </p>
      </div>

      {/* QR PERFECTAMENTE CENTRADO */}
      <div className="z-20 flex items-center justify-center">
        <TvQr qrUrl={qrUrl} className="w-80 h-80" />
      </div>

      {/* COLA ABAJO */}
      {!!queue.length && (
        <div className="absolute bottom-8 z-10">
          <div className="px-5 py-3 rounded-2xl bg-black/40 border border-white/10">
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