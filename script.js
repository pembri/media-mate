document.addEventListener('DOMContentLoaded', () => {
    // === 1. HAMBURGER MENU LOGIC ===
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // === 2. DOWNLOADER LOGIC ===
    const generateBtn = document.getElementById('generate-btn');
    const urlInput = document.getElementById('yt-url');
    const resultContainer = document.getElementById('result-container');
    const loadingIndicator = document.getElementById('loading');

    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const url = urlInput.value.trim();
            
            // Validasi input kosong
            if (!url) {
                alert('Masukkan URL YouTube terlebih dahulu!');
                return;
            }

            // Validasi URL YouTube (Mendukung youtube.com dan youtu.be)
            const ytRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
            if (!ytRegex.test(url)) {
                alert('URL tidak valid. Harap masukkan link YouTube yang benar.');
                return;
            }

            // Reset UI
            resultContainer.innerHTML = '';
            resultContainer.style.display = 'none';
            loadingIndicator.style.display = 'block';
            generateBtn.disabled = true;
            generateBtn.innerText = 'Processing...';

            try {
                // MENGGUNAKAN COBALT API (Gratis, Tanpa API Key, Sangat Stabil)
                // Kita melakukan 2 request: 1 untuk Video (MP4) dan 1 untuk Audio (MP3)
                
                const apiEndpoint = 'https://api.cobalt.tools/api/json';

                // Setup Headers untuk Cobalt API
                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                };

                // Request Video (MP4 - 1080p max for stability)
                const videoBody = JSON.stringify({
                    url: url,
                    vCodec: "h264",
                    vQuality: "1080", 
                    aFormat: "best"
                });

                // Request Audio (MP3)
                const audioBody = JSON.stringify({
                    url: url,
                    isAudioOnly: true,
                    aFormat: "mp3"
                });

                // Jalankan Fetch secara paralel agar lebih cepat
                const [videoRes, audioRes] = await Promise.all([
                    fetch(apiEndpoint, { ...requestOptions, body: videoBody }),
                    fetch(apiEndpoint, { ...requestOptions, body: audioBody })
                ]);

                const videoData = await videoRes.json();
                const audioData = await audioRes.json();

                // Cek jika API merespon error
                if (videoData.status === 'error' || audioData.status === 'error') {
                    throw new Error('Gagal mengambil data dari server. Pastikan video bersifat publik.');
                }

                // Render UI Hasil
                renderResults(videoData, audioData);

            } catch (error) {
                console.error('Error:', error);
                alert(`Terjadi kesalahan: ${error.message}`);
            } finally {
                // Kembalikan state tombol dan loading
                loadingIndicator.style.display = 'none';
                generateBtn.disabled = false;
                generateBtn.innerText = 'Generate';
            }
        });
    }

    // === 3. FUNGSI RENDER HASIL ===
    function renderResults(videoData, audioData) {
        // Tampilkan container
        resultContainer.style.display = 'block';

        // Buat struktur HTML dinamis
        const htmlContent = `
            <div class="media-info">
                <div class="media-details">
                    <h3>Pilih Format Unduhan:</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Server telah mengekstrak link unduhan langsung Anda.</p>
                </div>
            </div>

            <div class="download-grid">
                <!-- Card Video -->
                <div class="download-card">
                    <div class="format-info">
                        <p>Video (MP4)</p>
                        <span>Kualitas Tinggi</span>
                    </div>
                    <a href="${videoData.url}" target="_blank" class="btn-download">Download</a>
                </div>

                <!-- Card Audio -->
                <div class="download-card">
                    <div class="format-info">
                        <p>Audio (MP3)</p>
                        <span>Musik / Podcast</span>
                    </div>
                    <a href="${audioData.url}" target="_blank" class="btn-download" style="background-color: #333; border: 1px solid var(--border-color);">Download</a>
                </div>
            </div>
        `;

        resultContainer.innerHTML = htmlContent;
    }
});
