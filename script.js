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
        generateBtn.addEventListener('click', () => {
            const url = urlInput.value.trim();
            
            // Validasi input kosong
            if (!url) {
                alert('Masukkan URL YouTube terlebih dahulu!');
                return;
            }

            // Validasi URL YouTube
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

            // Simulasi loading sebentar biar UI terasa natural
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
                generateBtn.disabled = false;
                generateBtn.innerText = 'Generate';
                renderResults(url);
            }, 1000);
        });
    }

    // === 3. FUNGSI RENDER HASIL (MENGGUNAKAN IFRAME API) ===
    function renderResults(url) {
        resultContainer.style.display = 'block';
        
        // Encode URL biar aman dibaca oleh API
        const encodedUrl = encodeURIComponent(url);

        const htmlContent = `
            <div class="media-info">
                <div class="media-details">
                    <h3>Siap Diunduh!</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Klik tombol di dalam kotak di bawah ini. Proses konversi akan berjalan langsung di tombol tersebut.</p>
                </div>
            </div>

            <div class="download-grid">
                <div class="download-card" style="flex-direction: column; align-items: flex-start; gap: 15px;">
                    <div class="format-info">
                        <p>Video (MP4)</p>
                        <span>Kualitas 1080p / 720p</span>
                    </div>
                    <iframe style="width:100%; height:60px; border:0; overflow:hidden; border-radius:6px;" scrolling="no" src="https://loader.to/api/button/?url=${encodedUrl}&f=1080&color=ff0000"></iframe>
                </div>

                <div class="download-card" style="flex-direction: column; align-items: flex-start; gap: 15px;">
                    <div class="format-info">
                        <p>Audio (MP3)</p>
                        <span>Musik / Podcast</span>
                    </div>
                    <iframe style="width:100%; height:60px; border:0; overflow:hidden; border-radius:6px;" scrolling="no" src="https://loader.to/api/button/?url=${encodedUrl}&f=mp3&color=333333"></iframe>
                </div>
            </div>
        `;

        resultContainer.innerHTML = htmlContent;
    }
});
