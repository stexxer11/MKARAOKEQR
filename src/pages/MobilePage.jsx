import { useKaraoke } from "../context/KaraokeContext"
import { searchYouTube } from "../services/youtubeApi"
import Swal from "sweetalert2"
import { useEffect, useRef, useState } from "react"

function MobilePage() {

  const {
    session,
    authLoading,
    loginWithGoogle,
    logout,
    queue,
    addSong,
    currentSong,
    profile,
    setArtistName,
    updateSong,
    deleteSong,
  } = useKaraoke()

  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [addingSong, setAddingSong] = useState(false)
  const [enteringStage, setEnteringStage] = useState(false)
  const [waitingSongId, setWaitingSongId] = useState(null)

  const askedNameRef = useRef(false)
  const searchTimeout = useRef(null)
  const abortRef = useRef(null)
  const cacheRef = useRef({})
  const prevQueueRef = useRef([])

  const swalRef = useRef({
    open: false,
    songId: null,
  })

  const userId = session?.user?.id || null

  // =========================
  // STAGE ENTER
  // =========================

  useEffect(() => {

    if (!enteringStage) return

    const t = setTimeout(() => {
      setEnteringStage(false)
    }, 1300)

    return () => clearTimeout(t)

  }, [enteringStage])

  // =========================
  // SIMPLE GLOBAL SWAL
  // =========================

  const karaokeSwal = {
    background: "#111111",
    color: "#ffffff",

    allowOutsideClick: false,
    allowEscapeKey: false,

    showCloseButton: false,

    customClass: {
      popup: "rounded-2xl border border-zinc-800",
      confirmButton: "bg-cyan-500 px-4 py-2 rounded-xl font-bold",
      denyButton: "bg-red-500 px-4 py-2 rounded-xl font-bold",
      cancelButton: "bg-zinc-700 px-4 py-2 rounded-xl font-bold",
    },

    buttonsStyling: false,
  }

  // =========================
  // SAFE SWAL
  // =========================

  async function safeSwal(config) {

    if (Swal.isVisible()) {
      Swal.close()
    }

    return Swal.fire({
      ...karaokeSwal,
      ...config,
    })
  }

  // =========================
  // FORCE ARTIST NAME
  // =========================

  async function askArtistName() {

    while (true) {

      const { value } = await safeSwal({
        title: "Nombre artístico",
        input: "text",
        inputPlaceholder: "Ej: DJ Rolando",
        confirmButtonText: "Guardar",

        inputValidator: (value) => {
          if (!value || value.trim().length < 2) {
            return "Mínimo 2 caracteres"
          }
        },
      })

      if (!value) continue

      const ok = await setArtistName(value.trim())

      if (ok) return

      await safeSwal({
        icon: "error",
        title: "No se pudo guardar",
      })
    }
  }

  // =========================
  // AUTO ASK NAME
  // =========================

  useEffect(() => {

    if (!session) return
    if (!profile) return
    if (profile.artist_name) return
    if (askedNameRef.current) return

    askedNameRef.current = true

    askArtistName()

  }, [session, profile])

  // =========================
  // SEARCH
  // =========================

  async function handleSearch(value) {

    const q = value ?? query

    if (!q || q.length < 3) return

    if (cacheRef.current[q]) {
      setResults(cacheRef.current[q])
      return
    }

    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()

    abortRef.current = controller

    try {

      setLoadingSearch(true)

      const data = await searchYouTube(q, {
        signal: controller.signal,
      })

      const safeData = data || []

      setResults(safeData)

      cacheRef.current[q] = safeData

    } catch (e) {

      if (e.name !== "AbortError") {

        safeSwal({
          icon: "error",
          title: "No se pudo buscar",
        })
      }

    } finally {

      setLoadingSearch(false)
    }
  }

  // =========================
  // USER STATE
  // =========================

  const myIndex =
    queue?.findIndex(
      s => s.user_id === userId
    )

  const myPosition =
    myIndex >= 0
      ? myIndex + 1
      : null

  const isMyTurn =
    queue?.length > 0 &&
    queue?.[0]?.user_id === userId

  const isInQueue =
    queue?.some(
      s => s.user_id === userId
    )

  // =========================
  // PICK REPLACEMENT
  // =========================

  async function pickReplacementSong() {

    const { value } = await safeSwal({
      title: "Nueva canción",
      input: "text",
      inputPlaceholder: "Buscar reemplazo",
      confirmButtonText: "Guardar",
    })

    if (!value || value.trim().length < 2) {
      return null
    }

    return {
      title: value.trim(),
      thumbnail:
        "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    }
  }

  // =========================
  // PERSISTENT QUEUE MODAL
  // =========================

  async function showQueueSwal(song) {

    if (!song) return

    if (song.user_id !== userId) return

    if (swalRef.current.open) return

    swalRef.current = {
      open: true,
      songId: song.id,
    }

    while (true) {

      const latestSong = queue?.find(
        s => s.id === song.id
      )

      if (!latestSong) {

        Swal.close()

        swalRef.current = {
          open: false,
          songId: null,
        }

        return
      }

      const position =
        queue.findIndex(
          s => s.id === latestSong.id
        ) + 1

      const isPlayingNow =
        queue?.[0]?.id === latestSong.id

      const res = await Swal.fire({
        ...karaokeSwal,

        title: isPlayingNow
          ? "🎤 TU TURNO"
          : `⏳ TURNO #${position}`,

        text: latestSong.title,

        showConfirmButton: !isPlayingNow,
        showDenyButton: !isPlayingNow,
        showCancelButton: false,

        confirmButtonText: "Editar",
        denyButtonText: "Eliminar",

        allowOutsideClick: false,
        allowEscapeKey: false,
      })

      const stillExists = queue?.some(
        s => s.id === latestSong.id
      )

      if (!stillExists) {

        Swal.close()

        swalRef.current = {
          open: false,
          songId: null,
        }

        return
      }

      // =========================
      // DELETE
      // =========================

      if (res.isDenied) {

        const confirm = await safeSwal({
          title: "Eliminar canción",
          text: latestSong.title,
          showCancelButton: true,
          confirmButtonText: "Eliminar",
        })

        if (!confirm?.isConfirmed) continue

        await deleteSong(latestSong.id)

        Swal.close()

        swalRef.current = {
          open: false,
          songId: null,
        }

        return
      }

      // =========================
      // EDIT
      // =========================

      if (res.isConfirmed) {

        const replacement =
          await pickReplacementSong()

        if (!replacement) continue

        const confirm = await safeSwal({
          title: "Confirmar cambio",
          text: replacement.title,
          showCancelButton: true,
          confirmButtonText: "Guardar",
        })

        if (!confirm?.isConfirmed) continue

        await updateSong(latestSong.id, {
          title: replacement.title,
          thumbnail: replacement.thumbnail,
        })
      }
    }
  }

  // =========================
  // ADD SONG
  // =========================

  async function handleAdd(song) {

    if (!session) return

    if (addingSong) return

    if (!userId) return

    try {

      setAddingSong(true)

      const exists = queue?.some(
        s => s.youtube_id === song.id
      )

      if (exists) {

        await safeSwal({
          title: "Ya está en cola",
        })

        return
      }

      const success = await addSong({
        youtubeId: song.id,
        title: song.title,
        thumbnail: song.thumbnail,
      })

      if (!success) return

      setWaitingSongId(song.id)

    } finally {

      setAddingSong(false)
    }
  }

  // =========================
  // REALTIME DETECTION
  // =========================

  useEffect(() => {

    if (!waitingSongId) return

    const mine = queue?.find(
      s =>
        s.user_id === userId &&
        s.youtube_id === waitingSongId
    )

    if (!mine) return

    setWaitingSongId(null)

    showQueueSwal(mine)

  }, [queue, waitingSongId, userId])

  // =========================
  // REMOVAL DETECTION
  // =========================

  useEffect(() => {

    const prevQueue =
      prevQueueRef.current || []

    const currentQueue =
      queue || []

    const deletedSongs =
      prevQueue.filter(
        prev =>
          !currentQueue.some(
            curr => curr.id === prev.id
          )
      )

    prevQueueRef.current = currentQueue

    if (!deletedSongs.length) return

    const myDeletedSong =
      deletedSongs.find(
        s => s.user_id === userId
      )

    if (!myDeletedSong) return

    Swal.close()

    swalRef.current = {
      open: false,
      songId: null,
    }

  }, [queue, userId])

  // =========================
  // AUTO CLOSE
  // =========================

  useEffect(() => {

    if (!swalRef.current?.open) return

    const exists = queue?.some(
      s => s.id === swalRef.current.songId
    )

    if (!exists) {

      Swal.close()

      swalRef.current = {
        open: false,
        songId: null,
      }
    }

  }, [queue])

  // =========================
  // RESTORE AFTER REFRESH
  // =========================

  useEffect(() => {

    if (!session) return

    if (!queue?.length) return

    if (swalRef.current.open) return

    const mine = queue.find(
      s => s.user_id === session.user.id
    )

    if (!mine) return

    const timer = setTimeout(() => {
      showQueueSwal(mine)
    }, 600)

    return () => clearTimeout(timer)

  }, [session, queue])

  // =========================
  // LOGIN SCREEN
  // =========================
/* =========================
   LOADING AUTH (PRIMERO)
========================= */
if (authLoading) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute w-[600px] h-[600px] bg-cyan-500/20 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-300" />

      {/* LOGO (MISMO DEL SISTEMA) */}
      <h1 className="text-5xl font-black tracking-widest relative z-10">
        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          M
        </span>

        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          KARAOKE
        </span>
      </h1>

      {/* SPINNER */}
      <div className="mt-8 relative z-10">
        <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>

      {/* TEXT */}
      <p className="mt-6 text-zinc-400 text-sm relative z-10 animate-pulse">
        Sincronizando sesión...
      </p>

    </div>
  )
}


/* =========================
   STAGE OPENING (ANIMACIÓN LOGIN → APP)
========================= */
if (enteringStage) {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">

      {/* 🌊 MISMO ECOSISTEMA DE LUCES (PECES MK) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="fish fish1" />
        <div className="fish fish2" />
        <div className="fish fish3" />
        <div className="fish fish4" />
        <div className="fish fish5" />
      </div>

      {/* 🌌 BACKLIGHT MK (PALETA UNIFICADA) */}
      <div className="absolute w-[900px] h-[900px] bg-cyan-500/20 blur-[180px] rounded-full animate-pulse" />
      <div className="absolute w-[700px] h-[700px] bg-purple-500/10 blur-[160px] rounded-full animate-pulse delay-300" />

      {/* 🎭 FLASH DE ENTRADA (TIPO ESCENARIO) */}
      <div className="absolute inset-0 bg-black animate-[fadeIn_0.6s_ease-out]" />

      {/* 🎤 LOGO CENTRO (ENTRADA PRO CONCIERTO) */}
      <div className="text-center animate-stageEnter">

        <h1 className="
          text-6xl font-black tracking-widest
          animate-[logoDrop_0.9s_ease-out]
        ">

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            M
          </span>

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            KARAOKE
          </span>

        </h1>

        <p className="text-zinc-400 mt-4 text-sm animate-pulse">
          Entrando al escenario...
        </p>

      </div>

      {/* 🎬 VIBRACIÓN ESCÉNICA */}
      <div className="absolute inset-0 animate-[stageShake_0.6s_ease-in-out]" />

    </div>
  )
}


/* =========================
   LOGIN SCREEN NORMAL
========================= */
if (!session) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden text-white">

      {/* 🌊 LUCES AMBIENTE */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="fish fish1" />
        <div className="fish fish2" />
        <div className="fish fish3" />
        <div className="fish fish4" />
        <div className="fish fish5" />
      </div>

      {/* 🎤 CONTENIDO LOGIN */}
      <div className="relative z-10 text-center px-6 max-w-sm w-full">

        {/* LOGO RESPONSIVE PRO */}
        <div className="
          font-black tracking-widest
          flex items-end justify-center
          leading-none
          text-[clamp(2.5rem,10vw,4rem)]
        ">

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            M
          </span>

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            KARAOKE
          </span>

        </div>

        <p className="text-white mt-3 text-sm">
          Tu karaoke en tiempo real
        </p>

        {/* 🔘 BOTÓN LOGIN */}
        <button
          onClick={async () => {
            setEnteringStage(true)

            await new Promise((r) => setTimeout(r, 200))

            try {
              await loginWithGoogle()
            } catch (e) {
              setEnteringStage(false)
            }
          }}
          className="
            mt-10 w-full h-12 rounded-2xl
            bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500
            text-black font-black
            shadow-[0_0_60px_rgba(34,211,238,0.25)]
            active:scale-95 transition
          "
        >
          Entrar con Google
        </button>

      </div>

    </div>
  )
}
  return (

    <div className="min-h-screen bg-black text-white relative pb-24 overflow-y-auto">

      {/* GLOBAL BACKGROUND GLOW */}
<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

  <div className="absolute w-[900px] h-[900px] bg-cyan-500/10 blur-[180px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
  <div className="relative z-10 pb-24"></div>
</div>

      {/* HEADER */}
      <div className="relative text-center pt-8">

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
        type="button"
        onClick={async () => {

          const ok = await logout()

          if (!ok) {

            Swal.fire({
              title: "Error",
              text: "No se pudo cerrar sesión",
              icon: "error",
              background: "#09090b",
              color: "#fff",
            })
          }
        }}
        className="fixed top-4 right-4 z-50 w-11 h-11 rounded-2xl glass border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black tap"
      >
        ←
      </button>

      {/* SEARCH */}
      <div className="relative px-4 mt-6">

      <form
  onSubmit={(e) => {
    e.preventDefault()
    handleSearch()
  }}
  className="glass border border-cyan-500/20 rounded-xl p-3 flex items-center w-full animate-[searchGlow_3s_ease-in-out_infinite]">

     <input
  value={query}
  onChange={(e) => {
    const value = e.target.value
    setQuery(value)

    clearTimeout(searchTimeout.current)

    searchTimeout.current = setTimeout(() => {
      handleSearch(value)
    }, 800)
  }}
  placeholder="Buscar canción en YouTube..."
  className="
    w-full
    bg-transparent
    outline-none
    px-3
    text-sm text-white
    placeholder:text-zinc-500
    tracking-wide
  "
/>
<button
  type="submit"
  disabled={loadingSearch}
  className="
    relative
    px-4 py-2
    rounded-xl
    font-black text-black text-sm
    bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600
    shadow-[0_10px_30px_rgba(34,211,238,0.35)]
    active:scale-95 transition
    hover:scale-105
  "
>
  {loadingSearch ? "..." : ">"}
</button>

        </form>

      </div>

      {/* NOW PLAYING */}
      {currentSong && (

        <div className="relative px-4 mt-6">

          <div className="glass border border-cyan-500/20 rounded-2xl overflow-hidden">

        
            <div className="p-4">

              <p className="text-cyan-400 text-xs font-bold">
                🔴 SONANDO AHORA
              </p>

              <h2 className="text-lg font-black mt-1">
                {currentSong.title}
              </h2>

              <p className="text-zinc-400 text-sm">
              {currentSong.artist_name}
              </p>

            </div>

          </div>

        </div>
      )}
{/* RESULTS */}
<div className="relative px-4 mt-6 space-y-4">

  {results.map(song => (

    <div
      key={song.id}
      className="
        relative overflow-hidden
        rounded-3xl
        border border-white/10
        bg-gradient-to-br from-white/5 to-white/[0.02]
        backdrop-blur-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        flex items-center gap-4
        p-3
        transition
        active:scale-[0.98]
      "
    >

      {/* glow premium layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.10),transparent_55%)]" />

      {/* THUMBNAIL PRO */}
      <div className="
        relative w-16 h-16 flex-shrink-0
        rounded-2xl overflow-hidden
        border border-white/10
        shadow-[0_10px_30px_rgba(0,0,0,0.6)]
      ">

        {/* shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/40 z-10" />

        <img
          src={song.thumbnail}
          className="
          w-full h-full
          object-cover
          scale-104
          hover:scale-110
          transition-transform duration-300
          brightness-110
          "
        />

        {/* glow corner */}
        <div className="absolute -top-5 -left-5 w-10 h-10 bg-cyan-400/20 blur-2xl rounded-full" />
      </div>

      {/* TEXT */}
      <div className="flex-1 min-w-0 relative z-10">
        <h3 className="text-sm font-semibold text-white line-clamp-2">
          {song.title}
        </h3>

        <p className="text-xs text-zinc-400 mt-1">
          Karaoke track
        </p>
      </div>

      {/* BUTTON ULTRA PRO ADD */}
      <button
        type="button"
        onClick={() => handleAdd(song)}
        disabled={addingSong}
        className="
          relative z-10
          w-12 h-12
          rounded-2xl
          bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600
          shadow-[0_10px_30px_rgba(34,211,238,0.35)]
          flex items-center justify-center
          active:scale-95 transition
          hover:rotate-6
          
        "
      >
        <span className="text-black font-black text-xl">＋</span>
      </button>

    </div>

  ))}

</div>

      {/* QUEUE */}
      <div className="relative px-4 mt-8">

        <h2 className="text-lg font-black mb-3">
          Cola ({queue.length})
        </h2>

        <div className="space-y-2">

          {queue.map(song => (

            <div
              key={song.id}
              className="glass border border-zinc-800 rounded-lg p-3 text-sm"
            >
              🎵 {song.title}
            </div>

          ))}

        </div>

      </div>

    </div>
  )
}

export default MobilePage