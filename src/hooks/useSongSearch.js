import { useRef, useState } from "react"
import Swal from "sweetalert2"
import { searchYouTube } from "../services/youtubeApi"

function useSongSearch({
  session,
  queue,
  addSong,
  updateSong,
  editingSong,
  setEditingSong,
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [addingSong, setAddingSong] = useState(false)

  const abortRef = useRef(null)
  const cacheRef = useRef({})

  async function handleSearch(value) {
    const q = value ?? query

    if (!q || q.trim().length < 3) {
      setResults([])
      return
    }

    const cleanQuery = q
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")

    if (cacheRef.current[cleanQuery]) {
      setResults(cacheRef.current[cleanQuery])
      return
    }

    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoadingSearch(true)

      const data = await searchYouTube(cleanQuery, {
        signal: controller.signal,
      })

      const safeData = data || []

      setResults(safeData)
      cacheRef.current[cleanQuery] = safeData

      if (safeData.length === 0) {
        await Swal.fire({
          title: "Sin resultados",
          text: "Intenta con otro nombre de canción.",
          background: "#09090b",
          color: "#fff",
        })
      }

    } catch (e) {
      if (e.name !== "AbortError") {
        Swal.fire({
          title: "Error",
          text: "No se pudo buscar",
          icon: "error",
          background: "#09090b",
          color: "#fff",
        })
      }
    } finally {
      setLoadingSearch(false)
    }
  }

  async function handleAdd(song) {
    if (!session) return
    if (addingSong) return
    if (!song?.id) return

    try {
      setAddingSong(true)

      if (editingSong) {
        const ok = await updateSong(editingSong.id, {
          youtube_id: song.id,
          title: song.title,
          thumbnail: song.thumbnail,
        })

        if (!ok) {
          await Swal.fire({
            title: "No se pudo actualizar",
            text: "La canción ya empezó o salió de la cola.",
            icon: "warning",
            background: "#09090b",
            color: "#fff",
          })

          setEditingSong(null)
          setResults([])
          setQuery("")
          return
        }

        await Swal.fire({
          title: "Canción actualizada",
          text: "Tu canción fue reemplazada",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
          background: "#09090b",
          color: "#fff",
        })

        setEditingSong(null)
        setResults([])
        setQuery("")
        return
      }

      const userHasSong = queue?.some(
        s => s.user_id === session.user.id
      )

      if (userHasSong) {
        await Swal.fire({
          title: "Ya estás en la cola",
          text: "Puedes editar o salir desde tu turno.",
          background: "#09090b",
          color: "#fff",
        })

        return
      }

      const ok = await addSong({
        youtube_id: song.id,
        title: song.title,
        thumbnail: song.thumbnail,
      })

      if (!ok) {
        await Swal.fire({
          title: "No se pudo agregar",
          text: "Revisa si ya estás en la cola.",
          icon: "warning",
          background: "#09090b",
          color: "#fff",
        })

        return
      }

      setResults([])
      setQuery("")

    } finally {
      setAddingSong(false)
    }
  }

  function handleTyping(value) {
    setQuery(value)
  }

  return {
    query,
    setQuery: handleTyping,
    results,
    loadingSearch,
    handleSearch,
    handleAdd,
  }
}

export default useSongSearch