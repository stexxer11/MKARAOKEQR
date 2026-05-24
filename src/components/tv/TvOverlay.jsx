// src/components/tv/TvOverlay.jsx

function TvOverlay({
  currentSong,
  qrUrl,
}) {

  return (
    <div className="absolute bottom-0 left-0 w-full p-6 text-white bg-black/50">

      <h1 className="text-3xl font-bold">
        {currentSong.title}
      </h1>

      <p>
        {currentSong.artist_name}
      </p>

      <p className="mt-2 text-sm">
        {qrUrl}
      </p>

    </div>
  )
}

export default TvOverlay