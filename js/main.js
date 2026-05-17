// js/main.js - Script umum untuk semua halaman

document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Tutup menu saat klik link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Set Active Link berdasarkan URL saat ini
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPage === href || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Close hamburger when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});
