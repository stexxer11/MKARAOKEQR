// src/components/tv/TvIdle.jsx

function TvIdle({
  qrUrl,
  queue,
}) {

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white">

      <h1 className="text-6xl font-bold mb-6">
        MKaraoke
      </h1>

      <p className="mb-10">
        Escanea y pide tu canción
      </p>

      <p className="text-sm mb-10">
        {qrUrl}
      </p>

      <div className="w-[400px]">

        {queue.map(song => (
          <div
            key={song.id}
            className="border-b border-white/20 py-2"
          >
            {song.title}
          </div>
        ))}

      </div>

    </div>
  )
}

export default TvIdle