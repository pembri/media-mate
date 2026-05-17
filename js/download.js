// js/downloader.js - Logic utama YouTube Downloader

let currentVideoData = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const generateBtn = document.getElementById('generateBtn');
    const resultContainer = document.getElementById('result');

    // Enter key support
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateBtn.click();
        }
    });

    generateBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();

        if (!url) {
            alert('Masukkan link YouTube terlebih dahulu!');
            return;
        }

        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            alert('Link yang dimasukkan bukan link YouTube!');
            return;
        }

        // Loading state
        generateBtn.textContent = 'Memproses...';
        generateBtn.disabled = true;
        resultContainer.classList.add('hidden');

        try {
            const response = await fetch('/api/download', {  // Akan diubah sesuai Worker nanti
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url })
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data video');
            }

            const data = await response.json();
            currentVideoData = data;

            displayVideoInfo(data);
            resultContainer.classList.remove('hidden');

        } catch (error) {
            console.error(error);
            alert('Gagal memproses video. Pastikan link benar atau coba lagi nanti.');
        } finally {
            generateBtn.textContent = 'Generate';
            generateBtn.disabled = false;
        }
    });
});

// Tampilkan informasi video + format
function displayVideoInfo(data) {
    document.getElementById('thumbnail').src = data.thumbnail;
    document.getElementById('title').textContent = data.title;
    document.getElementById('duration').textContent = `Durasi: ${data.duration} | Views: ${data.views?.toLocaleString() || '-'}`;

    const formatsContainer = document.getElementById('formats');
    formatsContainer.innerHTML = '';

    // Video Formats
    if (data.formats && data.formats.video.length > 0) {
        const videoTitle = document.createElement('h3');
        videoTitle.textContent = '📹 Video';
        videoTitle.style.gridColumn = '1 / -1';
        videoTitle.style.margin = '10px 0 5px';
        formatsContainer.appendChild(videoTitle);

        data.formats.video.forEach(format => {
            formatsContainer.appendChild(createFormatCard(format, 'video'));
        });
    }

    // Audio Formats
    if (data.formats && data.formats.audio.length > 0) {
        const audioTitle = document.createElement('h3');
        audioTitle.textContent = '🎵 Audio';
        audioTitle.style.gridColumn = '1 / -1';
        audioTitle.style.margin = '20px 0 5px';
        formatsContainer.appendChild(audioTitle);

        data.formats.audio.forEach(format => {
            formatsContainer.appendChild(createFormatCard(format, 'audio'));
        });
    }
}

function createFormatCard(format, type) {
    const card = document.createElement('div');
    card.className = 'format-card';

    card.innerHTML = `
        <h4>${format.quality} ${type === 'video' ? '📹' : '🎵'}</h4>
        <p>${format.codec} • ${format.filesize || 'Unknown size'}</p>
        <button class="download-btn" onclick="downloadFile('\( {format.url}', ' \){format.quality}')">
            Download ${type.toUpperCase()}
        </button>
    `;

    return card;
}

// Fungsi Download
window.downloadFile = function(url, quality) {
    if (!url) {
        alert('Link download tidak tersedia');
        return;
    }
    
    const link = document.createElement('a');
    link.href = url;
    link.download = ''; // Biarkan browser tentukan nama file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
