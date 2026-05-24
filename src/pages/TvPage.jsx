import { useEffect, useState } from "react"
import supabase from "../services/supabase"

import TvPlayer from "../components/tv/TvPlayer"
import TvIntro from "../components/tv/TvIntro"
import TvLoading from "../components/tv/TvLoading"
import TvOverlay from "../components/tv/TvOverlay"
import TvIdle from "../components/tv/TvIdle"
import TvBackground from "../components/tv/TvBackground"

import useTvRealtime from "../hooks/useTvRealtime"
import useTvQueue from "../hooks/useTvQueue"
import useTvPlayer from "../hooks/useTvPlayer"

function TvPage() {

  const [queue, setQueue] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [loadingSong, setLoadingSong] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [qrUrl, setQrUrl] = useState("")

  useEffect(() => {
    setQrUrl(window.location.origin)
  }, [])

  // INITIAL LOAD
  useEffect(() => {

    async function load() {

      const { data: playing } = await supabase
        .from("songs_queue")
        .select("*")
        .eq("status", "playing")
        .maybeSingle()

      const { data: pending } = await supabase
        .from("songs_queue")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true })

      setQueue(pending || [])

      if (playing) setCurrentSong(playing)
    }

    load()

  }, [])

  // REALTIME
  useTvRealtime({
    setQueue,
    setCurrentSong,
    setShowIntro,
    setLoadingSong,
  })

  // AUTO NEXT
  useTvQueue({
    queue,
    currentSong,
    setCurrentSong,
  })

  // PLAYER CONTROL
  const {
    handleReady,
    handleStateChange,
    handleError,
  } = useTvPlayer({
    setLoadingSong,
    setCurrentSong,
  })

  const idle = !currentSong

  return (

    <div className="w-screen h-screen relative overflow-hidden bg-black">

      {/* BACKGROUND */}
      <TvBackground idle={idle} />

      {/* PLAYER */}
      <TvPlayer
        currentSong={currentSong}
        onReady={handleReady}
        onStateChange={handleStateChange}
        onError={handleError}
      />

      {/* LOADING */}
      {loadingSong && <TvLoading />}

      {/* INTRO */}
      {showIntro && (
        <TvIntro currentSong={currentSong} />
      )}

      {/* OVERLAY */}
      {!showIntro && currentSong && (
        <TvOverlay
          currentSong={currentSong}
          qrUrl={qrUrl}
        />
      )}

      {/* IDLE */}
      {idle && (
        <TvIdle
          qrUrl={qrUrl}
          queue={queue}
        />
      )}

    </div>
  )
}

export default TvPage