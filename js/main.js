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
const API_BASE = 'http://localhost:3001/api';

// 多语言支持
const i18n = {
    zh: {
        submitting: '<i class="fas fa-spinner fa-spin"></i> 提交中...',
        fillRequired: '请填写所有必填项',
        invalidPhone: '请输入正确的手机号码',
        submitSuccess: '预约提交成功！我们的顾问将在24小时内与您联系',
        submitError: '提交失败，请稍后重试',
        networkError: '网络错误，请检查网络连接或稍后重试',
        submitBtnText: '<i class="fas fa-paper-plane"></i> 提交预约申请'
    },
    en: {
        submitting: '<i class="fas fa-spinner fa-spin"></i> Submitting...',
        fillRequired: 'Please fill in all required fields',
        invalidPhone: 'Please enter a valid phone number',
        submitSuccess: 'Booking submitted successfully! Our consultant will contact you within 24 hours',
        submitError: 'Submission failed, please try again later',
        networkError: 'Network error, please check your connection or try again later',
        submitBtnText: '<i class="fas fa-paper-plane"></i> Submit Booking Request'
    },
    ms: {
        submitting: '<i class="fas fa-spinner fa-spin"></i> Menghantar...',
        fillRequired: 'Sila isi semua medan yang diperlukan',
        invalidPhone: 'Sila masukkan nombor telefon yang sah',
        submitSuccess: 'Tempahan berjaya dihantar! Perunding kami akan menghubungi anda dalam masa 24 jam',
        submitError: 'Penghantaran gagal, sila cuba lagi kemudian',
        networkError: 'Ralat rangkaian, sila periksa sambungan atau cuba lagi kemudian',
        submitBtnText: '<i class="fas fa-paper-plane"></i> Hantar Permohonan'
    },
    km: {
        submitting: '<i class="fas fa-spinner fa-spin"></i> កំពុងដាក់ស្នើ...',
        fillRequired: 'សូមបំពេញវាលដែលត្រូវការទាំងអស់',
        invalidPhone: 'សូមបញ្ចូលលេខទូរស័ព្ទត្រឹមត្រូវ',
        submitSuccess: 'ការកក់ត្រូវបានដាក់ស្នើដោយជោគជ័យ! ទីប្រឹក្សារបស់យើងនឹងទាក់ទងអ្នកក្នុងរយៈពេល 24 ម៉ោង',
        submitError: 'ការដាក់ស្នើបរាជ័យ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ',
        networkError: 'កំហុសបណ្តាញ សូមពិនិត្យមើលការតភ្ជាប់ឬព្យាយាមម្តងទៀតនៅពេលក្រោយ',
        submitBtnText: '<i class="fas fa-paper-plane"></i> ដាក់ស្នើការកក់'
    }
};

// 检测当前语言
function getCurrentLang() {
    const htmlLang = document.documentElement.lang;
    if (htmlLang === 'en' || htmlLang.startsWith('en')) return 'en';
    if (htmlLang === 'ms' || htmlLang.startsWith('ms')) return 'ms';
    if (htmlLang === 'km' || htmlLang.startsWith('km')) return 'km';
    return 'zh';
}

if (consultationForm) {
    consultationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const lang = getCurrentLang();
        const t = i18n[lang];
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = t.submitting;
        submitBtn.disabled = true;

        const formData = new FormData(consultationForm);
        const data = Object.fromEntries(formData.entries());

        // 验证必填项
        if (!data.name || !data.phone || !data.house_type || !data.region) {
            showToast(t.fillRequired, 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        // 验证手机号（中国手机号格式）
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(data.phone)) {
            showToast(t.invalidPhone, 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        // 准备提交数据
        const submitData = {
            name: data.name,
            phone: data.phone,
            region: data.region,
            house_type: data.house_type,
            area: data.area ? parseInt(data.area) : null,
            budget: data.budget || null,
            address: data.address || null,
            preferred_time: data.preferred_time || null,
            remark: data.remark || null,
            source: 'website'
        };

        try {
            const response = await fetch(API_BASE + '/public/consultations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                showToast(t.submitSuccess, 'success');
                consultationForm.reset();
            } else {
                showToast(result.error || t.submitError, 'error');
            }
        } catch (error) {
            console.error('提交错误:', error);
            showToast(t.networkError, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
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

// ===== 门店卡片选中切换 =====
const storeCards = document.querySelectorAll('.store-contact-card');

if (storeCards.length > 0) {
    storeCards.forEach(card => {
        card.addEventListener('click', () => {
            storeCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            const addressHtml = card.getAttribute('data-address-html');
            const mapUrl = card.getAttribute('data-map-url');

            const mapPlaceholder = document.querySelector('.map-placeholder');
            if (mapPlaceholder) {
                const addressP = mapPlaceholder.querySelector('p');
                if (addressP && addressHtml) {
                    addressP.innerHTML = addressHtml;
                }
                const mapLink = mapPlaceholder.querySelector('a.btn');
                if (mapLink && mapUrl) {
                    mapLink.href = mapUrl;
                }
            }
        });
    });
}

// ===== 首页向下滚动按钮 =====
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
        const aboutSection = document.getElementById('aboutPreview');
        if (aboutSection) {
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = aboutSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
}

// ===== 页面加载完成 =====
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');

    // 图片加载处理
    document.querySelectorAll('.img-wrapper img').forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        }
    });

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

    // 处理锚点链接跳转
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            setTimeout(() => {
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 30;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }, 300);
        }
    }
});
