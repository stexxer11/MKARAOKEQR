import TvQr from "./TvQr"

function TvIdle({ qrUrl, queue }) {

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black overflow-hidden">

      <div className="absolute w-[1200px] h-[1200px] bg-cyan-500/10 blur-[200px] rounded-full animate-pulse" />

      <div className="relative z-10 text-center px-10">

        <h1 className="text-8xl font-black tracking-widest">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            MKARAOKE
          </span>
        </h1>

        <p className="mt-8 text-3xl text-white/70 font-semibold">
          Escanea el QR y agrega tu canción
        </p>

        <div className="mt-12 flex justify-center">
          <TvQr qrUrl={qrUrl} large />
        </div>

        <div className="mt-12 text-white/60 text-2xl">
          {queue.length > 0
            ? `${queue.length} canción(es) en espera`
            : "La fila está vacía"}
        </div>

      </div>

    </div>
  )
}

export default TvIdle