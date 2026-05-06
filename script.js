async function downloadVideo() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    const resultDiv = document.getElementById('result');

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        alert("Link harus YouTube bro!");
        return;
    }

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<p>⏳ Sedang mengambil link download... (bisa 5-15 detik)</p>`;

    // Multiple API Fallback
    const apis = [
        `https://api.cobalt.tools/api/json`,
        `https://co.wuk.sh/api/json`,
        `https://api.vebto.com/youtube?url=${encodeURIComponent(url)}`
    ];

    for (let api of apis) {
        try {
            let response;
            if (api.includes('cobalt') || api.includes('wuk')) {
                // Cobalt style
                response = await fetch(api, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: url, isAudioOnly: false })
                });
            } else {
                response = await fetch(api);
            }

            const data = await response.json();

            if (data.url || data.download || data.status === "stream") {
                const downloadLink = data.url || data.download;
                const title = data.title || "YouTube Video";

                resultDiv.innerHTML = `
                    <h2>${title}</h2>
                    \( {data.thumbnail ? `<img src=" \){data.thumbnail}" class="thumbnail">` : ''}
                    <p><strong>Download Link:</strong></p>
                    <a href="${downloadLink}" target="_blank">
                        <button class="download-btn">⬇️ Download Video MP4</button>
                    </a>
                `;
                return; // Berhenti kalau sudah berhasil
            }
        } catch (e) {
            console.log("API gagal, coba berikutnya...");
        }
    }

    // Kalau semua API gagal
    resultDiv.innerHTML = `
        <p style="color:#ff6666;">
            ❌ Semua API sedang down. Coba lagi 1-2 menit atau pakai situs lain seperti:<br>
            <strong>ssyoutube.com</strong> atau <strong>cobalt.tools</strong>
        </p>`;
}

// Enter key
document.getElementById('urlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') downloadVideo();
});
