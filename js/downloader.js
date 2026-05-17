// js/downloader.js
document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const generateBtn = document.getElementById('generateBtn');

    generateBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        
        if (!url) {
            alert("Masukkan link YouTube!");
            return;
        }

        generateBtn.textContent = "Memproses...";
        generateBtn.disabled = true;

        try {
            const response = await fetch('https://worker-ytcloud.pembriahmad526.workers.dev/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();
            console.log("Response dari Worker:", data);   // Untuk debug

            if (data.error) {
                alert(data.error);
            } else {
                alert("Sukses! Title: " + data.title);   // Test dulu
                // nanti kita tampilkan hasilnya
            }
        } catch (err) {
            console.error(err);
            alert("Gagal koneksi ke server. Coba lagi.");
        } finally {
            generateBtn.textContent = "Generate";
            generateBtn.disabled = false;
        }
    });
});
