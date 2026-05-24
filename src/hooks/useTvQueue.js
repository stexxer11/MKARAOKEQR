// src/hooks/useTvQueue.js

import { useEffect } from "react"
import supabase from "../services/supabase"

function useTvQueue({
  queue,
  currentSong,
  setCurrentSong,
}) {

  useEffect(() => {

    async function nextSong() {

      if (currentSong) return

      if (queue.length === 0) return

      const song = queue[0]

      await supabase
        .from("songs_queue")
        .update({
          status: "playing",
        })
        .eq("id", song.id)

      setCurrentSong(song)
    }

    nextSong()

  }, [queue, currentSong])
}

export default useTvQueue