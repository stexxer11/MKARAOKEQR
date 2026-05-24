const API_KEY =
  import.meta.env.VITE_YOUTUBE_API_KEY

// =====================================================
// SIMPLE MEMORY CACHE
// =====================================================

const cache = new Map()

let quotaBlockedUntil = 0

// =====================================================
// HELPERS
// =====================================================

function cleanText(text = "") {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeQuery(query) {
  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 80)
}

function buildKaraokeQuery(query) {
  const q = normalizeQuery(query)

  if (q.includes("karaoke")) {
    return q
  }

  return `${q} karaoke`
}

// =====================================================
// SEARCH YOUTUBE
// =====================================================

export async function searchYouTube(query, options = {}) {
  try {
    if (
      !query ||
      typeof query !== "string" ||
      query.trim().length < 3
    ) {
      return []
    }

    if (!API_KEY) {
      console.error("Missing VITE_YOUTUBE_API_KEY")
      return []
    }

    if (Date.now() < quotaBlockedUntil) {
      console.warn("YouTube quota temporarily blocked")
      return []
    }

    const karaokeQuery = buildKaraokeQuery(query)

    if (cache.has(karaokeQuery)) {
      return cache.get(karaokeQuery)
    }

    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, 8000)

    const externalSignal = options.signal

    if (externalSignal) {
      externalSignal.addEventListener("abort", () => {
        controller.abort()
      })
    }

    const params = new URLSearchParams({
      part: "snippet",
      maxResults: "5",
      type: "video",
      videoEmbeddable: "true",
      videoSyndicated: "true",
      safeSearch: "moderate",
      q: karaokeQuery,
      key: API_KEY,
    })

    const url =
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`

    const response = await fetch(url, {
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (response.status === 429) {
      quotaBlockedUntil = Date.now() + 1000 * 60 * 5
      console.error("YouTube API quota/rate limit reached")
      return []
    }

    if (!response.ok) {
      console.error("YouTube API error:", response.status)
      return []
    }

    const data = await response.json()

    if (data?.error || !Array.isArray(data.items)) {
      console.error("YouTube API response error:", data?.error)
      return []
    }

    const songs = data.items
      .filter(item => {
        const videoId = item?.id?.videoId
        const title = item?.snippet?.title?.toLowerCase() || ""

        if (!videoId || !title) return false

        const blockedWords = [
          "shorts",
          "#shorts",
          "live",
          "stream",
          "reaction",
          "cover reaction",
          "tiktok",
        ]

        return !blockedWords.some(word =>
          title.includes(word)
        )
      })
      .map(item => {
        const videoId = item.id.videoId

        return {
          id: videoId,
          youtube_id: videoId,

          title:
            cleanText(item.snippet.title)
              .slice(0, 120) || "Untitled",

          artist:
            cleanText(item.snippet.channelTitle)
              .slice(0, 80) || "Unknown",

          thumbnail:
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.default?.url ||
            null,
        }
      })

    const unique = songs.filter(
      (song, index, self) =>
        index === self.findIndex(s => s.id === song.id)
    )

    cache.set(karaokeQuery, unique)

    return unique

  } catch (err) {
    if (err.name === "AbortError") {
      return []
    }

    console.error("YouTube search failed:", err)
    return []
  }
}