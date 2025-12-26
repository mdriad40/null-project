// Admin UI Helper Functions
// Theme Toggle and Mobile Menu functionality

(function () {
    'use strict';

    // Admin Theme Toggle (separate from main app theme)
    function initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const currentTheme = localStorage.getItem('adminTheme') || 'dark';
        document.documentElement.setAttribute('data-admin-theme', currentTheme);

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-admin-theme');
                const newTheme = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-admin-theme', newTheme);
                localStorage.setItem('adminTheme', newTheme);
            });
        }
    }

    // Mobile menu toggle
    function initMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const menuClose = document.getElementById('menuClose');
        const adminSidebar = document.getElementById('adminSidebar');
        const menuOverlay = document.getElementById('menuOverlay');

        function openMenu() {
            if (adminSidebar) adminSidebar.classList.add('open');
            if (menuOverlay) menuOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            if (adminSidebar) adminSidebar.classList.remove('open');
            if (menuOverlay) menuOverlay.classList.remove('show');
            document.body.style.overflow = '';
        }

        if (menuToggle) {
            menuToggle.addEventListener('click', openMenu);
        }
        if (menuClose) {
            menuClose.addEventListener('click', closeMenu);
        }
        if (menuOverlay) {
            menuOverlay.addEventListener('click', closeMenu);
        }

        // Close menu when clicking a menu item (mobile)
        const menuItems = document.querySelectorAll('.admin-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    closeMenu();
                }
            });
        });

        // Close menu on window resize if desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initThemeToggle();
            initMobileMenu();
        });
    } else {
        initThemeToggle();
        initMobileMenu();
    }
})();
