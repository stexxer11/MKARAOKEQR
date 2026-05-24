// src/components/tv/TvIntro.jsx

function TvIntro({ currentSong }) {

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold">
          {currentSong.title}
        </h1>

        <p className="text-2xl mt-4">
          {currentSong.artist_name}
        </p>
      </div>
    </div>
  )
}

export default TvIntro