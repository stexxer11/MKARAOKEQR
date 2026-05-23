function QueueList({ queue }) {

  return (

    <div className="relative px-4 mt-8">

      <h2 className="text-lg font-black mb-3">
        Cola ({queue.length})
      </h2>

      <div className="space-y-2">

        {queue.map(song => (

          <div
            key={song.id}
            className="glass border border-zinc-800 rounded-lg p-3 text-sm"
          >
            🎵 {song.title}
          </div>

        ))}

      </div>

    </div>
  )
}

export default QueueList