import TvQr from "./TvQr"

function TvIdle({ qrUrl, queue }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      
      {/* LOGO */}
      <div className="text-center z-10 mb-10">
        <h1 className="text-7xl font-black text-cyan-400">
          MKARAOKE
        </h1>

        <p className="text-zinc-400 mt-4 text-xl">
          Escanea y canta desde tu celular
        </p>
      </div>

      {/* QR GRANDE CENTRO */}
      <TvQr qrUrl={qrUrl} className="w-80 h-80" />

      {/* COLA */}
      {!!queue.length && (
        <div className="absolute bottom-8">
          <div className="px-5 py-3 rounded-2xl bg-black/40">
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