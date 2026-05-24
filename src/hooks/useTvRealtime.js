import { useEffect } from "react"
import supabase from "../services/supabase"

function useTvRealtime({
  setQueue,
  setCurrentSong,
  setLoadingSong,
  setShowIntro,
  setTvStage,
}) {
  useEffect(() => {
    const channel = supabase
      .channel("tv-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "songs_queue",
        },
        payload => {
          const row = payload.new

          if (!row) return

          if (row.status === "pending") {
            setQueue(prev => {
              const exists = prev.some(song => song.id === row.id)

              if (exists) return prev

              return [...prev, row]
            })
          }

          if (row.status === "playing") {
            setTvStage("loading")
            setLoadingSong(true)
            setShowIntro(false)
            setCurrentSong(prev => prev || row)

            setQueue(prev =>
              prev.filter(song => song.id !== row.id)
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
    setLoadingSong,
    setShowIntro,
    setTvStage,
  ])
}

export default useTvRealtime