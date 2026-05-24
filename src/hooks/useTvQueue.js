// src/hooks/useTvQueue.js

import { useEffect, useRef } from "react"
import supabase from "../services/supabase"

function useTvQueue({
  queue,
  currentSong,
  setCurrentSong,
  setLoadingSong,
}) {
  const processingRef = useRef(false)
  const recoveredRef = useRef(false)

  useEffect(() => {
    async function recoverPlayingSong() {
      if (recoveredRef.current) return

      recoveredRef.current = true

      try {
        const { data, error } = await supabase
          .from("songs_queue")
          .select("*")
          .eq("status", "playing")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setCurrentSong(data)
          setLoadingSong(true)
        }
      } catch (error) {
        console.error("Recover playing error:", error)
      }
    }

    recoverPlayingSong()
  }, [setCurrentSong, setLoadingSong])

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

        const { data, error } = await supabase
          .from("songs_queue")
          .update({ status: "playing" })
          .eq("id", next.id)
          .select()
          .single()

        if (error) throw error

        setCurrentSong(data)
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