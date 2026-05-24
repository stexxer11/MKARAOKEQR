const API_KEY =
  import.meta.env.VITE_YOUTUBE_API_KEY

// =====================================================
// SEARCH YOUTUBE (KARAOKE TV READY)
// =====================================================

export async function searchYouTube(query) {

  try {

    // =========================================
    // VALIDATION
    // =========================================
    if (
      !query ||
      typeof query !== "string" ||
      query.trim().length < 2
    ) {
      return []
    }

    if (!API_KEY) {
      console.error("Missing VITE_YOUTUBE_API_KEY")
      return []
    }

    // =========================================
    // CLEAN QUERY
    // =========================================
    const cleanQuery =
      query.trim().slice(0, 120)

    // =========================================
    // ABORT CONTROLLER
    // =========================================
    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, 10000)

    // =========================================
    // KARAOKE QUERY BOOST
    // =========================================
    const karaokeQuery =
      `${cleanQuery} karaoke version`

    // =========================================
    // BUILD URL
    // =========================================
    const url =
      "https://www.googleapis.com/youtube/v3/search" +
      "?part=snippet" +
      "&maxResults=15" +
      "&type=video" +
      "&videoEmbeddable=true" +
      "&videoSyndicated=true" +
      "&safeSearch=moderate" +
      "&q=" +
      encodeURIComponent(karaokeQuery) +
      "&key=" +
      API_KEY

    // =========================================
    // FETCH
    // =========================================
    const response = await fetch(url, {
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.error("YouTube API error:", response.status)
      return []
    }

    const data = await response.json()

    if (data?.error || !Array.isArray(data.items)) {
      console.error("YouTube API response error:", data?.error)
      return []
    }

    // =========================================
    // FILTER + FORMAT
    // =========================================
    const songs = data.items
      .filter(item => {
        const title =
          item?.snippet?.title?.toLowerCase() || ""

        return (
          item?.id?.videoId &&
          title &&
          !title.includes("shorts") &&
          !title.includes("#shorts") &&
          !title.includes("live") &&
          !title.includes("stream") &&
          !title.includes("reaction") &&
          !title.includes("cover reaction")
        )
      })
      .map(item => {

        const videoId = item.id.videoId

        return {
          id: videoId,

          youtubeId: videoId,
          youtube_id: videoId,

          title:
            item.snippet.title
              ?.replaceAll("&amp;", "&")
              ?.replaceAll("&#39;", "'")
              ?.replaceAll("&quot;", '"')
              ?.replaceAll("&lt;", "<")
              ?.replaceAll("&gt;", ">")
              ?.trim()
              ?.slice(0, 120) || "Untitled",

          artist:
            item.snippet.channelTitle
              ?.trim()
              ?.slice(0, 80) || "Unknown",

          thumbnail:
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url ||
            null,
        }
      })

    // =========================================
    // REMOVE DUPLICATES
    // =========================================
    const unique = songs.filter(
      (song, index, self) =>
        index === self.findIndex(s => s.id === song.id)
    )

    return unique

  } catch (err) {

    if (err.name === "AbortError") {
      console.warn("YouTube search aborted")
      return []
    }

    console.error("YouTube search failed:", err)
    return []
  }
}