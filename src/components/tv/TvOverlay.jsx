import TvQr from "./TvQr"

function TvOverlay({ currentSong, qrUrl }) {
  if (!currentSong) return null

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      
      <div className="absolute bottom-0 left-0 right-0 p-6">
        
        <div className="max-w-3xl">
          
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />

            <span className="text-white font-bold">
              EN VIVO
            </span>
          </div>

          <h1 className="text-white text-4xl font-black">
            {currentSong.title}
          </h1>

          <div className="flex items-center gap-4 mt-4">
            
            {currentSong.avatar && (
              <img
                src={currentSong.avatar}
                alt={currentSong.artist_name}
                className="w-14 h-14 rounded-full object-cover"
              />
            )}

            <div>
              <p className="text-zinc-400 text-sm">
                Cantando ahora
              </p>

              <p className="text-cyan-400 text-2xl font-bold">
                {currentSong.artist_name}
              </p>
            </div>

          </div>

        </div>

      </div>

      <TvQr qrUrl={qrUrl} />
    </div>
  )
}

export default TvOverlay