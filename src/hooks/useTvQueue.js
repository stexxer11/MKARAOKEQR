import { useEffect, useRef } from "react"
import supabase from "../services/supabase"

function useTvQueue({
  queue,
  currentSong,
  setCurrentSong,
}) {
  const processingRef = useRef(false)

  useEffect(() => {
    const playNextSong = async () => {
      if (processingRef.current) return
      if (currentSong) return
      if (!queue?.length) return

      const next = queue[0]

      if (!next) return

      processingRef.current = true

      try {
        const { error } = await supabase
          .from("songs_queue")
          .update({ status: "playing" })
          .eq("id", next.id)

        if (error) throw error

        setCurrentSong(next)
      } catch (error) {
        console.error("Queue error:", error)
      } finally {
        processingRef.current = false
      }
    }

    playNextSong()
  }, [queue, currentSong, setCurrentSong])

  return {
    processingRef,
  }
}

export default useTvQueue