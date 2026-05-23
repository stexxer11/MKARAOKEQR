import { useKaraoke } from "../context/KaraokeContext"

import useSongSearch from "../hooks/useSongSearch"
import useQueueModal from "../hooks/useQueueModal"
import useStageAnimation from "../hooks/useStageAnimation"
import LoadingScreen from "../components/mobile/LoadingScreen"
import LoginScreen from "../components/mobile/LoginScreen"
import SearchBar from "../components/mobile/SearchBar"
import SongResults from "../components/mobile/SongResults"
import QueueList from "../components/mobile/QueueList"
import NowPlayingCard from "../components/mobile/NowPlayingCard"

function MobilePage() {

  const {
    session,
    authLoading,
    queue,
    currentSong,
    profile,
    loginWithGoogle,
    logout,
    addSong,
    updateSong,
    deleteSong,
    setArtistName,
  } = useKaraoke()

  // =========================
  // STAGE ANIMATION
  // =========================

  const {
    enteringStage,
    startStageEnter,
  } = useStageAnimation()

  // =========================
  // SEARCH
  // =========================

  const {
    query,
    setQuery,
    results,
    loadingSearch,
    handleSearch,
    handleAdd,
  } = useSongSearch({
    session,
    queue,
    addSong,
  })

  // =========================
  // QUEUE MODAL
  // =========================

  useQueueModal({
    session,
    queue,
    updateSong,
    deleteSong,
    setArtistName,
    profile,
  })

  // =========================
  // LOADING
  // =========================

  if (authLoading) {
    return <LoadingScreen />
  }


  // =========================
  // LOGIN
  // =========================

  if (!session) {

    return (

      <LoginScreen
        loginWithGoogle={async () => {

          startStageEnter()

          try {
            await loginWithGoogle()
          } catch (e) {
            console.error(e)
          }
        }}
      />
    )
  }

  // =========================
  // APP
  // =========================

  return (

    <div className="min-h-screen bg-black text-white relative pb-24 overflow-y-auto">

      {/* GLOBAL GLOW */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[900px] h-[900px] bg-cyan-500/10 blur-[180px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* HEADER */}
      <div className="relative text-center pt-8 z-10">

        <h1 className="text-4xl font-black metal-logo">

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            M
          </span>

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            KARAOKE
          </span>

        </h1>

        <p className="text-zinc-400 mt-2 text-sm">
          ARTISTA{" "}
          <span className="text-cyan-400 font-bold">
            {profile?.artist_name || "Sin nombre"}
          </span>
        </p>

      </div>

      {/* LOGOUT */}
      <button
        onClick={logout}
        className="
          fixed top-4 right-4 z-50
          w-11 h-11 rounded-2xl
          glass border border-cyan-500/20
          flex items-center justify-center
          text-cyan-400 font-black
        "
      >
        ←
      </button>

      {/* SEARCH */}
      <SearchBar
        query={query}
        setQuery={setQuery}
        handleSearch={handleSearch}
        loadingSearch={loadingSearch}
      />

      {/* NOW PLAYING */}
      <NowPlayingCard
        currentSong={currentSong}
      />

      {/* RESULTS */}
      <SongResults
        results={results}
        handleAdd={handleAdd}
      />

      {/* QUEUE */}
      <QueueList
        queue={queue}
      />

    </div>
  )
}

export default MobilePage