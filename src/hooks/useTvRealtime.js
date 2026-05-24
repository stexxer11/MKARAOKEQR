import { useEffect } from "react"
import supabase from "../services/supabase"

function useTvRealtime({
  loadTvState,
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
        async payload => {
          console.log("TV REALTIME SONGS_QUEUE:", payload)

          await loadTvState()
        }
      )
      .subscribe(status => {
        console.log("TV REALTIME STATUS:", status)

        if (status === "SUBSCRIBED") {
          loadTvState()
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadTvState])
}

export default useTvRealtime