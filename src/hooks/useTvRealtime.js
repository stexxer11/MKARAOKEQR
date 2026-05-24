import { useEffect } from "react"
import supabase from "../services/supabase"

function useTvRealtime({
  setQueue,
  setCurrentSong,
  setLoadingSong,
  setShowIntro,
}) {
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
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload

          if (eventType === "DELETE") {
            setQueue(prev =>
              prev.filter(song => song.id !== oldRow?.id)
            )

            setCurrentSong(prev =>
              prev?.id === oldRow?.id ? null : prev
            )

            setLoadingSong(false)
            setShowIntro(false)
            return
          }

          const row = newRow
          if (!row) return

        if (row.status === "playing") {

  // evitar resetear la canción
  setCurrentSong(prev => prev || row)

  // sacar de cola
  setQueue(prev =>
    prev.filter(song => song.id !== row.id)
  )

  // NO activar loading aquí
  // porque vuelve a mostrar
  // "Cargando canción..."

  return
}

          if (row.status === "pending") {
            setQueue(prev => {
              const exists = prev.some(song => song.id === row.id)

              const nextQueue = exists
                ? prev.map(song => song.id === row.id ? row : song)
                : [...prev, row]

              return nextQueue.sort(
                (a, b) =>
                  new Date(a.created_at) -
                  new Date(b.created_at)
              )
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [
    setQueue,
    setCurrentSong,
    setLoadingSong,
    setShowIntro,
  ])
}

export default useTvRealtime