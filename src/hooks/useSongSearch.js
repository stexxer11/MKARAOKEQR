import { useRef, useState } from "react"

import Swal from "sweetalert2"

import { searchYouTube } from "../services/youtubeApi"

function useSongSearch({
  session,
  queue,
  addSong,
}) {

  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [addingSong, setAddingSong] = useState(false)

  const searchTimeout = useRef(null)
  const abortRef = useRef(null)
  const cacheRef = useRef({})

  async function handleSearch(value) {

    const q = value ?? query

    if (!q || q.length < 3) {
      setResults([])
      return
    }

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

    try {

      setAddingSong(true)

      const exists = queue?.some(
        s =>
          s.youtube_id === song.id &&
          s.user_id === session.user.id
      )

      if (exists) {

        await Swal.fire({
          title: "Ya tienes esta canción",
          background: "#09090b",
          color: "#fff",
        })

        return
      }

      await addSong({
        youtubeId: song.id,
        title: song.title,
        thumbnail: song.thumbnail,
      })

    } finally {

      setAddingSong(false)
    }
  }

  function handleTyping(value) {

    setQuery(value)

    clearTimeout(searchTimeout.current)

    searchTimeout.current = setTimeout(() => {
      handleSearch(value)
    }, 700)
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