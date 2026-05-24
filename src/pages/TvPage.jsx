import { useEffect, useState } from "react"
import supabase from "../services/supabase"

import TvPlayer from "../components/tv/TvPlayer"
import TvIntro from "../components/tv/TvIntro"
import TvOverlay from "../components/tv/TvOverlay"
import TvIdle from "../components/tv/TvIdle"
import TvBackground from "../components/tv/TvBackground"
import TvDjLoader from "../components/tv/TvDjLoader"

import useTvRealtime from "../hooks/useTvRealtime"
import useTvQueue from "../hooks/useTvQueue"
import useTvPlayer from "../hooks/useTvPlayer"

function TvPage() {

  const [queue, setQueue] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [loadingSong, setLoadingSong] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [qrUrl, setQrUrl] = useState("")

  // =====================
  // QR URL
  // =====================

  useEffect(() => {
    setQrUrl(window.location.origin)
  }, [])

  // =====================
  // INITIAL LOAD
  // =====================

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
      }
    }

    load()

  }, [])

  // =====================
  // REALTIME
  // =====================

  useTvRealtime({
    setQueue,
    setCurrentSong,
    setShowIntro,
    setLoadingSong,
  })

  // =====================
  // AUTO NEXT
  // =====================

  useTvQueue({
    queue,
    currentSong,
    setCurrentSong,
  })

  // =====================
  // PLAYER CONTROL
  // =====================

  const {
    handleReady,
    handleStateChange,
    handleError,
  } = useTvPlayer({
    currentSong,
    setLoadingSong,
    setCurrentSong,
    setShowIntro,
  })

  // =====================
  // SCREEN STATES
  // =====================

  const idle = !currentSong

  return (

    <div className="w-screen h-screen relative overflow-hidden bg-black">

      {/* BACKGROUND */}
      <TvBackground idle={idle} />

      {/* PLAYER OCULTO / VISIBLE */}
      <TvPlayer
        currentSong={currentSong}
        onReady={handleReady}
        onStateChange={handleStateChange}
        onError={handleError}
      />

      {/* LOADER DJ MIENTRAS YOUTUBE CARGA */}
      {loadingSong && currentSong && (
        <TvDjLoader
          currentSong={currentSong}
        />
      )}

      {/* INTRO CUANDO YA ESTÁ LISTA LA CANCIÓN */}
      {showIntro && currentSong && (
        <TvIntro
          currentSong={currentSong}
        />
      )}

      {/* OVERLAY DE CANCIÓN */}
      {!loadingSong && !showIntro && currentSong && (
        <TvOverlay
          currentSong={currentSong}
          qrUrl={qrUrl}
        />
      )}

      {/* PANTALLA IDLE */}
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