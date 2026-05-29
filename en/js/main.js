// ===== 导航栏 =====
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// 汉堡菜单
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// ===== 回到顶部 =====
const backToTop = document.getElementById('backToTop');

if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== 数字动画 =====
let numbersAnimated = false;

const animateNumbers = () => {
    if (numbersAnimated) return;
    numbersAnimated = true;

    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                if (suffix === '%') {
                    counter.textContent = current.toFixed(2) + suffix;
                } else {
                    counter.textContent = Math.floor(current) + suffix;
                }
                requestAnimationFrame(updateCounter);
            } else {
                if (suffix === '%') {
                    counter.textContent = target.toFixed(2) + suffix;
                } else {
                    counter.textContent = target + suffix;
                }
            }
        };

        updateCounter();
    });
};

// ===== Intersection Observer =====
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('hero-stats')) {
                animateNumbers();
            }
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.hero-stats, .about-content, .service-card, .advantage-card, .case-card, .craft-preview-item, .culture-card, .qualification-card, .quality-item, .advantage-item, .team-member, .timeline-item, .store-card, .store-contact-card, .contact-card, .standard-card, .process-step, .brand-item, .style-card, .ritual-item, .protection-card, .layout-advantage, .craft-card, .tiling-item, .installation-item, .quality-level, .after-sales-item, .guide-step').forEach(el => {
    observer.observe(el);
});

// ===== 客户评价轮播 =====
const testimonialCards = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.dot');
let currentTestimonial = 0;
let testimonialInterval;

function showTestimonial(index) {
    if (testimonialCards.length === 0 || dots.length === 0) return;

    testimonialCards.forEach(card => card.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    if (testimonialCards[index]) {
        testimonialCards[index].classList.add('active');
    }
    if (dots[index]) {
        dots[index].classList.add('active');
    }
    currentTestimonial = index;
}

function nextTestimonial() {
    const next = (currentTestimonial + 1) % testimonialCards.length;
    showTestimonial(next);
}

function startTestimonialAutoplay() {
    if (testimonialCards.length > 1) {
        testimonialInterval = setInterval(nextTestimonial, 5000);
    }
}

function stopTestimonialAutoplay() {
    if (testimonialInterval) {
        clearInterval(testimonialInterval);
    }
}

if (dots.length > 0) {
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopTestimonialAutoplay();
            showTestimonial(index);
            startTestimonialAutoplay();
        });
    });
}

if (testimonialCards.length > 0) {
    const slider = document.querySelector('.testimonials-slider');
    if (slider) {
        slider.addEventListener('mouseenter', stopTestimonialAutoplay);
        slider.addEventListener('mouseleave', startTestimonialAutoplay);
    }
    startTestimonialAutoplay();
}

// ===== 案例筛选 =====
const filterBtns = document.querySelectorAll('.filter-btn');
const caseItems = document.querySelectorAll('.case-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        caseItems.forEach(item => {
            const category = item.getAttribute('data-category');

            if (filter === 'all' || category === filter) {
                item.style.display = '';
                item.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// ===== 视图切换 =====
const viewBtns = document.querySelectorAll('.view-btn');
const galleryGrid = document.querySelector('.gallery-grid');

if (viewBtns.length > 0 && galleryGrid) {
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.querySelector('.fa-list')) {
                galleryGrid.classList.add('list-view');
            } else {
                galleryGrid.classList.remove('list-view');
            }
        });
    });
}

// ===== FAQ手风琴 =====
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');

        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ===== 联系表单处理 =====
const consultationForm = document.getElementById('consultForm');

if (consultationForm) {
    consultationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(consultationForm);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.phone || !data.area || !data.type || !data.service) {
            showToast('请填写所有必填项', 'error');
            return;
        }

        const phoneRegex = /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/;
        if (!phoneRegex.test(data.phone)) {
            showToast('请输入正确的电话号码', 'error');
            return;
        }

        console.log('表单数据:', data);
        showToast('您的预约申请已提交！我们将在24小时内与您联系。', 'success');
        consultationForm.reset();
    });
}

// ===== Toast通知 =====
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        padding: 16px 28px;
        border-radius: 12px;
        color: white;
        font-size: 15px;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
    `;

    if (type === 'success') {
        toast.style.background = 'linear-gradient(135deg, #2E7D32, #1B5E20)';
        toast.innerHTML = '<i class="fas fa-check-circle"></i> ' + message;
    } else {
        toast.style.background = 'linear-gradient(135deg, #C62828, #B71C1C)';
        toast.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + message;
    }

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ===== 平滑滚动到锚点 =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== 案例卡片悬停效果 =====
caseItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-8px)';
    });

    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0)';
    });
});

// ===== 滚动动画 =====
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.section-header, .craft-feature, .ritual-item, .protection-card, .layout-advantage, .craft-card, .tiling-item, .installation-item, .quality-level, .after-sales-item, .craft-preview-item, .culture-card, .qualification-card, .quality-item, .advantage-item, .team-member, .timeline-item, .store-card, .store-contact-card, .contact-card, .standard-card, .process-step, .brand-item, .style-card, .guide-step');

    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 80;

        if (isVisible && !el.classList.contains('animated')) {
            el.classList.add('animated');
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
};

const scrollAnimationElements = document.querySelectorAll('.craft-feature, .ritual-item, .protection-card, .layout-advantage, .craft-card, .tiling-item, .installation-item, .quality-level, .after-sales-item, .craft-preview-item, .culture-card, .qualification-card, .quality-item, .advantage-item, .team-member, .timeline-item, .store-card, .store-contact-card, .contact-card, .standard-card, .process-step, .brand-item, .style-card, .guide-step');

scrollAnimationElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
});

window.addEventListener('scroll', animateOnScroll);

// ===== 服务选项卡切换 =====
const tabBtns = document.querySelectorAll('.tab-btn');

if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabId = btn.getAttribute('data-tab');
            const targetSection = document.getElementById(tabId);

            if (targetSection) {
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== 页面加载完成 =====
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');

    setTimeout(() => {
        animateOnScroll();
    }, 100);

    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    const storeCards = document.querySelectorAll('.store-contact-card');
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (storeCards.length && mapPlaceholder) {
        storeCards.forEach(card => {
            card.addEventListener('click', () => {
                storeCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                const addressHtml = card.getAttribute('data-address-html');
                const mapUrl = card.getAttribute('data-map-url');
                if (addressHtml) {
                    const p = mapPlaceholder.querySelector('p');
                    if (p) p.innerHTML = addressHtml;
                }
                if (mapUrl) {
                    const a = mapPlaceholder.querySelector('a');
                    if (a) a.href = mapUrl;
                }
            });
        });
    }
});
