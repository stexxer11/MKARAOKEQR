import { useEffect, useRef } from "react"
import supabase from "../services/supabase"

function useTvQueue({
  queue,
  currentSong,
  setCurrentSong,
  setLoadingSong,
}) {
  const processingRef = useRef(false)

  useEffect(() => {

    async function playNextSong() {
      if (processingRef.current) return
      if (currentSong) return
      if (!queue?.length) return

      const next = queue[0]

      if (!next?.id) return

      processingRef.current = true

      try {
        setLoadingSong(true)

        const { error } = await supabase
          .from("songs_queue")
          .update({ status: "playing" })
          .eq("id", next.id)

        if (error) throw error

        setCurrentSong(prev => prev || next)

      } catch (error) {
        console.error("Queue error:", error)
        setLoadingSong(false)
      } finally {
        processingRef.current = false
      }
    }

    playNextSong()

  }, [
    queue,
    currentSong,
    setCurrentSong,
    setLoadingSong,
  ])

  return {
    processingRef,
  }
}

export default useTvQueue