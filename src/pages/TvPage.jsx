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
  const [videoReady, setVideoReady] = useState(false)
  const [qrUrl, setQrUrl] = useState("")

  useEffect(() => {
    setQrUrl(window.location.origin)
  }, [])

  // =====================
  // RESET WHEN SONG CHANGES
  // =====================

  useEffect(() => {

    if (!currentSong) {
      setVideoReady(false)
      setLoadingSong(false)
      setShowIntro(false)
      return
    }

    setVideoReady(false)
    setLoadingSong(true)
    setShowIntro(false)

  }, [currentSong?.id])

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
        setLoadingSong(true)
        setVideoReady(false)
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
    setVideoReady,
  })

  const idle = !currentSong

  return (

    <div className="w-screen h-screen relative overflow-hidden bg-black">

      <TvBackground idle={idle} />

      {/* YOUTUBE OCULTO HASTA QUE REALMENTE ESTÉ REPRODUCIENDO */}
      <TvPlayer
        currentSong={currentSong}
        videoReady={videoReady}
        onReady={handleReady}
        onStateChange={handleStateChange}
        onError={handleError}
      />

      {/* LOADER DJ MIENTRAS EL VIDEO NO ESTÁ LISTO */}
      {currentSong && !videoReady && loadingSong && (
        <TvDjLoader currentSong={currentSong} />
      )}

      {/* INTRO CUANDO YA ESTÁ REPRODUCIENDO */}
      {currentSong && videoReady && showIntro && (
        <TvIntro currentSong={currentSong} />
      )}

      {/* OVERLAY SOLO CUANDO YA ESTÁ TODO LISTO */}
      {currentSong && videoReady && !showIntro && (
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