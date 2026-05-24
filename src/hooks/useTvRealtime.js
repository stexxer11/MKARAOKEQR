import { useEffect, useRef } from "react"
import supabase from "../services/supabase"

function useTvRealtime({
  setQueue,
  setCurrentSong,
  setShowIntro,
  setLoadingSong,
}) {
  const introTimeoutRef = useRef(null)
  const songTimeoutRef = useRef(null)

  useEffect(() => {
    const clearTimers = () => {
      clearTimeout(introTimeoutRef.current)
      clearTimeout(songTimeoutRef.current)
    }

    const handlePending = (row) => {
      setQueue((prev) => {
        const exists = prev.some((s) => s.id === row.id)

        if (exists) {
          return prev.map((s) =>
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

    const handlePlaying = (row) => {
      clearTimers()

      setLoadingSong(true)
      setShowIntro(true)

      setQueue((prev) =>
        prev.filter((s) => s.id !== row.id)
      )

      songTimeoutRef.current = setTimeout(() => {
        setCurrentSong(row)
      }, 600)

      introTimeoutRef.current = setTimeout(() => {
        setShowIntro(false)
        setLoadingSong(false)
      }, 3500)
    }

    const channel = supabase
      .channel("tv-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "songs_queue",
        },
        ({ eventType, new: newRow, old: oldRow }) => {
          if (eventType === "DELETE") {
            setQueue((prev) =>
              prev.filter((s) => s.id !== oldRow.id)
            )

            setCurrentSong((prev) =>
              prev?.id === oldRow.id ? null : prev
            )

            return
          }

          if (!newRow) return

          if (newRow.status === "playing") {
            handlePlaying(newRow)
            return
          }

          if (newRow.status === "pending") {
            handlePending(newRow)
          }
        }
      )
      .subscribe()

    return () => {
      clearTimers()
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