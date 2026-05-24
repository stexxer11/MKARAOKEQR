import { useEffect, useState } from "react"
import TvQr from "./TvQr"

function TvOverlay({
  currentSong,
  qrUrl,
}) {
  const [showInfo, setShowInfo] = useState(true)

  useEffect(() => {
    setShowInfo(true)

    const timer = setTimeout(() => {
      setShowInfo(false)
    }, 5500)

    return () => clearTimeout(timer)
  }, [currentSong?.id])

  if (!currentSong) return null

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">

      {/* INFORMACIÓN TEMPORAL */}
      {showInfo && (
        <div
          className="
            absolute left-8 bottom-8
            max-w-4xl
            animate-tvOverlayIn
          "
        >
          <div
            className="
              inline-flex items-center gap-3
              px-5 py-3
              rounded-full
              bg-black/55
              border border-white/10
              backdrop-blur-xl
              mb-5
            "
          >
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />

            <span className="text-white font-black tracking-[0.25em]">
              EN VIVO
            </span>
          </div>

          <h1
            className="
              text-white
              text-4xl
              font-black
              leading-tight
              drop-shadow-[0_0_25px_rgba(0,0,0,0.95)]
            "
          >
            {currentSong.title}
          </h1>

          <div className="flex items-center gap-4 mt-5">
            {currentSong.avatar && (
              <img
                src={currentSong.avatar}
                className="
                  w-14 h-14
                  rounded-full
                  border border-cyan-400
                  object-cover
                "
              />
            )}

            <div>
              <p className="text-zinc-300 text-sm">
                Cantando ahora
              </p>

              <p className="text-cyan-400 text-2xl font-black">
                {currentSong.artist_name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QR FIJO ABAJO DERECHA */}
      <TvQr
        qrUrl={qrUrl}
        size={78}
        className="
          fixed
          bottom-6
          right-6
          z-[999]
          animate-tvQr
        "
      />

    </div>
  )
}

export default TvOverlay