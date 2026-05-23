import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

import supabase from "../services/supabase"
import { loginWithGoogle } from "../services/auth"

const KaraokeContext = createContext()

export function KaraokeProvider({ children }) {

  const [session, setSession] = useState(null)

  const [user, setUser] = useState(null)

  const [queue, setQueue] = useState([])

  const [profile, setProfile] = useState(null)

  const [authLoading, setAuthLoading] = useState(true)

  // =========================
  // CURRENT SONG
  // =========================

  const currentSong = queue?.[0] || null

  // =========================
  // INIT AUTH
  // =========================

  useEffect(() => {
    init()
  }, [])

  async function init() {

    const { data } =
      await supabase.auth.getSession()

    const session = data.session

    setSession(session)

    setUser(session?.user || null)

    if (session?.user) {

      await ensureProfile(session.user)

      await loadQueue()
    }

    setAuthLoading(false)

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        async (_event, session) => {

          setSession(session)

          setUser(session?.user || null)

          if (session?.user) {

            await ensureProfile(session.user)

            await loadQueue()

          } else {

            setProfile(null)

            setQueue([])
          }
        }
      )

    return () =>
      listener?.subscription?.unsubscribe()
  }

  // =========================
  // UPDATE SONG
  // =========================

  async function updateSong(id, updates) {

    if (!session) return false

    const { error } = await supabase
      .from("songs_queue")
      .update(updates)
      .eq("id", id)
      .eq("user_id", session.user.id)

    if (error) {

      console.error(
        "updateSong error:",
        error
      )

      return false
    }

    return true
  }

  // =========================
  // AUTO CREATE PROFILE
  // =========================

  async function ensureProfile(user) {

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (data) {

      setProfile(data)

      return
    }

    const newProfile = {

      id: user.id,

      artist_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "Artista sin nombre",

      email: user.email,

      avatar:
        user.user_metadata?.avatar_url || null,

      updated_at:
        new Date().toISOString(),
    }

    const { error } = await supabase
      .from("profiles")
      .insert(newProfile)

    if (error) {

      console.error(
        "ensureProfile error:",
        error
      )

      return
    }

    setProfile(newProfile)
  }

  // =========================
  // EDIT ARTIST NAME
  // =========================

  async function setArtistName(name) {

    if (!session) return false

    const { error } = await supabase
      .from("profiles")
      .update({
        artist_name: name,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", session.user.id)

    if (error) {

      console.error(
        "setArtistName error:",
        error
      )

      return false
    }

    await ensureProfile(session.user)

    return true
  }

  // =========================
  // LOAD QUEUE
  // =========================

  async function loadQueue() {

    const { data, error } =
      await supabase
        .from("songs_queue")
        .select("*")
        .order("created_at", {
          ascending: true,
        })

    if (error) {

      console.error(
        "loadQueue error:",
        error
      )

      return
    }

    setQueue(data || [])
  }

  // =========================
  // ADD SONG
  // =========================

  async function addSong(song) {

    if (!session) return false

    // =========================
    // CHECK IF FIRST SONG
    // =========================

    const { data: existingSongs } =
      await supabase
        .from("songs_queue")
        .select("id")
        .order("created_at", {
          ascending: true,
        })

    const isFirstSong =
      !existingSongs ||
      existingSongs.length === 0

    // =========================
    // INSERT SONG
    // =========================

    const { error } = await supabase
      .from("songs_queue")
      .insert({

        user_id: session.user.id,

        youtube_id: song.youtubeId,

        title: song.title,

        thumbnail: song.thumbnail,

        artist_name:
          profile?.artist_name,

        avatar:
          profile?.avatar || null,

        // =========================
        // TV REALTIME STATUS
        // =========================

        status: isFirstSong
          ? "playing"
          : "pending",
      })

    if (error) {

      console.error(
        "addSong error:",
        error
      )

      return false
    }

    return true
  }

  // =========================
  // LOGOUT
  // =========================

  async function logout() {

    await supabase.auth.signOut()

    setSession(null)

    setUser(null)

    setQueue([])

    setProfile(null)

    return true
  }

  // =========================
  // REALTIME QUEUE
  // =========================

  useEffect(() => {

    const channel = supabase

      .channel("queue-live")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "songs_queue",
        },

        (payload) => {

          const {
            eventType,
            new: newRow,
            old: oldRow,
          } = payload

          setQueue(prev => {

            let updated = [...prev]

            // =========================
            // INSERT
            // =========================

            if (eventType === "INSERT") {

              updated.push(newRow)
            }

            // =========================
            // DELETE
            // =========================

            if (eventType === "DELETE") {

              updated = updated.filter(
                s => s.id !== oldRow.id
              )
            }

            // =========================
            // UPDATE
            // =========================

            if (eventType === "UPDATE") {

              updated = updated.map(s =>

                s.id === newRow.id
                  ? newRow
                  : s
              )
            }

            // =========================
            // SORT
            // =========================

            return updated.sort(
              (a, b) =>

                new Date(a.created_at) -
                new Date(b.created_at)
            )
          })
        }
      )

      .subscribe()

    return () => {

      supabase.removeChannel(channel)
    }

  }, [])

  // =========================
  // DELETE SONG
  // =========================

  async function deleteSong(id) {

    if (!session) return false

    const { error } = await supabase
      .from("songs_queue")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id)

    if (error) {

      console.error(
        "deleteSong error:",
        error
      )

      return false
    }

    return true
  }

  return (

    <KaraokeContext.Provider
      value={{

        session,
        user,

        queue,
        currentSong,

        profile,

        loginWithGoogle,
        logout,

        addSong,
        updateSong,
        deleteSong,

        setArtistName,

        authLoading,
      }}
    >
      {children}
    </KaraokeContext.Provider>
  )
}

export function useKaraoke() {

  return useContext(KaraokeContext)
}