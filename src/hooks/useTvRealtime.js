import { useEffect } from "react"
import supabase from "../services/supabase"

function useTvRealtime({
  setQueue,
  setCurrentSong,
  setShowIntro,
  setLoadingSong,
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

          const {
            eventType,
            new: newRow,
            old: oldRow,
          } = payload

          if (eventType === "DELETE") {

            if (oldRow?.id) {
              setQueue(prev =>
                prev.filter(s => s.id !== oldRow.id)
              )

              setCurrentSong(prev =>
                prev?.id === oldRow.id ? null : prev
              )
            }

            return
          }

          const row = newRow

          if (!row) return

          if (row.status === "playing") {

            setLoadingSong(true)
            setShowIntro(true)
            setCurrentSong(row)

            setQueue(prev =>
              prev.filter(s => s.id !== row.id)
            )

            setTimeout(() => {
              setShowIntro(false)
            }, 4500)

            return
          }

          if (row.status === "pending") {

            setQueue(prev => {

              const exists = prev.some(s => s.id === row.id)

              if (exists) {
                return prev
                  .map(s => s.id === row.id ? row : s)
                  .sort(
                    (a, b) =>
                      new Date(a.created_at) -
                      new Date(b.created_at)
                  )
              }

              return [...prev, row].sort(
                (a, b) =>
                  new Date(a.created_at) -
                  new Date(b.created_at)
              )
            })

            setCurrentSong(prev =>
              prev?.id === row.id ? null : prev
            )
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
    setShowIntro,
    setLoadingSong,
  ])
}

export default useTvRealtime