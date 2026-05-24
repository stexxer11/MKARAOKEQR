import { useEffect, useRef, useState } from "react"
import supabase from "../services/supabase"

import TvPlayer from "../components/tv/TvPlayer"
import TvIntro from "../components/tv/TvIntro"
import TvLoading from "../components/tv/TvLoading"
import TvOverlay from "../components/tv/TvOverlay"
import TvIdle from "../components/tv/TvIdle"
import TvQr from "../components/tv/TvQr"

import useTvRealtime from "../hooks/useTvRealtime"

function TvPage() {

  const [queue, setQueue] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [loadingSong, setLoadingSong] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [qrUrl, setQrUrl] = useState("")

  const processingRef = useRef(false)

  useEffect(() => {
    setQrUrl(window.location.origin)
  }, [])

  // LOAD INITIAL
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

  // REALTIME HOOK
  useTvRealtime({
    setQueue,
    setCurrentSong,
    setShowIntro,
    setLoadingSong,
  })

  // AUTO NEXT FIX
  useEffect(() => {

    if (processingRef.current) return
    if (currentSong) return
    if (queue.length === 0) return

    const next = queue[0]

    processingRef.current = true

    supabase
      .from("songs_queue")
      .update({ status: "playing" })
      .eq("id", next.id)
      .then(() => {
        processingRef.current = false
      })

  }, [queue, currentSong])

  const idle = !currentSong

  return (

    <div className="w-screen h-screen bg-black overflow-hidden relative">

      {/* PLAYER */}
      <TvPlayer
        currentSong={currentSong}
        onReady={() => setLoadingSong(false)}
        onStateChange={(e) => {
          if (e.data === 0) {
            supabase
              .from("songs_queue")
              .delete()
              .eq("id", currentSong.id)
              .then(() => setCurrentSong(null))
          }
        }}
        onError={() => setCurrentSong(null)}
      />

      {/* LOADING */}
      {loadingSong && <TvLoading />}

      {/* INTRO */}
      {showIntro && <TvIntro currentSong={currentSong} />}

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