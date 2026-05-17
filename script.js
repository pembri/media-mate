document.addEventListener('DOMContentLoaded', () => {
    // === 1. HAMBURGER MENU ===
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
            generateBtn.innerText = 'Membobol Server...';

            try {
                // 1. AMBIL JUDUL & THUMBNAIL LANGSUNG DARI YOUTUBE (100% Aman dari Blokir)
                const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
                const oembedRes = await fetch(oembedUrl);
                const oembedData = await oembedRes.json();
                
                const title = oembedData.title || "Video YouTube";
                const thumbnail = oembedData.thumbnail_url || "https://via.placeholder.com/640x360.png?text=No+Thumbnail";

                let formatsHtml = '';
                let isSuccess = false;

                // FUNGSI PROXY BUAT NGEBOBOL BLOKIR CORS BROWSER (KUNCI UTAMA)
                const fetchWithProxy = async (apiUrl) => {
                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
                    const res = await fetch(proxyUrl);
                    const jsonRes = await res.json();
                    return JSON.parse(jsonRes.contents);
                };

                // 2. COBA SERVER 1 (Ryzendesu - Multi Format)
                try {
                    console.log("Mencoba Server Utama...");
                    const data = await fetchWithProxy(`https://api.ryzendesu.vip/api/downloader/yt?url=${url}`);
                    
                    if (data && data.success && data.url) {
                        if (data.url.mp4) {
                            for (const [quality, link] of Object.entries(data.url.mp4)) {
                                formatsHtml += createDownloadCard(`Video MP4 (${quality})`, 'Kualitas Video', link, 'var(--yt-red)');
                            }
                        }
                        if (data.url.mp3) {
                            for (const [quality, link] of Object.entries(data.url.mp3)) {
                                formatsHtml += createDownloadCard(`Audio MP3 (${quality})`, 'Musik / Podcast', link, '#333333');
                            }
                        }
                        if (formatsHtml !== '') isSuccess = true;
                    }
                } catch (e) {
                    console.log("Server Utama Diblokir/Penuh. Loncat ke Server 2...");
                }

                // 3. JIKA SERVER 1 GAGAL, COBA SERVER 2 (Siputzx)
                if (!isSuccess) {
                    try {
                        const dataMp4 = await fetchWithProxy(`https://api.siputzx.my.id/api/d/ytmp4?url=${url}`);
                        if (dataMp4?.data?.dl) {
                            formatsHtml += createDownloadCard('Video (MP4)', 'Resolusi Tinggi', dataMp4.data.dl, 'var(--yt-red)');
                            isSuccess = true;
                        }

                        const dataMp3 = await fetchWithProxy(`https://api.siputzx.my.id/api/d/ytmp3?url=${url}`);
                        if (dataMp3?.data?.dl) {
                            formatsHtml += createDownloadCard('Audio (MP3)', 'Kualitas Standar', dataMp3.data.dl, '#333333');
                        }
                    } catch (e) {
                        console.log("Server 2 Gagal. Loncat ke Server Cadangan Terakhir...");
                    }
                }

                // 4. JIKA SERVER 2 GAGAL, COBA SERVER 3 (Agatz Backup)
                if (!isSuccess) {
                     try {
                        const dataBackup = await fetchWithProxy(`https://api.agatz.my.id/api/ytmp4?url=${url}`);
                        if (dataBackup?.data?.dl_link) {
                            formatsHtml += createDownloadCard('Video (MP4)', 'Server Cadangan', dataBackup.data.dl_link, 'var(--yt-red)');
                            isSuccess = true;
                        }
                     } catch (e) {
                        console.log("Server 3 Gagal.");
                     }
                }

                if (!isSuccess || formatsHtml === '') {
                    throw new Error("Semua server downloader sedang penuh. Coba video lain.");
                }

                // 5. RENDER UI KE LAYAR
                renderNativeUI(title, thumbnail, formatsHtml);

            } catch (error) {
                console.error('Error:', error);
                alert(`Gagal: ${error.message}`);
            } finally {
                loadingIndicator.style.display = 'none';
                generateBtn.disabled = false;
                generateBtn.innerText = 'Generate';
            }
        });
    }

    // Fungsi Bantuan Buat Render Kotak Tombol Download
    function createDownloadCard(title, subtitle, link, btnColor) {
        return `
            <div class="download-card" style="display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color);">
                <div class="format-info">
                    <p style="font-weight: 600; margin-bottom: 0.2rem; color: var(--text-main);">${title}</p>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">${subtitle}</span>
                </div>
                <a href="${link}" target="_blank" rel="noopener noreferrer" class="btn-download" style="background-color: ${btnColor}; color: white; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: bold; text-decoration: none;">
                    Download
                </a>
            </div>
        `;
    }

    // Fungsi Render Tampilan Hasil Utama (Judul & Thumbnail)
    function renderNativeUI(title, thumbnail, formatsHtml) {
        resultContainer.style.display = 'block';
        
        const htmlContent = `
            <div class="media-info" style="display: flex; gap: 1.5rem; background-color: var(--bg-card); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; align-items: center; border: 1px solid var(--border-color); flex-wrap: wrap;">
                <img src="${thumbnail}" alt="Thumbnail" style="max-width: 250px; border-radius: 8px; width: 100%; object-fit: cover;">
                <div class="media-details">
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-main); font-size: 1.2rem;">${title}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Sistem berhasil membongkar akses format di bawah ini. Silakan unduh.</p>
                </div>
            </div>

            <div class="download-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                ${formatsHtml}
            </div>
        `;

        resultContainer.innerHTML = htmlContent;
    }
});
