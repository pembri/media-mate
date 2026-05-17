// worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/download' && request.method === 'POST') {
      return handleYouTubeDownload(request);
    }

    return new Response('YTCloud Downloader Worker ✅', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

async function handleYouTubeDownload(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return jsonResponse({ error: "URL tidak boleh kosong" }, 400);
    }

    // Extract Video ID
    let videoId = extractVideoId(url);
    if (!videoId) {
      return jsonResponse({ error: "Link YouTube tidak valid" }, 400);
    }

    // === Gunakan public proxy / API sederhana yang relatif stabil ===
    // Alternatif terbaik tanpa install library berat
    const apiUrl = `https://api.veo.re/api/youtube?url=${encodeURIComponent(url)}`;

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('API gagal');
    }

    const data = await response.json();

    // Format response sesuai yang dibutuhkan frontend
    const result = {
      title: data.title || "YouTube Video",
      thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      duration: data.duration || "00:00",
      views: data.views || 0,
      formats: {
        video: [],
        audio: []
      }
    };

    // Video Formats
    if (data.formats) {
      data.formats.forEach(f => {
        if (f.hasVideo && f.hasAudio) {
          result.formats.video.push({
            quality: f.qualityLabel || f.height + "p",
            codec: "MP4",
            filesize: f.contentLength ? (f.contentLength / 1024 / 1024).toFixed(1) + " MB" : "\~ MB",
            url: f.url
          });
        } else if (f.hasAudio && !f.hasVideo) {
          result.formats.audio.push({
            quality: f.audioBitrate ? f.audioBitrate + "kbps" : "128kbps",
            codec: "MP3",
            filesize: f.contentLength ? (f.contentLength / 1024 / 1024).toFixed(1) + " MB" : "\~ MB",
            url: f.url
          });
        }
      });
    }

    return jsonResponse(result);

  } catch (error) {
    console.error(error);
    return jsonResponse({ 
      error: "Gagal memproses video. Coba link lain atau tunggu beberapa saat." 
    }, 500);
  }
}

function extractVideoId(url) {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
