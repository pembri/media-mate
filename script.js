document.addEventListener('DOMContentLoaded', () => {
    // === HAMBURGER MENU ===
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // === DOWNLOADER LOGIC ===
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

            // Validasi format YouTube
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
            generateBtn.innerText = 'Memproses...';

            try {
                // Tembak ke API buatan kita sendiri di Cloudflare Functions
                const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
                const data = await response.json();

                if (!data.success || (!data.mp4 && !data.mp3)) {
                    throw new Error(data.error || "Server tidak dapat menemukan format unduhan.");
                }

                let formatsHtml = '';

                // Bikin Tombol MP4
                if (data.mp4) {
                    formatsHtml += `
                        <div class="download-card" style="display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color);">
                            <div class="format-info">
                                <p style="font-weight: 600; margin-bottom: 0.2rem; color: var(--text-main);">Video (MP4)</p>
                                <span style="font-size: 0.85rem; color: var(--text-muted);">Resolusi Terbaik</span>
                            </div>
                            <a href="${data.mp4}" target="_blank" rel="noopener noreferrer" class="btn-download" style="background-color: var(--yt-red); color: white; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: bold;">Download</a>
                        </div>
                    `;
                }

                // Bikin Tombol MP3
                if (data.mp3) {
                    formatsHtml += `
                        <div class="download-card" style="display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color);">
                            <div class="format-info">
                                <p style="font-weight: 600; margin-bottom: 0.2rem; color: var(--text-main);">Audio (MP3)</p>
                                <span style="font-size: 0.85rem; color: var(--text-muted);">Kualitas Standar</span>
                            </div>
                            <a href="${data.mp3}" target="_blank" rel="noopener noreferrer" class="btn-download" style="background-color: #333333; color: white; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: bold;">Download</a>
                        </div>
                    `;
                }

                // Tampilkan Hasil
                resultContainer.style.display = 'block';
                resultContainer.innerHTML = `
                    <div class="media-info" style="display: flex; gap: 1.5rem; background-color: var(--bg-card); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; align-items: center; border: 1px solid var(--border-color); flex-wrap: wrap;">
                        <img src="${data.thumbnail}" alt="Thumbnail" style="max-width: 250px; border-radius: 8px; width: 100%; object-fit: cover;">
                        <div class="media-details">
                            <h3 style="margin-bottom: 0.5rem; color: var(--text-main); font-size: 1.2rem;">${data.title}</h3>
                            <p style="color: var(--text-muted); font-size: 0.9rem;">File siap diunduh.</p>
                        </div>
                    </div>
                    <div class="download-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                        ${formatsHtml}
                    </div>
                `;

            } catch (error) {
                alert(`Gagal: ${error.message}`);
            } finally {
                loadingIndicator.style.display = 'none';
                generateBtn.disabled = false;
                generateBtn.innerText = 'Generate';
            }
        });
    }
});
