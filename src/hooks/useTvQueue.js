import { useEffect, useRef } from "react"
import supabase from "../services/supabase"

function useTvQueue({
  queue,
  currentSong,
  setCurrentSong,
  setLoadingSong,
  setShowIntro,
  setTvStage,
  loadTvState,
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
        setTvStage("loading")
        setLoadingSong(true)
        setShowIntro(false)

        const { data, error } = await supabase
          .from("songs_queue")
          .update({ status: "playing" })
          .eq("id", next.id)
          .eq("status", "pending")
          .select()
          .single()

        if (error) throw error

        if (data) {
          setCurrentSong(data)
        }

        await loadTvState()

      } catch (error) {
        console.error("Queue play next error:", error)

        await loadTvState()

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
    setShowIntro,
    setTvStage,
    loadTvState,
  ])

  return {
    processingRef,
  }
}

export default useTvQueue