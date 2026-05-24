// src/hooks/useTvPlayer.js

import supabase from "../services/supabase"

function useTvPlayer({
  currentSong,
  setCurrentSong,
  setLoadingSong,
  setShowIntro,
}) {

  function handleReady(event) {
    event.target.playVideo()
  }

  async function handleStateChange(event) {

    // 0 = ended
    if (event.data === 0 && currentSong) {

      await supabase
        .from("songs_queue")
        .delete()
        .eq("id", currentSong.id)

      setCurrentSong(null)
      setLoadingSong(false)
      setShowIntro(false)
    }
  }

  function handleError() {
    setCurrentSong(null)
    setLoadingSong(false)
    setShowIntro(false)
  }

  return {
    handleReady,
    handleStateChange,
    handleError,
  }
}

export default useTvPlayer