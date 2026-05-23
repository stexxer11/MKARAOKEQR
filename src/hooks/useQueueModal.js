import { useEffect, useRef } from "react"

import Swal from "sweetalert2"

function useQueueModal({
  session,
  queue,
  updateSong,
  deleteSong,
  setArtistName,
  profile,
}) {

  const swalRef = useRef({
    open: false,
    songId: null,
  })

  const askedNameRef = useRef(false)

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

      inputValidator: (value) => {

        if (!value || value.trim().length < 2) {
          return "Mínimo 2 caracteres"
        }
      },
    })

    if (!value) return

    await setArtistName(value.trim())
  }

  // =========================
  // AUTO OPEN MODAL
  // =========================

  useEffect(() => {

    if (!session) return

    if (swalRef.current.open) return

    const mine = queue?.find(
      s => s.user_id === session.user.id
    )

    if (!mine) return

    showQueueSwal(mine)

  }, [queue, session])

  async function showQueueSwal(song) {

    if (!song) return

    swalRef.current = {
      open: true,
      songId: song.id,
    }

    while (true) {

      const exists = queue?.some(
        s => s.id === song.id
      )

      if (!exists) {

        Swal.close()

        swalRef.current = {
          open: false,
          songId: null,
        }

        return
      }

      const position =
        queue.findIndex(
          s => s.id === song.id
        ) + 1

      const res = await Swal.fire({

        title:
          position === 1
            ? "TU TURNO"
            : `TURNO #${position}`,

        text: song.title,

        showConfirmButton: true,
        showDenyButton: true,

        confirmButtonText: "Editar",
        denyButtonText: "Eliminar",

        allowOutsideClick: false,

        background: "#09090b",

        color: "#fff",
      })

      if (res.isDenied) {

        await deleteSong(song.id)

        Swal.close()

        swalRef.current = {
          open: false,
          songId: null,
        }

        return
      }

      if (res.isConfirmed) {

        const replacement = await Swal.fire({

          title: "Nueva canción",

          input: "text",

          inputPlaceholder: "Nuevo nombre",

          confirmButtonText: "Guardar",

          background: "#09090b",

          color: "#fff",
        })

        if (!replacement.value) continue

        await updateSong(song.id, {
          title: replacement.value,
        })
      }
    }
  }
}

export default useQueueModal