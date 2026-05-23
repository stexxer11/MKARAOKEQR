import { useEffect, useState, useRef } from "react"
import YouTube from "react-youtube"
import { QRCodeCanvas } from "qrcode.react"
import supabase from "../services/supabase"

function TvPage() {

  const [queue, setQueue] = useState([])

  const [currentSong, setCurrentSong] = useState(null)

  const [loadingSong, setLoadingSong] = useState(false)

  const [showIntro, setShowIntro] = useState(false)

  const [qrUrl, setQrUrl] = useState("")

  const playerRef = useRef(null)

  const processingRef = useRef(false)

  // =====================
  // QR
  // =====================

  useEffect(() => {
    setQrUrl(window.location.origin)
  }, [])

  // =====================
  // INITIAL LOAD
  // =====================

  useEffect(() => {

    async function load() {

      // =====================
      // PLAYING
      // =====================

      const { data: playing } = await supabase
        .from("songs_queue")
        .select("*")
        .eq("status", "playing")
        .maybeSingle()

      // =====================
      // PENDING
      // =====================

      const { data: pending } = await supabase
        .from("songs_queue")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true })

      setQueue(pending || [])

      // =====================
      // RESTORE CURRENT SONG
      // =====================

      if (
        playing &&
        playing.youtube_id &&
        playing.title &&
        playing.artist_name
      ) {

        setCurrentSong(playing)

      } else if (pending?.length > 0) {

        // =====================
        // AUTO START FIRST SONG
        // =====================

        const next = pending[0]

        await supabase
          .from("songs_queue")
          .update({
            status: "playing",
          })
          .eq("id", next.id)
      }
    }

    load()

  }, [])

  // =====================
  // REALTIME
  // =====================

  useEffect(() => {

    const channel = supabase

      .channel("tv-live")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "songs_queue",
        },

        async (payload) => {

          const {
            eventType,
            new: newRow,
            old: oldRow,
          } = payload

          // =====================
          // DELETE
          // =====================

          if (eventType === "DELETE") {

            setQueue(prev =>
              prev.filter(s => s.id !== oldRow.id)
            )

            setCurrentSong(prev => {

              if (prev?.id === oldRow.id) {
                return null
              }

              return prev
            })

            return
          }

          const row = newRow

          if (!row) return

          // =====================
          // SAFETY
          // =====================

          if (
            !row.youtube_id ||
            !row.title ||
            !row.artist_name
          ) {
            return
          }

          // =====================
          // PLAYING
          // =====================

          if (row.status === "playing") {

            setLoadingSong(true)

            setShowIntro(true)

            setQueue(prev =>
              prev.filter(s => s.id !== row.id)
            )

            // =====================
            // WAIT FULL DATA
            // =====================

            setTimeout(() => {

              setCurrentSong(row)

            }, 700)

            // =====================
            // HIDE INTRO
            // =====================

            setTimeout(() => {

              setShowIntro(false)

            }, 4200)

            return
          }

          // =====================
          // PENDING
          // =====================

          if (row.status === "pending") {

            setQueue(prev => {

              const exists = prev.find(
                s => s.id === row.id
              )

              if (exists) {

                return prev.map(s =>
                  s.id === row.id
                    ? row
                    : s
                )
              }

              return [...prev, row].sort(
                (a, b) =>
                  new Date(a.created_at) -
                  new Date(b.created_at)
              )
            })

            return
          }

          // =====================
          // FALLBACK UPDATE
          // =====================

          setQueue(prev =>
            prev.map(s =>
              s.id === row.id
                ? row
                : s
            )
          )
        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [])

  // =====================
  // AUTO NEXT
  // =====================

  useEffect(() => {

    if (processingRef.current) return

    if (currentSong) return

    if (queue.length === 0) return

    const next = queue[0]

    if (!next) return

    processingRef.current = true

    supabase
      .from("songs_queue")
      .update({
        status: "playing",
      })
      .eq("id", next.id)
      .then(() => {

        processingRef.current = false

      })

  }, [queue, currentSong])

  // =====================
  // NEXT SONG
  // =====================

  async function handleNext() {

    if (!currentSong) return

    if (processingRef.current) return

    processingRef.current = true

    // =====================
    // DELETE SONG
    // =====================

    await supabase
      .from("songs_queue")
      .delete()
      .eq("id", currentSong.id)

    try {

      playerRef.current?.stopVideo()

    } catch (e) {}

    setCurrentSong(null)

    processingRef.current = false
  }

  // =====================
  // PLAYER READY
  // =====================

  const handleReady = (e) => {

    playerRef.current = e.target

    try {

      e.target.unMute()

      e.target.setVolume(100)

      e.target.playVideo()

    } catch (e) {}

    setLoadingSong(false)
  }

  // =====================
  // PLAYER STATES
  // =====================

  const handleStateChange = async (e) => {

    // ENDED

    if (e.data === 0) {

      await handleNext()
    }

    // PLAYING

    if (e.data === 1) {

      try {

        playerRef.current?.unMute()

        playerRef.current?.setVolume(100)

      } catch (e) {}
    }

    // PAUSED

    if (e.data === 2) {

      setTimeout(() => {

        try {

          playerRef.current?.playVideo()

        } catch (e) {}

      }, 250)
    }
  }

  // =====================
  // PLAYER ERROR
  // =====================

  const handleError = async () => {

    await handleNext()
  }

  // =====================
  // KEEP PLAYING
  // =====================

  useEffect(() => {

    const resume = () => {

      try {

        playerRef.current?.playVideo()

        playerRef.current?.unMute()

        playerRef.current?.setVolume(100)

      } catch (e) {}
    }

    window.addEventListener(
      "focus",
      resume,
      { passive: true }
    )

    document.addEventListener(
      "visibilitychange",
      resume,
      { passive: true }
    )

    return () => {

      window.removeEventListener(
        "focus",
        resume
      )

      document.removeEventListener(
        "visibilitychange",
        resume
      )
    }

  }, [])

  // =====================
  // YOUTUBE OPTIONS
  // =====================

  const opts = {

    width: "100%",

    height: "100%",

    host: "https://www.youtube-nocookie.com",

    playerVars: {

      autoplay: 1,

      controls: 0,

      rel: 0,

      fs: 0,

      modestbranding: 1,

      playsinline: 1,

      mute: 0,

      origin: window.location.origin,

      enablejsapi: 1,

      iv_load_policy: 3,
    },
  }

  const idle = !currentSong

  return (

    <div className="w-screen h-screen bg-black overflow-hidden relative">

      {/* =====================
          BACKGROUND VIDEO
      ===================== */}

      {currentSong && (

        <div className="absolute inset-0">

          <YouTube
            videoId={currentSong.youtube_id}
            opts={opts}
            onReady={handleReady}
            onStateChange={handleStateChange}
            onError={handleError}
            className="w-full h-full scale-[1.35]"
            iframeClassName="w-full h-full pointer-events-none"
          />

          {/* OVERLAY */}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/70" />

        </div>
      )}

      {/* =====================
          LOADING
      ===================== */}

      {loadingSong && (

        <div className="absolute inset-0 z-[90] bg-black flex items-center justify-center">

          <div className="text-center animate-pulse">

            <div className="w-24 h-24 border-[5px] border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />

            <p className="text-white text-xl mt-10 font-bold tracking-widest">
              PREPARANDO ESCENARIO
            </p>

          </div>

        </div>
      )}

      {/* =====================
          INTRO ANIMATION
      ===================== */}

      {showIntro && currentSong && (

        <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">

          {/* GLOW */}

          <div className="absolute w-[1000px] h-[1000px] bg-cyan-500/20 rounded-full blur-[180px]" />

          {/* CONTENT */}

          <div className="relative z-20 text-center px-10 animate-[fadeIn_0.8s_ease]">

            <p className="text-cyan-400 text-2xl tracking-[0.4em] mb-6 font-bold">
              SIGUIENTE ARTISTA
            </p>

            {currentSong.avatar && (

              <img
                src={currentSong.avatar}
                className="w-40 h-40 rounded-full mx-auto border-4 border-cyan-400 object-cover shadow-[0_0_80px_rgba(34,211,238,0.8)]"
              />
            )}

            <h1 className="text-white text-7xl font-black mt-8 uppercase tracking-wide">

              {currentSong.artist_name}

            </h1>

            <p className="text-zinc-400 text-2xl mt-6">

              {currentSong.title}

            </p>

          </div>

        </div>
      )}

      {/* =====================
          CURRENT SONG INFO
      ===================== */}

      {currentSong && !showIntro && (

        <div className="absolute inset-0 z-30 pointer-events-none">

          {/* BOTTOM INFO */}

          <div className="absolute bottom-0 left-0 right-0 p-10">

            <div className="max-w-5xl animate-[fadeIn_0.5s_ease]">

              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-2xl mb-6">

                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />

                <span className="text-white font-black tracking-widest">
                  EN VIVO
                </span>

              </div>

              <h1 className="text-white text-6xl font-black leading-tight drop-shadow-[0_0_25px_rgba(0,0,0,0.9)]">

                {currentSong.title}

              </h1>

              <div className="flex items-center gap-5 mt-8">

                {currentSong.avatar && (

                  <img
                    src={currentSong.avatar}
                    className="w-20 h-20 rounded-full border-2 border-cyan-400 object-cover"
                  />
                )}

                <div>

                  <p className="text-zinc-400 text-lg">
                    Cantando ahora
                  </p>

                  <p className="text-cyan-400 text-4xl font-black">

                    {currentSong.artist_name}

                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* QR FIXED */}

          <div className="absolute top-8 right-8">

            <div className="bg-white p-4 rounded-[2rem] shadow-2xl">

              {qrUrl && (

                <QRCodeCanvas
                  value={qrUrl}
                  size={160}
                />
              )}

            </div>

          </div>

        </div>
      )}

      {/* =====================
          IDLE SCREEN
      ===================== */}

      {idle && (

        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">

          {/* GLOW */}

          <div className="absolute w-[1100px] h-[1100px] bg-cyan-500/10 blur-[200px] rounded-full" />

          {/* TITLE */}

          <div className="relative z-10 text-center animate-[fadeIn_1s_ease]">

            <h1 className="text-8xl font-black tracking-widest">

              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                M
              </span>

              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                KARAOKE
              </span>

            </h1>

            <p className="text-zinc-400 mt-8 text-2xl tracking-wide">

              Escanea y canta desde tu celular

            </p>

          </div>

          {/* QR */}

          <div className="relative z-10 mt-14 bg-white p-8 rounded-[2.5rem] animate-[fadeIn_1.2s_ease]">

            {qrUrl && (

              <QRCodeCanvas
                value={qrUrl}
                size={340}
              />
            )}

          </div>

          {/* QUEUE */}

          {queue.length > 0 && (

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">

              <div className="px-8 py-4 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-2xl">

                <span className="text-white text-xl font-black">

                  {queue.length} canciones en espera

                </span>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  )
}

export default TvPage 