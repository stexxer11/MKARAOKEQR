import { useCallback, useEffect, useState } from "react"
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

  const [tvStage, setTvStage] = useState("idle")
  const [qrUrl, setQrUrl] = useState("")

  useEffect(() => {
    setQrUrl("https://mkaraokeqr.vercel.app/")
  }, [])

  const loadTvState = useCallback(async () => {
    try {
      const { data: playing, error: playingError } = await supabase
        .from("songs_queue")
        .select("*")
        .eq("status", "playing")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

      if (playingError) throw playingError

      const { data: pending, error: pendingError } = await supabase
        .from("songs_queue")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true })

      if (pendingError) throw pendingError

      setQueue(pending || [])

      if (playing) {
        setCurrentSong(prev => {
          if (prev?.id === playing.id) return prev
          return playing
        })

        setLoadingSong(true)
        setShowIntro(false)
        setTvStage(prev => {
          if (prev === "intro" || prev === "playing") return prev
          return "loading"
        })

        return
      }

      setCurrentSong(null)
      setLoadingSong(false)
      setShowIntro(false)
      setTvStage("idle")

    } catch (error) {
      console.error("loadTvState error:", error)
    }
  }, [])

  useEffect(() => {
    loadTvState()
  }, [loadTvState])

  useTvRealtime({
    loadTvState,
  })

  useTvQueue({
    queue,
    currentSong,
    setCurrentSong,
    setLoadingSong,
    setShowIntro,
    setTvStage,
    loadTvState,
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
    setTvStage,
    loadTvState,
  })

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">

      <TvPlayer
        currentSong={currentSong}
        onReady={handleReady}
        onStateChange={handleStateChange}
        onError={handleError}
      />

      {tvStage === "loading" && <TvLoading />}

      {tvStage === "intro" && currentSong && (
        <TvIntro currentSong={currentSong} />
      )}

      {tvStage === "playing" && currentSong && (
        <TvOverlay
          currentSong={currentSong}
          qrUrl={qrUrl}
        />
      )}

      {tvStage === "idle" && !currentSong && (
        <TvIdle
          qrUrl={qrUrl}
          queue={queue}
        />
      )}

    </div>
  )
}

export default TvPage