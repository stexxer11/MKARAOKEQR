// src/hooks/useTvRealtime.js

import { useEffect } from "react"
import supabase from "../services/supabase"

function useTvRealtime({
  setQueue,
  setCurrentSong,
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
            setQueue(prev => [...prev, row])
          }

          if (row.status === "playing") {
            setCurrentSong(row)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [])
}

export default useTvRealtime