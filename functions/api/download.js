export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const videoUrl = url.searchParams.get('url');

    // Header untuk mengizinkan akses (Bypass CORS)
    const corsHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    };

    if (!videoUrl) {
        return new Response(JSON.stringify({ error: "URL tidak valid" }), { status: 400, headers: corsHeaders });
    }

    try {
        // 1. Ambil Judul & Thumbnail
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
        const oembedData = await oembedRes.json();
        
        // 2. Tembak API Downloader dari Sisi Server Cloudflare (Bebas Blokir Browser)
        const resMp4 = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(videoUrl)}`);
        const dataMp4 = await resMp4.json();

        const resMp3 = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`);
        const dataMp3 = await resMp3.json();

        // 3. Gabungkan dan kirim balik ke web lo
        const result = {
            success: true,
            title: oembedData.title || "Video YouTube",
            thumbnail: oembedData.thumbnail_url || "https://via.placeholder.com/640x360.png?text=No+Thumbnail",
            mp4: dataMp4?.data?.dl || null,
            mp3: dataMp3?.data?.dl || null
        };

        return new Response(JSON.stringify(result), { headers: corsHeaders });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: "Gagal memproses video di server Cloudflare." }), { status: 500, headers: corsHeaders });
    }
}
