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

    const nextMode = isMyTurn ? "turn" : "waiting"

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
      text: song.title,
      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Editar",
      denyButtonText: "Salir de cola",
      cancelButtonText: "Cerrar",
      allowOutsideClick: false,
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

    if (res.isDenied) {
      await confirmDelete(latestSong)
    }
  }

  // =========================
  // DELETE
  // =========================

  async function confirmDelete(song) {
    const res = await Swal.fire({
      title: "¿Salir de la cola?",
      text: song.title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#09090b",
      color: "#fff",
    })

    if (!res.isConfirmed) return

    await deleteSong(song.id)

    await Swal.fire({
      title: "Eliminado",
      text: "Tu canción salió de la cola",
      icon: "success",
      timer: 1200,
      showConfirmButton: false,
      background: "#09090b",
      color: "#fff",
    })
  }

  // =========================
  // EDIT FLOW
  // =========================

  async function startEditFlow(oldSong) {
    while (true) {
      const latestSong = queueRef.current.find(
        s => s.id === oldSong.id
      )

      if (!latestSong) return

      const position =
        queueRef.current.findIndex(
          s => s.id === oldSong.id
        ) + 1

      const isTurn =
        latestSong.status === "playing" ||
        position === 1

      if (isTurn) {
        Swal.close()
        showTurnModal(latestSong)
        return
      }

      const search = await Swal.fire({
        title: "Buscar reemplazo",
        input: "text",
        inputPlaceholder: "Escribe la nueva canción",
        showCancelButton: true,
        confirmButtonText: "Buscar",
        cancelButtonText: "Cancelar",
        background: "#09090b",
        color: "#fff",
        inputValidator: value => {
          if (!value || value.trim().length < 3) {
            return "Mínimo 3 caracteres"
          }
        },
      })

      if (!search.isConfirmed) return

      const query = search.value.trim()

      Swal.fire({
        title: "Buscando...",
        text: "Un momento",
        allowOutsideClick: false,
        showConfirmButton: false,
        background: "#09090b",
        color: "#fff",
        didOpen: () => {
          Swal.showLoading()
        },
      })

      let results = []

      try {
        results = await searchYouTube(query)
      } catch (error) {
        console.error(error)

        await Swal.fire({
          title: "Error",
          text: "No se pudo buscar la canción",
          icon: "error",
          background: "#09090b",
          color: "#fff",
        })

        continue
      }

      if (!results || results.length === 0) {
        await Swal.fire({
          title: "Sin resultados",
          text: "Intenta buscar otra canción",
          background: "#09090b",
          color: "#fff",
        })

        continue
      }

      const selected = await showResultsModal(results)

      if (!selected) continue

      const confirmed = await confirmReplacement(
        latestSong,
        selected
      )

      if (!confirmed) continue

      await updateSong(latestSong.id, {
        youtube_id: selected.id,
        title: selected.title,
        thumbnail: selected.thumbnail,
      })

      await Swal.fire({
        title: "Canción actualizada",
        text: "Tu canción fue reemplazada",
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
  // RESULTS MODAL
  // =========================

  async function showResultsModal(results) {
    const html = `
      <div style="display:flex; flex-direction:column; gap:10px; max-height:360px; overflow:auto;">
        ${results
          .slice(0, 6)
          .map(
            (song, index) => `
              <button 
                class="song-result-btn"
                data-index="${index}"
                style="
                  display:flex;
                  gap:10px;
                  align-items:center;
                  width:100%;
                  padding:10px;
                  border-radius:14px;
                  border:1px solid rgba(34,211,238,.25);
                  background:rgba(255,255,255,.05);
                  color:white;
                  text-align:left;
                  cursor:pointer;
                "
              >
                <img 
                  src="${song.thumbnail}" 
                  style="
                    width:56px;
                    height:56px;
                    border-radius:12px;
                    object-fit:cover;
                    flex-shrink:0;
                  "
                />
                <span style="font-size:13px; line-height:1.3;">
                  ${song.title}
                </span>
              </button>
            `
          )
          .join("")}
      </div>
    `

    return new Promise(resolve => {
      Swal.fire({
        title: "Elige una canción",
        html,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: "Seguir buscando",
        background: "#09090b",
        color: "#fff",
        didOpen: () => {
          const buttons =
            Swal.getPopup().querySelectorAll(".song-result-btn")

          buttons.forEach(button => {
            button.addEventListener("click", () => {
              const index = Number(button.dataset.index)
              Swal.close()
              resolve(results[index])
            })
          })
        },
      }).then(res => {
        if (res.dismiss) {
          resolve(null)
        }
      })
    })
  }

  // =========================
  // CONFIRM REPLACEMENT
  // =========================

  async function confirmReplacement(oldSong, newSong) {
    const res = await Swal.fire({
      title: "Confirmar cambio",
      html: `
        <div style="text-align:left; font-size:14px;">
          <p style="color:#aaa; margin-bottom:8px;">Cambiar de:</p>
          <div style="padding:10px; border-radius:12px; background:rgba(255,255,255,.06); margin-bottom:14px;">
            ${oldSong.title}
          </div>

          <p style="color:#aaa; margin-bottom:8px;">A:</p>
          <div style="padding:10px; border-radius:12px; background:rgba(34,211,238,.12); border:1px solid rgba(34,211,238,.25);">
            ${newSong.title}
          </div>
        </div>
      `,
      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      denyButtonText: "Seguir buscando",
      cancelButtonText: "Cancelar",
      background: "#09090b",
      color: "#fff",
    })

    return res.isConfirmed
  }
}

export default useQueueModal