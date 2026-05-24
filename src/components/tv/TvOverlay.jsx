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
    }, 6500)

    return () => clearTimeout(timer)
  }, [currentSong?.id])

  if (!currentSong) return null

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">

      {/* INFO TEMPORAL */}
      {showInfo && (
        <div className="absolute bottom-0 left-0 right-0 p-8 animate-[songInfoIn_0.6s_ease]">
          <div className="max-w-4xl">

            <div
              className="
                inline-flex items-center gap-3
                px-5 py-3 rounded-full
                bg-black/45 border border-white/10
                backdrop-blur-xl mb-5
              "
            >
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />

              <span className="text-white font-black tracking-[0.25em]">
                EN VIVO
              </span>
            </div>

            <h1
              className="
                text-white text-5xl font-black leading-tight
                drop-shadow-[0_0_25px_rgba(0,0,0,0.9)]
              "
            >
              {currentSong.title}
            </h1>

            <div className="flex items-center gap-5 mt-6">
              {currentSong.avatar && (
                <img
                  src={currentSong.avatar}
                  className="
                    w-16 h-16 rounded-full
                    border border-cyan-400 object-cover
                  "
                />
              )}

              <div>
                <p className="text-zinc-300 text-sm uppercase tracking-wider">
                  Cantando ahora
                </p>

                <p className="text-cyan-400 text-3xl font-black">
                  {currentSong.artist_name}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* QR SIEMPRE ABAJO DERECHA */}
      <TvQr
        qrUrl={qrUrl}
        size={90}
        className="
          absolute bottom-6 right-6 z-50
        "
      />

    </div>
  )
}

export default TvOverlay