function SongResults({
  results,
  handleAdd,
}) {

  return (

    <div className="relative px-4 mt-6 space-y-4">

      {results.map(song => (

        <div
          key={song.id}
          className="rounded-3xl border border-white/10 p-3 flex items-center gap-4"
        >

          <img
            src={song.thumbnail}
            className="w-16 h-16 rounded-2xl object-cover"
          />

          <div className="flex-1 min-w-0">

            <h3 className="text-sm font-semibold line-clamp-2">
              {song.title}
            </h3>

          </div>

          <button
            onClick={() => handleAdd(song)}
            className="w-12 h-12 rounded-2xl bg-cyan-400 text-black font-black"
          >
            +
          </button>

        </div>

      ))}

    </div>
  )
}

export default SongResults