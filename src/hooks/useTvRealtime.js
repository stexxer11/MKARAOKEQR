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
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "songs_queue",
      }, (payload) => {

        const { eventType, new: newRow, old: oldRow } = payload

        if (eventType === "DELETE") {

          setQueue(prev => prev.filter(s => s.id !== oldRow.id))

          setCurrentSong(prev =>
            prev?.id === oldRow.id ? null : prev
          )

          return
        }

        const row = newRow
        if (!row) return

        if (row.status === "playing") {

          setLoadingSong(true)
          setShowIntro(true)

          setQueue(prev =>
            prev.filter(s => s.id !== row.id)
          )

          setTimeout(() => {
            setCurrentSong(row)
          }, 600)

          setTimeout(() => {
            setShowIntro(false)
            setLoadingSong(false)
          }, 3500)

          return
        }

        if (row.status === "pending") {

          setQueue(prev => {

            const exists = prev.find(s => s.id === row.id)

            if (exists) {
              return prev.map(s =>
                s.id === row.id ? row : s
              )
            }

            return [...prev, row].sort(
              (a, b) =>
                new Date(a.created_at) -
                new Date(b.created_at)
            )
          })
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)

  }, [setQueue, setCurrentSong, setShowIntro, setLoadingSong])
}

export default useTvRealtime