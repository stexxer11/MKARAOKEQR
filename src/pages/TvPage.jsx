import { useEffect, useState, useRef } from "react"
import YouTube from "react-youtube"
import { QRCodeCanvas } from "qrcode.react"
import supabase from "../services/supabase"

function TvPage() {

  const [queue, setQueue] = useState([])

  const [currentSong, setCurrentSong] =
    useState(null)

  const [loadingSong, setLoadingSong] =
    useState(false)

  const [showIntro, setShowIntro] =
    useState(false)

  const [qrUrl, setQrUrl] =
    useState("")

  const playerRef = useRef(null)

  const processingRef = useRef(false)

  // =====================
  // QR
  // =====================

  useEffect(() => {

    setQrUrl(window.location.origin)

  }, [])

  // =====================
  // FULLSCREEN
  // =====================

  useEffect(() => {

    const enterFullscreen =
      async () => {

        try {

          if (
            !document.fullscreenElement
          ) {

            await document
              .documentElement
              .requestFullscreen()
          }

        } catch (e) {}
      }

    window.addEventListener(
      "click",
      enterFullscreen,
      { once: true }
    )

    return () => {

      window.removeEventListener(
        "click",
        enterFullscreen
      )
    }

  }, [])

  // =====================
  // INITIAL LOAD
  // =====================

  useEffect(() => {

    async function load() {

      const { data: playing } =
        await supabase
          .from("songs_queue")
          .select("*")
          .eq("status", "playing")
          .maybeSingle()

      const { data: pending } =
        await supabase
          .from("songs_queue")
          .select("*")
          .eq("status", "pending")
          .order("created_at", {
            ascending: true,
          })

      setQueue(pending || [])

      if (
        playing &&
        playing.youtube_id
      ) {

        setCurrentSong(playing)

      } else if (
        pending?.length > 0
      ) {

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

          // DELETE

          if (
            eventType === "DELETE"
          ) {

            setQueue(prev =>
              prev.filter(
                s => s.id !== oldRow.id
              )
            )

            setCurrentSong(prev => {

              if (
                prev?.id === oldRow.id
              ) {
                return null
              }

              return prev
            })

            return
          }

          const row = newRow

          if (!row) return

          // PLAYING

          if (
            row.status === "playing"
          ) {

            setLoadingSong(true)

            setShowIntro(true)

            setQueue(prev =>
              prev.filter(
                s => s.id !== row.id
              )
            )

            setTimeout(() => {

              setCurrentSong(row)

            }, 500)

            setTimeout(() => {

              setShowIntro(false)

            }, 3500)

            return
          }

          // PENDING

          if (
            row.status === "pending"
          ) {

            setQueue(prev => {

              const exists =
                prev.find(
                  s => s.id === row.id
                )

              if (exists) {

                return prev.map(s =>

                  s.id === row.id
                    ? row
                    : s
                )
              }

              return [
                ...prev,
                row,
              ].sort(
                (a, b) =>

                  new Date(
                    a.created_at
                  ) -

                  new Date(
                    b.created_at
                  )
              )
            })

            return
          }
        }
      )

      .subscribe()

    return () => {

      supabase.removeChannel(
        channel
      )
    }

  }, [])

  // =====================
  // AUTO NEXT
  // =====================

  useEffect(() => {

    if (
      processingRef.current
    ) return

    if (currentSong) return

    if (queue.length === 0)
      return

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

        processingRef.current =
          false
      })

  }, [queue, currentSong])

  // =====================
  // NEXT SONG
  // =====================

  async function handleNext() {

    if (!currentSong)
      return

    if (
      processingRef.current
    ) return

    processingRef.current = true

    await supabase
      .from("songs_queue")
      .delete()
      .eq("id", currentSong.id)

    try {

      playerRef.current
        ?.stopVideo()

    } catch (e) {}

    setCurrentSong(null)

    processingRef.current =
      false
  }

  // =====================
  // PLAYER READY
  // =====================

  const handleReady = (e) => {

    playerRef.current =
      e.target

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

  const handleStateChange =
    async (e) => {

      // ENDED

      if (e.data === 0) {

        await handleNext()
      }

      // PLAYING

      if (e.data === 1) {

        try {

          playerRef.current
            ?.unMute()

          playerRef.current
            ?.setVolume(100)

        } catch (e) {}
      }

      // PAUSED

      if (e.data === 2) {

        setTimeout(() => {

          try {

            playerRef.current
              ?.playVideo()

          } catch (e) {}

        }, 250)
      }
    }

  // =====================
  // PLAYER ERROR
  // =====================

  const handleError =
    async () => {

      await handleNext()
    }

  // =====================
  // KEEP PLAYING
  // =====================

  useEffect(() => {

    const resume = () => {

      try {

        playerRef.current
          ?.playVideo()

        playerRef.current
          ?.unMute()

        playerRef.current
          ?.setVolume(100)

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

    host:
      "https://www.youtube-nocookie.com",

    playerVars: {

      autoplay: 1,

      controls: 0,

      rel: 0,

      fs: 0,

      modestbranding: 1,

      playsinline: 1,

      mute: 0,

      origin:
        window.location.origin,

      enablejsapi: 1,

      iv_load_policy: 3,
    },
  }

  const idle = !currentSong

  return (

    <div className="w-screen h-screen bg-black overflow-hidden relative">

      {/* VIDEO */}

      {currentSong && (

        <div className="absolute inset-0">

          <YouTube
            videoId={
              currentSong.youtube_id
            }
            opts={opts}
            onReady={handleReady}
            onStateChange={
              handleStateChange
            }
            onError={handleError}
            className="w-full h-full scale-[1.18]"
            iframeClassName="w-full h-full pointer-events-none"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/70" />

        </div>
      )}

      {/* LOADING */}

      {loadingSong && (

        <div className="absolute inset-0 z-[90] bg-black flex items-center justify-center">

          <div className="text-center animate-[fadeIn_0.5s_ease]">

            <div className="w-24 h-24 border-[4px] border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />

            <p className="text-white text-lg mt-8 font-black tracking-[0.3em]">
              CARGANDO
            </p>

          </div>

        </div>
      )}

      {/* INTRO */}

      {showIntro &&
        currentSong && (

          <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center overflow-hidden">

            <div className="absolute w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[120px]" />

            <div className="relative z-20 text-center px-10 animate-[songReveal_0.8s_cubic-bezier(0.22,1,0.36,1)]">

              <p className="text-cyan-400 text-xl tracking-[0.5em] mb-5 font-bold">
                SIGUIENTE ARTISTA
              </p>

              {currentSong.avatar && (

                <img
                  src={
                    currentSong.avatar
                  }
                  className="
                  w-32 h-32
                  rounded-full
                  mx-auto
                  border-4 border-cyan-400
                  object-cover
                  shadow-[0_0_60px_rgba(34,211,238,0.45)]
                "
                />
              )}

              <h1 className="text-white text-6xl font-black mt-8 uppercase">

                {
                  currentSong.artist_name
                }

              </h1>

              <p className="text-zinc-400 text-2xl mt-4">

                {
                  currentSong.title
                }

              </p>

            </div>

          </div>
        )}

      {/* CURRENT */}

      {currentSong &&
        !showIntro && (

          <div className="absolute inset-0 z-30 pointer-events-none">

            <div className="absolute bottom-0 left-0 right-0 p-8">

              <div className="max-w-4xl animate-[songInfoIn_0.6s_ease]">

                <div className="
                inline-flex items-center gap-3
                px-4 py-2
                rounded-full
                bg-red-500/15
                border border-red-500/20
                backdrop-blur-xl
                mb-5
              ">

                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />

                  <span className="text-white text-sm font-black tracking-[0.25em]">
                    EN VIVO
                  </span>

                </div>

                <h1 className="
                text-white
                text-5xl
                font-black
                leading-tight
                drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]
              ">

                  {
                    currentSong.title
                  }

                </h1>

                <div className="flex items-center gap-4 mt-6">

                  {currentSong.avatar && (

                    <img
                      src={
                        currentSong.avatar
                      }
                      className="
                      w-16 h-16
                      rounded-full
                      border border-cyan-400
                      object-cover
                    "
                    />
                  )}

                  <div>

                    <p className="text-zinc-400 text-sm uppercase tracking-wider">
                      Cantando ahora
                    </p>

                    <p className="text-cyan-400 text-3xl font-black">

                      {
                        currentSong.artist_name
                      }

                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* QR */}

            <div className="absolute bottom-5 right-5">

              <div className="
              bg-white/95
              p-2
              rounded-2xl
              shadow-2xl
              animate-[fadeIn_0.8s_ease]
            ">

                {qrUrl && (

                  <QRCodeCanvas
                    value={qrUrl}
                    size={85}
                  />
                )}

              </div>

            </div>

          </div>
        )}

      {/* IDLE */}

      {idle && (

        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">

          <div className="absolute w-[900px] h-[900px] bg-cyan-500/10 blur-[180px] rounded-full" />

          <div className="relative z-10 text-center animate-[fadeIn_1s_ease]">

            <h1 className="text-7xl font-black tracking-widest">

              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                M
              </span>

              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                KARAOKE
              </span>

            </h1>

            <p className="text-zinc-400 mt-6 text-xl">

              Escanea y canta desde tu celular

            </p>

          </div>

          <div className="
          relative z-10 mt-10
          bg-white
          p-5
          rounded-[2rem]
          animate-[fadeIn_1.2s_ease]
        ">

            {qrUrl && (

              <QRCodeCanvas
                value={qrUrl}
                size={260}
              />
            )}

          </div>

          {queue.length > 0 && (

            <div className="absolute bottom-10">

              <div className="
              px-6 py-3
              rounded-2xl
              bg-white/10
              border border-white/10
              backdrop-blur-xl
            ">

                <span className="text-white text-lg font-black">

                  {queue.length}
                  {" "}
                  canciones en espera

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