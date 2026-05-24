import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

  const queueRef = useRef([])

  useEffect(() => {
    queueRef.current = queue
  }, [queue])

  const currentSong = useMemo(() => {
    return (
      queue.find(song => song.status === "playing") ||
      null
    )
  }, [queue])

  useEffect(() => {
    let authSubscription = null
    let mounted = true

    async function start() {
      authSubscription = await initAuth()
    }

    start()

    const cleanupRealtime = setupRealtime()

    return () => {
      mounted = false

      if (authSubscription) {
        authSubscription.unsubscribe()
      }

      if (cleanupRealtime) {
        cleanupRealtime()
      }
    }
  }, [])

  async function initAuth() {
    try {
      const { data } = await supabase.auth.getSession()
      const currentSession = data?.session || null

      setSession(currentSession)
      setUser(currentSession?.user || null)

      if (currentSession?.user) {
        await ensureProfile(currentSession.user)
      }

      await loadQueue()
    } catch (error) {
      console.error("initAuth error:", error)
    } finally {
      setAuthLoading(false)
    }

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          setSession(newSession)
          setUser(newSession?.user || null)

          if (newSession?.user) {
            await ensureProfile(newSession.user)
            await loadQueue()
          } else {
            clearState()
          }

          setAuthLoading(false)
        }
      )

    return listener.subscription
  }

  function clearState() {
    setSession(null)
    setUser(null)
    setProfile(null)
    setQueue([])
  }

  function sortQueue(list) {
    return [...list].sort((a, b) => {
      const statusOrder = {
        playing: 0,
        pending: 1,
      }

      const aStatus = statusOrder[a.status] ?? 9
      const bStatus = statusOrder[b.status] ?? 9

      if (aStatus !== bStatus) {
        return aStatus - bStatus
      }

      return new Date(a.created_at) - new Date(b.created_at)
    })
  }

  async function ensureProfile(userData) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.id)
      .maybeSingle()

    if (error) {
      console.error("ensureProfile fetch error:", error)
      return null
    }

    if (data) {
      setProfile(data)
      return data
    }

    const newProfile = {
      id: userData.id,
      artist_name: "",
      email: userData.email,
      avatar: userData.user_metadata?.avatar_url || null,
      updated_at: new Date().toISOString(),
    }

    const { error: insertError } = await supabase
      .from("profiles")
      .insert(newProfile)

    if (insertError) {
      console.error("ensureProfile insert error:", insertError)
      return null
    }

    setProfile(newProfile)
    return newProfile
  }

  async function setArtistName(name) {
    if (!session?.user) return false

    const { error } = await supabase
      .from("profiles")
      .update({
        artist_name: name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    if (error) {
      console.error("setArtistName error:", error)
      return false
    }

    setProfile(prev => ({
      ...prev,
      artist_name: name,
    }))

    return true
  }

  async function loadQueue() {
    const { data, error } = await supabase
      .from("songs_queue")
      .select("*")
      .in("status", ["playing", "pending"])
      .order("created_at", { ascending: true })

    if (error) {
      console.error("loadQueue error:", error)
      return
    }

    setQueue(sortQueue(data || []))
  }

  async function addSong(song) {
    if (!session?.user) return false

    const currentQueue = queueRef.current || []

    const userAlreadyInQueue = currentQueue.some(
      item => item.user_id === session.user.id
    )

    if (userAlreadyInQueue) return false

    const hasPlaying = currentQueue.some(
      item => item.status === "playing"
    )

    const payload = {
      user_id: session.user.id,
      youtube_id: song.youtubeId,
      title: song.title,
      thumbnail: song.thumbnail,
      artist_name: profile?.artist_name || "Artista",
      avatar: profile?.avatar || null,
      status: hasPlaying ? "pending" : "playing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("songs_queue")
      .insert(payload)

    if (error) {
      console.error("addSong error:", error)
      return false
    }

    return true
  }

  async function updateSong(id, updates) {
    if (!session?.user) return false

    const song = queueRef.current.find(
      item => item.id === id
    )

    if (!song) return false
    if (song.status === "playing") return false

    const { error } = await supabase
      .from("songs_queue")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", session.user.id)
      .neq("status", "playing")

    if (error) {
      console.error("updateSong error:", error)
      return false
    }

    return true
  }

  async function deleteSong(id) {
    if (!session?.user) return false

    const song = queueRef.current.find(
      item => item.id === id
    )

    if (!song) return false
    if (song.status === "playing") return false

    const { error } = await supabase
      .from("songs_queue")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id)
      .neq("status", "playing")

    if (error) {
      console.error("deleteSong error:", error)
      return false
    }

    return true
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("logout error:", error)
      return false
    }

    clearState()
    return true
  }

  function setupRealtime() {
    const channel = supabase
      .channel("songs-queue-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "songs_queue",
        },
        payload => {
          console.log("REALTIME SONGS_QUEUE:", payload)

          const eventType = payload.eventType
          const newRow = payload.new
          const oldRow = payload.old

          setQueue(prev => {
            let updated = [...prev]

            if (eventType === "INSERT") {
              const shouldShow =
                newRow.status === "playing" ||
                newRow.status === "pending"

              if (!shouldShow) return sortQueue(updated)

              const exists = updated.some(
                song => song.id === newRow.id
              )

              if (!exists) {
                updated.push(newRow)
              }
            }

            if (eventType === "UPDATE") {
              const shouldShow =
                newRow.status === "playing" ||
                newRow.status === "pending"

              if (shouldShow) {
                const exists = updated.some(
                  song => song.id === newRow.id
                )

                if (exists) {
                  updated = updated.map(song =>
                    song.id === newRow.id ? newRow : song
                  )
                } else {
                  updated.push(newRow)
                }
              } else {
                updated = updated.filter(
                  song => song.id !== newRow.id
                )
              }
            }

            if (eventType === "DELETE") {
              updated = updated.filter(
                song => song.id !== oldRow.id
              )
            }

            return sortQueue(updated)
          })
        }
      )
      .subscribe(status => {
        console.log("QUEUE REALTIME STATUS:", status)

        if (status === "SUBSCRIBED") {
          loadQueue()
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }

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
    loadQueue,
  }

  return (
    <KaraokeContext.Provider value={value}>
      {children}
    </KaraokeContext.Provider>
  )
}

export function useKaraoke() {
  return useContext(KaraokeContext)
}