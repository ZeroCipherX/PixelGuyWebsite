document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================
       MOBILE MENU TOGGLE — toggles .nav-overflow
       ========================================== */
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navOverflow = document.querySelector('.nav-overflow');

    if (menuToggle && navOverflow) {
        // Toggle overflow dropdown
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navOverflow.classList.toggle('active');

            const icon = menuToggle.querySelector('i');
            if (navOverflow.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-bars');
            }
        });

        // Close when an overflow link is tapped
        navOverflow.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navOverflow.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-bars');
            });
        });

        // Close when tapping outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navOverflow.contains(e.target)) {
                navOverflow.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-bars');
            }
        });
    }
});
