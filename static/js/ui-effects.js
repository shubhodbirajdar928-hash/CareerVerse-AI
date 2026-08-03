/* Scroll reveal, navbar, counters, mobile nav, FAQ */
(function () {
    'use strict';

    /* Navbar scroll effect */
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    /* Mobile navigation */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    /* Scroll reveal */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => observer.observe(el));
    }

    /* Animated stat counters */
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = el.dataset.count;
                const suffix = el.dataset.suffix || '';
                const prefix = el.dataset.prefix || '';

                if (target === '∞') {
                    el.textContent = '∞';
                    countObserver.unobserve(el);
                    return;
                }

                const num = parseInt(target, 10);
                if (isNaN(num)) {
                    el.textContent = prefix + target + suffix;
                    countObserver.unobserve(el);
                    return;
                }

                let current = 0;
                const step = Math.max(1, Math.floor(num / 40));
                const timer = setInterval(() => {
                    current += step;
                    if (current >= num) {
                        current = num;
                        clearInterval(timer);
                    }
                    el.textContent = prefix + current + suffix;
                }, 30);

                countObserver.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach(el => countObserver.observe(el));
    }

    /* FAQ accordion */
    document.querySelectorAll('.faq-item').forEach(item => {
        const btn = item.querySelector('.faq-question');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                openItem.classList.remove('open');
            });

            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });
})();
