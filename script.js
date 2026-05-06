async function downloadVideo() {
    const url = document.getElementById('urlInput').value.trim();
    const resultDiv = document.getElementById('result');

    if (!url) {
        alert("Masukkan link YouTube dulu!");
        return;
    }

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<p>Sedang memproses... Mohon tunggu.</p>`;

    try {
        // Menggunakan Cobalt API (cukup reliable saat ini)
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: url,
                isAudioOnly: false,
                filenameStyle: "pretty",
                videoQuality: "1080"
            })
        });

        const data = await response.json();

        if (data.status === "stream" || data.status === "success") {
            const title = data.title || "Video YouTube";
            resultDiv.innerHTML = `
                <h2>${title}</h2>
                \( {data.thumbnail ? `<img src=" \){data.thumbnail}" class="thumbnail" alt="thumbnail">` : ''}
                <p><strong>Link Download:</strong></p>
                <a href="${data.url}" target="_blank" download>
                    <button class="download-btn">⬇️ Download Video (MP4)</button>
                </a>
                <br>
                <small>klik kanan → Save link as kalau tidak langsung download</small>
            `;
        } else {
            resultDiv.innerHTML = `<p style="color:#ff6666;">Gagal memproses video. Coba link lain atau tunggu beberapa saat.</p>`;
        }
    } catch (err) {
        resultDiv.innerHTML = `<p style="color:#ff6666;">Terjadi error. Pastikan link benar atau coba lagi nanti.</p>`;
        console.error(err);
    }
}

// Enter key support
document.getElementById('urlInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') downloadVideo();
});
