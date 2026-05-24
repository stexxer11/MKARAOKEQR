import { useEffect, useRef } from "react"
import supabase from "../services/supabase"

function useTvQueue({
  queue,
  currentSong,
  setCurrentSong,
}) {

  const processingRef = useRef(false)

  useEffect(() => {

    if (processingRef.current) return
    if (currentSong) return
    if (!queue.length) return

    const next = queue[0]

    if (!next) return

    processingRef.current = true

    supabase
      .from("songs_queue")
      .update({ status: "playing" })
      .eq("id", next.id)
      .then(() => {
        processingRef.current = false
      })

  }, [queue, currentSong])

  return { processingRef }
}

export default useTvQueue