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
    return queue.find(song => song.status === "playing") || null
  }, [queue])

  useEffect(() => {
    let authSubscription = null

    async function start() {
      authSubscription = await initAuth()
    }

    start()

    const cleanupRealtime = setupRealtime()

    return () => {
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
    const { data: sessionData } =
      await supabase.auth.getSession()

    const activeSession = sessionData?.session || session

    if (!activeSession?.user) return false

    const { error } = await supabase
      .from("profiles")
      .update({
        artist_name: name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeSession.user.id)

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
      return false
    }

    setQueue(sortQueue(data || []))
    return true
  }

  async function addSong(song) {
    const { data: sessionData } =
      await supabase.auth.getSession()

    const activeSession = sessionData?.session || session

    if (!activeSession?.user) {
      console.error("addSong error: no active session")
      await loadQueue()
      return false
    }

    const userId = activeSession.user.id

    let activeProfile = profile

    if (!activeProfile) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      activeProfile = profileData || null

      if (profileData) {
        setProfile(profileData)
      }
    }

    const { data: currentQueue, error: queueError } =
      await supabase
        .from("songs_queue")
        .select("*")
        .in("status", ["playing", "pending"])
        .order("created_at", { ascending: true })

    if (queueError) {
      console.error("addSong load queue error:", queueError)
      await loadQueue()
      return false
    }

    const safeQueue = currentQueue || []

    const userAlreadyInQueue = safeQueue.some(
      item => item.user_id === userId
    )

    if (userAlreadyInQueue) {
      console.warn("User already has a song in queue")
      await loadQueue()
      return false
    }

    const hasPlaying = safeQueue.some(
      item => item.status === "playing"
    )

    const payload = {
      user_id: userId,
      youtube_id: song.youtube_id,
      title: song.title,
      thumbnail: song.thumbnail,
      artist_name:
        activeProfile?.artist_name ||
        activeSession.user.user_metadata?.full_name ||
        "Artista",
      avatar:
        activeProfile?.avatar ||
        activeSession.user.user_metadata?.avatar_url ||
        null,
      status: hasPlaying ? "pending" : "playing",
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("songs_queue")
      .insert(payload)
      .select()

    await loadQueue()

    if (error) {
      console.error("addSong error:", error)
      return false
    }

    if (!data || data.length === 0) {
      console.warn("addSong warning: no row inserted")
      return false
    }

    return true
  }

  async function updateSong(id, updates) {
    const { data: sessionData } =
      await supabase.auth.getSession()

    const activeSession = sessionData?.session || session

    if (!activeSession?.user) {
      await loadQueue()
      return false
    }

    const cleanUpdates = {
      youtube_id: updates.youtube_id,
      title: updates.title,
      thumbnail: updates.thumbnail,
    }

    const { data, error } = await supabase
      .from("songs_queue")
      .update(cleanUpdates)
      .eq("id", id)
      .eq("user_id", activeSession.user.id)
      .neq("status", "playing")
      .select()

    await loadQueue()

    if (error) {
      console.error("updateSong error:", error)
      return false
    }

    if (!data || data.length === 0) {
      console.warn("updateSong warning: no row updated")
      return false
    }

    return true
  }

  async function deleteSong(id) {
    const { data: sessionData } =
      await supabase.auth.getSession()

    const activeSession = sessionData?.session || session

    if (!activeSession?.user) {
      await loadQueue()
      return false
    }

    const { data, error } = await supabase
      .from("songs_queue")
      .delete()
      .eq("id", id)
      .eq("user_id", activeSession.user.id)
      .neq("status", "playing")
      .select()

    await loadQueue()

    if (error) {
      console.error("deleteSong error:", error)
      return false
    }

    if (!data || data.length === 0) {
      console.warn("deleteSong warning: no row deleted")
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
        async payload => {
          console.log("REALTIME SONGS_QUEUE:", payload)

          await loadQueue()
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