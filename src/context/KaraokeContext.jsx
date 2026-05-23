```jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import supabase from "../services/supabase"
import { loginWithGoogle } from "../services/auth"

const KaraokeContext = createContext()

export function KaraokeProvider({ children }) {

  // =========================
  // STATE
  // =========================

  const [session, setSession] = useState(null)

  const [user, setUser] = useState(null)

  const [queue, setQueue] = useState([])

  const [profile, setProfile] = useState(null)

  const [authLoading, setAuthLoading] = useState(true)

  // =========================
  // MEMO
  // =========================

  const currentSong = useMemo(() => {
    return queue?.[0] || null
  }, [queue])

  // =========================
  // INIT
  // =========================

  useEffect(() => {

    initAuth()

    setupRealtime()

  }, [])

  // =========================
  // AUTH INIT
  // =========================

  async function initAuth() {

    try {

      const { data } =
        await supabase.auth.getSession()

      const currentSession =
        data?.session || null

      setSession(currentSession)

      setUser(currentSession?.user || null)

      if (currentSession?.user) {

        await Promise.all([
          ensureProfile(currentSession.user),
          loadQueue(),
        ])
      }

    } catch (error) {

      console.error(
        "initAuth error:",
        error
      )

    } finally {

      setAuthLoading(false)
    }

    supabase.auth.onAuthStateChange(
      async (_event, newSession) => {

        setSession(newSession)

        setUser(newSession?.user || null)

        if (newSession?.user) {

          await Promise.all([
            ensureProfile(newSession.user),
            loadQueue(),
          ])

        } else {

          clearState()
        }
      }
    )
  }

  // =========================
  // CLEAR STATE
  // =========================

  function clearState() {

    setSession(null)

    setUser(null)

    setProfile(null)

    setQueue([])
  }

  // =========================
  // PROFILE
  // =========================

  async function ensureProfile(userData) {

    const { data, error } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.id)
        .maybeSingle()

    if (error) {

      console.error(
        "ensureProfile fetch error:",
        error
      )

      return null
    }

    if (data) {

      setProfile(data)

      return data
    }

    const newProfile = {

      id: userData.id,

      artist_name:
        userData.user_metadata?.full_name ||
        userData.user_metadata?.name ||
        "Artista sin nombre",

      email: userData.email,

      avatar:
        userData.user_metadata?.avatar_url || null,

      updated_at:
        new Date().toISOString(),
    }

    const { error: insertError } =
      await supabase
        .from("profiles")
        .insert(newProfile)

    if (insertError) {

      console.error(
        "ensureProfile insert error:",
        insertError
      )

      return null
    }

    setProfile(newProfile)

    return newProfile
  }

  // =========================
  // UPDATE ARTIST NAME
  // =========================

  async function setArtistName(name) {

    if (!session?.user) return false

    const { error } =
      await supabase
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

    setProfile(prev => ({
      ...prev,
      artist_name: name,
    }))

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

    if (!session?.user) return false

    const isFirstSong =
      queue.length === 0

    const payload = {

      user_id: session.user.id,

      youtube_id: song.youtubeId,

      title: song.title,

      thumbnail: song.thumbnail,

      artist_name:
        profile?.artist_name ||
        "Artista",

      avatar:
        profile?.avatar || null,

      status: isFirstSong
        ? "playing"
        : "pending",
    }

    const { error } =
      await supabase
        .from("songs_queue")
        .insert(payload)

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
  // UPDATE SONG
  // =========================

  async function updateSong(
    id,
    updates
  ) {

    if (!session?.user) return false

    const { error } =
      await supabase
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
  // DELETE SONG
  // =========================

  async function deleteSong(id) {

    if (!session?.user) return false

    const { error } =
      await supabase
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

  // =========================
  // LOGOUT
  // =========================

  async function logout() {

    const { error } =
      await supabase.auth.signOut()

    if (error) {

      console.error(
        "logout error:",
        error
      )

      return false
    }

    clearState()

    return true
  }

  // =========================
  // REALTIME
  // =========================

  function setupRealtime() {

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

            // INSERT
            if (eventType === "INSERT") {

              const exists =
                updated.some(
                  s => s.id === newRow.id
                )

              if (!exists) {
                updated.push(newRow)
              }
            }

            // UPDATE
            if (eventType === "UPDATE") {

              updated = updated.map(song =>

                song.id === newRow.id
                  ? newRow
                  : song
              )
            }

            // DELETE
            if (eventType === "DELETE") {

              updated = updated.filter(
                song =>
                  song.id !== oldRow.id
              )
            }

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
  }

  // =========================
  // PROVIDER
  // =========================

  const value = {

    session,
    user,

    queue,
    currentSong,

    profile,

    authLoading,

    loginWithGoogle,
    logout,

    addSong,
    updateSong,
    deleteSong,

    setArtistName,
  }

  return (

    <KaraokeContext.Provider
      value={value}
    >
      {children}
    </KaraokeContext.Provider>
  )
}

export function useKaraoke() {

  return useContext(KaraokeContext)
}
```
