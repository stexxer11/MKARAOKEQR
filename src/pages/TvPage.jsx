import { useEffect, useState } from "react"
import supabase from "../services/supabase"

import TvPlayer from "../components/tv/TvPlayer"
import TvIntro from "../components/tv/TvIntro"
import TvLoading from "../components/tv/TvLoading"
import TvOverlay from "../components/tv/TvOverlay"
import TvIdle from "../components/tv/TvIdle"


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

      if (playing) {
        setCurrentSong(playing)
        setLoadingSong(true)
        setShowIntro(false)
      }
    }

    load()
  }, [])

  useTvRealtime({
    setQueue,
    setCurrentSong,
    setLoadingSong,
    setShowIntro,
  })

  useTvQueue({
    queue,
    currentSong,
    setCurrentSong,
    setLoadingSong,
  })

  const {
    handleReady,
    handleStateChange,
    handleError,
  } = useTvPlayer({
    currentSong,
    setCurrentSong,
    setLoadingSong,
    setShowIntro,
  })

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">

      <TvPlayer
        currentSong={currentSong}
        onReady={handleReady}
        onStateChange={handleStateChange}
        onError={handleError}
      />

      {loadingSong && <TvLoading />}

      {showIntro && currentSong && (
        <TvIntro currentSong={currentSong} />
      )}

      {!loadingSong && !showIntro && currentSong && (
        <TvOverlay
          currentSong={currentSong}
          qrUrl={qrUrl}
        />
      )}

      {!currentSong && !loadingSong && (
        <TvIdle
          qrUrl={qrUrl}
          queue={queue}
        />
      )}

    </div>
  )
}

export default TvPage