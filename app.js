// ==========================================
// KONFIGURASI UTAMA
// ==========================================
const WORKER_URL = "https://media-mate.pembriahmad526.workers.dev/";

document.addEventListener('DOMContentLoaded', () => {
    renderUI();
    setupSidebar();
    setupDownloader();
});

// ==========================================
// 1. FUNGSI INJEKSI HEADER & FOOTER
// ==========================================
function renderUI() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = `
            <header>
                <nav class="navbar">
                    <button id="menu-toggle" class="hamburger"><i class="fas fa-bars"></i></button>
                    <a href="/media-mate/index" class="logo">MEDIA<span>MATE</span></a>
                </nav>
            </header>
            
            <aside id="sidebar" class="sidebar">
                <div class="sidebar-header">
                    <span class="logo">MEDIA<span>MATE</span></span>
                    <button id="close-menu"><i class="fas fa-times"></i></button>
                </div>
                <ul class="nav-links">
                    <li><a href="/media-mate/index"><i class="fas fa-home"></i> Beranda</a></li>
                    <li><a href="/media-mate/youtube"><i class="fab fa-youtube"></i> YouTube Downloader</a></li>
                    <li><a href="/media-mate/instagram"><i class="fab fa-instagram"></i> Instagram Downloader</a></li>
                    <li><a href="/media-mate/tiktok"><i class="fab fa-tiktok"></i> TikTok Downloader</a></li>
                    <li><a href="/media-mate/facebook"><i class="fab fa-facebook"></i> Facebook Downloader</a></li>
                    <li style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                        <a href="/media-mate/about"><i class="fas fa-info-circle"></i> Tentang Kami</a>
                    </li>
                </ul>
            </aside>
            <div id="overlay" class="overlay"></div>
        `;
    }

    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
            <footer>
                <div class="footer-content">
                    <p>&copy; 2026 <strong>Media Mate</strong>. All Rights Reserved.</p>
                    <p style="margin-top: 5px;">
                        <a href="/media-mate/about">Tentang</a> | <a href="#">DMCA</a>
                    </p>
                </div>
            </footer>
        `;
    }
}

// ==========================================
// 2. FUNGSI LOGIKA SIDEBAR HAMBURGER
// ==========================================
function setupSidebar() {
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (menuToggle && closeMenu && sidebar && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });

        const closeSidebar = () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        };

        closeMenu.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
    }
}

// ==========================================
// 3. FUNGSI LOGIKA DOWNLOADER (KONEK KE WORKER)
// ==========================================
function setupDownloader() {
    const btnCheck = document.getElementById('btn-check');
    const urlInput = document.getElementById('url-input');
    const resultArea = document.getElementById('result-area');

    if (btnCheck && urlInput && resultArea) {
        btnCheck.addEventListener('click', async () => {
            const url = urlInput.value.trim();
            
            // Validasi kosong
            if (!url) {
                alert("Masukkan URL video terlebih dahulu!");
                return;
            }

            // Ubah state tombol jadi loading
            btnCheck.disabled = true;
            btnCheck.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            resultArea.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--tk-color); margin-bottom: 10px;"></i>
                    <p style="color: var(--text-gray);">Menembus server, harap tunggu...</p>
                </div>
            `;

            try {
                // Tembak API di Cloudflare Worker lu
                const response = await fetch(WORKER_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ url: url })
                });

                const data = await response.json();

                // Handle error dari Cobalt API
                if (data.status === "error") {
                    resultArea.innerHTML = `
                        <div class="result-card" style="border-left: 4px solid var(--yt-color);">
                            <p style="color: var(--yt-color);"><b><i class="fas fa-exclamation-triangle"></i> Gagal:</b> ${data.text || "Link tidak valid atau video diprivate."}</p>
                        </div>
                    `;
                } 
                // Handle sukses (Cobalt biasanya balikin status 'redirect', 'stream', atau 'picker' dengan url aslinya)
                else if (data.url || data.status === "stream" || data.status === "redirect") {
                    resultArea.innerHTML = `
                        <div class="result-card" style="border-left: 4px solid #00f2fe;">
                            <p style="color: #0f0;"><b><i class="fas fa-check-circle"></i> Berhasil!</b> Video siap didownload.</p>
                            <a href="${data.url}" target="_blank" rel="noopener noreferrer" class="result-btn">
                                <i class="fas fa-download"></i> Download File
                            </a>
                        </div>
                    `;
                } else {
                    // Antisipasi response aneh
                    resultArea.innerHTML = `
                        <div class="result-card">
                            <p style="color: var(--yt-color);">Gagal memproses data. Coba link yang lain.</p>
                        </div>
                    `;
                }

            } catch (err) {
                // Handle error koneksi / Worker mati
                resultArea.innerHTML = `
                    <div class="result-card" style="border-left: 4px solid var(--yt-color);">
                        <p style="color: var(--yt-color);"><b><i class="fas fa-wifi"></i> Koneksi Gagal:</b> Tidak dapat terhubung ke server pemroses.</p>
                    </div>
                `;
                console.error("Fetch Error:", err);
            } finally {
                // Kembalikan tombol ke kondisi semula
                btnCheck.disabled = false;
                btnCheck.innerHTML = 'Proses';
            }
        });

        // Bisa enter di keyboard
        urlInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') btnCheck.click();
        });
    }
}
