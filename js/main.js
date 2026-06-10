/**
 * 洁尚装饰集团 - 建筑空间艺术
 * 导航滚动、数字计数、作品筛选、滚动揭示、表单验证、视差
 */
(function() {
    'use strict';

    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const statValues = document.querySelectorAll('.stat-value[data-count]');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workCards = document.querySelectorAll('.work-card');
    const contactForm = document.getElementById('contactForm');

    /* ---- Navigation ---- */
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    function handleNavScroll() {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    }

    /* ---- Smooth Scroll ---- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#' || !href.match(/^#[\w-]+$/)) return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.pageYOffset - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ---- Number Counter ---- */
    function animateCounters() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const end = parseInt(el.getAttribute('data-count'));
                    const start = performance.now();
                    const duration = 2000;

                    (function tick(now) {
                        const progress = Math.min((now - start) / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);
                        el.textContent = Math.floor(ease * end).toLocaleString();
                        if (progress < 1) requestAnimationFrame(tick);
                    })(start);

                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        statValues.forEach(s => observer.observe(s));
    }

    /* ---- Works Filter ---- */
    function initFilter() {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                workCards.forEach(card => {
                    const cat = card.getAttribute('data-category');
                    const show = filter === 'all' || cat === filter;
                    card.classList.toggle('hidden', !show);
                    if (show) {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        requestAnimationFrame(() => {
                            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        });
                    }
                });
            });
        });
    }

    /* ---- Scroll Reveal ---- */
    function initReveal() {
        const targets = document.querySelectorAll(
            '.section-header, .craft-card, .work-card, .store-card, ' +
            '.about-content, .about-visual, .quality-content, .quality-visual, ' +
            '.contact-content, .contact-form-wrapper'
        );

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal', 'visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

        targets.forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }

    /* ---- Form Validation ---- */
    function initForm() {
        if (!contactForm) return;

        contactForm.addEventListener('submit', function(e) {
            const name = document.getElementById('name');
            const phone = document.getElementById('phone');
            let valid = true;

            if (!name.value.trim()) {
                showError(name, '请输入您的姓名');
                valid = false;
            } else { clearError(name); }

            if (!phone.value.trim()) {
                showError(phone, '请输入联系电话');
                valid = false;
            } else if (!/^1[3-9]\d{9}$/.test(phone.value.trim())) {
                showError(phone, '请输入正确的手机号码');
                valid = false;
            } else { clearError(phone); }

            if (!valid) e.preventDefault();
        });

        ['name', 'phone'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.addEventListener('input', () => clearError(input));
        });
    }

    function showError(input, msg) {
        clearError(input);
        input.style.borderColor = '#ef4444';
        const err = document.createElement('span');
        err.className = 'error-message';
        err.style.cssText = 'color:#ef4444;font-size:0.8rem;margin-top:4px;display:block;';
        err.textContent = msg;
        input.closest('.form-group').appendChild(err);
    }

    function clearError(input) {
        input.style.borderColor = '';
        const err = input.closest('.form-group')?.querySelector('.error-message');
        if (err) err.remove();
    }

    /* ---- Parallax ---- */
    function initParallax() {
        const heroBg = document.querySelector('.hero-bg img');
        if (!heroBg) return;
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    heroBg.style.transform = 'translateY(' + (window.scrollY * 0.3) + 'px) scale(1.1)';
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /* ---- Service Links ---- */
    function initServiceLinks() {
        document.querySelectorAll('a[data-service]').forEach(link => {
            link.addEventListener('click', function(e) {
                const service = this.getAttribute('data-service');
                const select = document.getElementById('type');
                if (select) {
                    select.value = service;
                }
            });
        });
    }

    /* ---- Init ---- */
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
    animateCounters();
    initFilter();
    initReveal();
    initForm();
    initParallax();
    initServiceLinks();

})();
