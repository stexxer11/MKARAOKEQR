import { useEffect, useRef } from "react"
import Swal from "sweetalert2"
import { searchYouTube } from "../services/youtubeApi"

function useQueueModal({
  session,
  queue,
  updateSong,
  deleteSong,
  setArtistName,
  profile,
  setEditingSong,
}) {

  const askedNameRef = useRef(false)

  const queueRef = useRef([])

  const modalRef = useRef({
    open: false,
    songId: null,
    mode: null,
  })

  useEffect(() => {
    queueRef.current = queue || []
  }, [queue])

  // =========================
  // FORCE ARTIST NAME
  // =========================

  useEffect(() => {

    if (!session) return
    if (!profile) return
    if (profile.artist_name) return
    if (askedNameRef.current) return

    askedNameRef.current = true

    askArtistName()

  }, [session, profile])

  async function askArtistName() {

    const { value } = await Swal.fire({
      title: "Nombre artístico",
      input: "text",
      inputPlaceholder: "Ej: DJ Rolando",
      confirmButtonText: "Guardar",
      allowOutsideClick: false,
      background: "#09090b",
      color: "#fff",

      inputValidator: value => {

        if (!value || value.trim().length < 2) {
          return "Mínimo 2 caracteres"
        }
      },
    })

    if (!value) return

    await setArtistName(value.trim())
  }

  // =========================
  // REALTIME MODAL WATCHER
  // =========================

  useEffect(() => {

    if (!session) return

    const mySong = queue?.find(
      song => song.user_id === session.user.id
    )

    if (!mySong) {

      if (modalRef.current.open) {
        Swal.close()
      }

      modalRef.current = {
        open: false,
        songId: null,
        mode: null,
      }

      return
    }

    const position =
      queue.findIndex(song => song.id === mySong.id) + 1

    const isMyTurn =
      mySong.status === "playing" || position === 1

    const nextMode =
      isMyTurn ? "turn" : "waiting"

    const sameModal =
      modalRef.current.open &&
      modalRef.current.songId === mySong.id &&
      modalRef.current.mode === nextMode

    if (sameModal) return

    Swal.close()

    modalRef.current = {
      open: false,
      songId: null,
      mode: null,
    }

    setTimeout(() => {

      if (isMyTurn) {
        showTurnModal(mySong)
      } else {
        showWaitingModal(mySong)
      }

    }, 150)

  }, [queue, session])

  // =========================
  // TURN MODAL
  // =========================

  async function showTurnModal(song) {

    modalRef.current = {
      open: true,
      songId: song.id,
      mode: "turn",
    }

    await Swal.fire({
      title: "ES TU TURNO",
      text: song.title,
      icon: "success",
      confirmButtonText: "Estoy listo",
      allowOutsideClick: false,
      allowEscapeKey: false,
      background: "#09090b",
      color: "#fff",
    })

    modalRef.current = {
      open: false,
      songId: null,
      mode: null,
    }
  }

  // =========================
  // WAITING MODAL
  // =========================

  async function showWaitingModal(song) {

    const currentQueue = queueRef.current

    const position =
      currentQueue.findIndex(s => s.id === song.id) + 1

    modalRef.current = {
      open: true,
      songId: song.id,
      mode: "waiting",
    }

    const res = await Swal.fire({

      title: `TURNO #${position}`,

      html: `
        <div style="margin-top:10px;">

          <img
            src="${song.thumbnail}"
            style="
              width:120px;
              height:120px;
              object-fit:cover;
              border-radius:18px;
              margin:auto;
              margin-bottom:14px;
              border:1px solid rgba(34,211,238,.25);
              box-shadow:0 0 30px rgba(34,211,238,.15);
            "
          />

          <div style="
            font-size:15px;
            line-height:1.4;
            color:white;
            font-weight:600;
            margin-bottom:8px;
          ">
            ${song.title}
          </div>

          <div style="
            color:#71717a;
            font-size:13px;
          ">
            Puedes editar tu canción o salir de la cola.
          </div>

        </div>
      `,

      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: false,

      confirmButtonText: "Editar",
      denyButtonText: "Salir",

      allowOutsideClick: false,
      allowEscapeKey: false,

      background: "#09090b",
      color: "#fff",
    })

    modalRef.current = {
      open: false,
      songId: null,
      mode: null,
    }

    const latestSong = queueRef.current.find(
      s => s.id === song.id
    )

    if (!latestSong) return

    const latestPosition =
      queueRef.current.findIndex(
        s => s.id === song.id
      ) + 1

    const alreadyTurn =
      latestSong.status === "playing" ||
      latestPosition === 1

    if (alreadyTurn) return

    // =========================
    // EDIT
    // =========================

    if (res.isConfirmed) {

      setEditingSong(latestSong)

      await Swal.fire({
        title: "Modo edición activado",
        text: "Busca una nueva canción arriba para reemplazar la actual.",
        icon: "info",
        timer: 1800,
        showConfirmButton: false,
        background: "#09090b",
        color: "#fff",
      })

      return
    }

    // =========================
    // DELETE
    // =========================

    if (res.isDenied) {

      await deleteSong(latestSong.id)

      await Swal.fire({
        title: "Saliste de la cola",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
        background: "#09090b",
        color: "#fff",
      })

      return
    }
  }

  // =========================
  // UNUSED LEGACY FLOW
  // =========================

  async function startEditFlow(oldSong) {
    return
  }

  async function showResultsModal(results) {
    return null
  }

  async function confirmReplacement(oldSong, newSong) {
    return false
  }
}

export default useQueueModal