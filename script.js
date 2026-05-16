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
            
            // Validasi input
            if (!url) {
                alert('Masukkan URL YouTube terlebih dahulu!');
                return;
            }

            const ytRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be|www\.youtube\.com\/shorts)\/.+$/;
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
                // LANGKAH 1: Ambil Judul & Thumbnail Resmi dari YouTube (Pasti Berhasil)
                const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
                const oembedRes = await fetch(oembedUrl);
                const oembedData = await oembedRes.json();
                
                const title = oembedData.title || "Video YouTube";
                const thumbnail = oembedData.thumbnail_url || "https://via.placeholder.com/640x360.png?text=No+Thumbnail";

                // LANGKAH 2: Ambil List Format Download (Menggunakan API yang mendukung multi-format)
                const apiRes = await fetch(`https://api.ryzendesu.vip/api/downloader/yt?url=${encodeURIComponent(url)}`);
                const data = await apiRes.json();

                let formatsHtml = '';

                // Parsing berbagai format dari API (Jika API sukses ngerespon struktur lengkap)
                if (data && data.success && data.url) {
                    // Ekstrak list Video MP4 (Misal: 360p, 480p, 720p, 1080p)
                    if (data.url.mp4) {
                        for (const [quality, link] of Object.entries(data.url.mp4)) {
                            formatsHtml += createDownloadCard(`Video MP4 (${quality})`, 'Kualitas Video', link, 'var(--yt-red)');
                        }
                    }
                    // Ekstrak list Audio MP3
                    if (data.url.mp3) {
                        for (const [quality, link] of Object.entries(data.url.mp3)) {
                            formatsHtml += createDownloadCard(`Audio MP3 (${quality})`, 'Musik / Podcast', link, '#333333');
                        }
                    }
                } else {
                    // LANGKAH 3: SISTEM FALLBACK (Jika server utama penuh, pakai server cadangan)
                    const fallbackRes = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`);
                    const fallbackData = await fallbackRes.json();
                    
                    const fallbackResMp3 = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`);
                    const fallbackDataMp3 = await fallbackResMp3.json();

                    if (fallbackData?.data?.dl) {
                        formatsHtml += createDownloadCard('Video (MP4)', 'Resolusi Terbaik', fallbackData.data.dl, 'var(--yt-red)');
                    }
                    if (fallbackDataMp3?.data?.dl) {
                        formatsHtml += createDownloadCard('Audio (MP3)', 'Kualitas Standar', fallbackDataMp3.data.dl, '#333333');
                    }
                }

                if (!formatsHtml) throw new Error("Gagal mengambil daftar format dari server. Coba video lain.");

                // LANGKAH 4: Render UI Asli (Sesuai desain CSS lo)
                renderNativeUI(title, thumbnail, formatsHtml);

            } catch (error) {
                console.error('Error:', error);
                alert(`Gagal memproses video. Server API mungkin sedang sibuk atau URL tidak diizinkan.`);
            } finally {
                loadingIndicator.style.display = 'none';
                generateBtn.disabled = false;
                generateBtn.innerText = 'Generate';
            }
        });
    }

    // Fungsi untuk nge-generate elemen kotak format download
    function createDownloadCard(title, subtitle, link, btnColor) {
        return `
            <div class="download-card">
                <div class="format-info">
                    <p style="font-weight: 600; color: var(--text-main);">${title}</p>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">${subtitle}</span>
                </div>
                <a href="${link}" target="_blank" rel="noopener noreferrer" class="btn-download" style="background-color: ${btnColor}; color: white; padding: 0.6rem 1.2rem; border-radius: 6px; border: none; font-weight: bold;">
                    Download
                </a>
            </div>
        `;
    }

    // Fungsi untuk nampilin Judul, Thumbnail, dan List Format ke layar
    function renderNativeUI(title, thumbnail, formatsHtml) {
        resultContainer.style.display = 'block';
        
        const htmlContent = `
            <div class="media-info" style="display: flex; gap: 1.5rem; background-color: var(--bg-card); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; align-items: center; border: 1px solid var(--border-color);">
                <img src="${thumbnail}" alt="Thumbnail" style="max-width: 250px; border-radius: 8px; width: 100%; object-fit: cover;">
                <div class="media-details">
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-main); font-size: 1.2rem;">${title}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Server berhasil menemukan format di bawah ini. Silakan pilih dan unduh.</p>
                </div>
            </div>

            <div class="download-grid">
                ${formatsHtml}
            </div>
        `;

        resultContainer.innerHTML = htmlContent;
    }
});
