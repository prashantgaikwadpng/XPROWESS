/*
 * ═══════════════════════════════════════════════════════════════════════════
 * XPROWESS - MAIN JAVASCRIPT
 * Advanced interactions: Particles, Scroll animations, Counters, Navigation
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────────
   UTILITY FUNCTIONS
   ───────────────────────────────────────────────────────────────────────────── */

const Utils = {
    // Debounce function
    debounce(func, wait = 100) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit = 100) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Lerp (Linear Interpolation)
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Map value from one range to another
    mapRange(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    // Check if element is in viewport
    isInViewport(element, offset = 0) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
            rect.bottom >= offset
        );
    },

    // Get random number between range
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Get random integer between range
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Ease out expo
    easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },

    // Ease out cubic
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    },

    // Ease in out cubic
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
};

/* ─────────────────────────────────────────────────────────────────────────────
   NAVIGATION CONTROLLER
   ───────────────────────────────────────────────────────────────────────────── */

class NavigationController {
    constructor() {
        this.header = document.querySelector('.header');
        this.mobileToggle = document.querySelector('.mobile-menu-toggle');
        this.mobileNav = document.querySelector('.nav-mobile');
        this.navOverlay = document.querySelector('.nav-overlay');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.lastScrollY = 0;
        this.scrollThreshold = 100;
        this.isMenuOpen = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setActiveLink();
    }

    bindEvents() {
        // Scroll handler
        window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 50));
        
        // Mobile menu toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close menu on overlay click
        if (this.navOverlay) {
            this.navOverlay.addEventListener('click', () => this.closeMobileMenu());
        }

        // Close menu on nav link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Handle resize
        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth > 1024 && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        }, 200));
    }

    handleScroll() {
        const currentScrollY = window.scrollY;

        // Add scrolled class
        if (currentScrollY > this.scrollThreshold) {
            this.header?.classList.add('scrolled');
        } else {
            this.header?.classList.remove('scrolled');
        }

        this.lastScrollY = currentScrollY;
    }

    toggleMobileMenu() {
        this.isMenuOpen ? this.closeMobileMenu() : this.openMobileMenu();
    }

    openMobileMenu() {
        this.isMenuOpen = true;
        this.mobileToggle?.classList.add('active');
        this.mobileNav?.classList.add('active');
        this.navOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.mobileToggle?.classList.remove('active');
        this.mobileNav?.classList.remove('active');
        this.navOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    setActiveLink() {
        const currentPath = window.location.pathname;
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.replace('../', '').replace('./', ''))) {
                link.classList.add('active');
            }
        });
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCROLL ANIMATION OBSERVER
   ───────────────────────────────────────────────────────────────────────────── */

class ScrollAnimator {
    constructor() {
        this.animatedElements = document.querySelectorAll('.animate-on-scroll');
        this.staggerContainers = document.querySelectorAll('.stagger-children');
        
        this.observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.createObservers();
        } else {
            this.showAllElements();
        }
    }

    createObservers() {
        const elementObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    elementObserver.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.animatedElements.forEach(el => elementObserver.observe(el));

        const staggerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    staggerObserver.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.staggerContainers.forEach(el => staggerObserver.observe(el));
    }

    showAllElements() {
        this.animatedElements.forEach(el => el.classList.add('visible'));
        this.staggerContainers.forEach(el => el.classList.add('visible'));
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   COUNTER ANIMATION
   ───────────────────────────────────────────────────────────────────────────── */

class CounterAnimator {
    constructor() {
        this.counters = document.querySelectorAll('[data-counter]');
        this.observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        this.init();
    }

    init() {
        if (this.counters.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.counter, 10);
        const suffix = element.dataset.suffix || '';
        const prefix = element.dataset.prefix || '';
        const duration = parseInt(element.dataset.duration, 10) || 2000;
        const decimals = parseInt(element.dataset.decimals, 10) || 0;
        
        let startTime = null;
        const startValue = 0;

        const step = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = Utils.easeOutExpo(progress);
            const currentValue = startValue + (target - startValue) * easedProgress;
            
            element.textContent = prefix + this.formatValue(currentValue, decimals) + suffix;
            element.classList.add('counting');

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = prefix + this.formatValue(target, decimals) + suffix;
                element.classList.remove('counting');
            }
        };

        requestAnimationFrame(step);
    }

    formatValue(value, decimals) {
        if (decimals > 0) {
            return value.toFixed(decimals);
        }
        return Utils.formatNumber(Math.floor(value));
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   PARTICLE SYSTEM
   ───────────────────────────────────────────────────────────────────────────── */

class ParticleSystem {
    constructor(canvasSelector) {
        this.canvas = document.querySelector(canvasSelector);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        
        this.config = {
            particleCount: 80,
            particleSize: { min: 1, max: 3 },
            particleSpeed: { min: 0.2, max: 0.8 },
            connectionDistance: 150,
            colors: ['#00F5D4', '#7B2FF7', '#00D4FF', '#FF2E93'],
            mouseInteraction: true
        };

        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Utils.random(0, this.canvas.width),
            y: Utils.random(0, this.canvas.height),
            size: Utils.random(this.config.particleSize.min, this.config.particleSize.max),
            speedX: Utils.random(-this.config.particleSpeed.max, this.config.particleSpeed.max),
            speedY: Utils.random(-this.config.particleSpeed.max, this.config.particleSpeed.max),
            color: this.config.colors[Utils.randomInt(0, this.config.colors.length - 1)],
            opacity: Utils.random(0.3, 0.8)
        };
    }

    bindEvents() {
        window.addEventListener('resize', Utils.debounce(() => {
            this.resize();
            this.createParticles();
        }, 200));

        if (this.config.mouseInteraction) {
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            window.addEventListener('mouseout', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.speedY *= -1;
            }

            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    particle.x -= Math.cos(angle) * force * 2;
                    particle.y -= Math.sin(angle) * force * 2;
                }
            }

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fill();

            this.particles.slice(index + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = particle.color;
                    this.ctx.globalAlpha = (1 - distance / this.config.connectionDistance) * 0.3;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });

        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animate());
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAGNETIC BUTTON EFFECT
   ───────────────────────────────────────────────────────────────────────────── */

class MagneticButtons {
    constructor(selector = '.btn-primary, .magnetic-hover') {
        this.buttons = document.querySelectorAll(selector);
        this.strength = 30;
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.addEventListener('mousemove', (e) => this.handleMouseMove(e, button));
            button.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, button));
        });
    }

    handleMouseMove(e, button) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const moveX = (x / rect.width) * this.strength;
        const moveY = (y / rect.height) * this.strength;

        button.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    handleMouseLeave(e, button) {
        button.style.transform = 'translate(0, 0)';
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   SMOOTH SCROLL
   ───────────────────────────────────────────────────────────────────────────── */

class SmoothScroll {
    constructor() {
        this.links = document.querySelectorAll('a[href^="#"]');
        this.headerHeight = 80;
        this.init();
    }

    init() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => this.handleClick(e, link));
        });
    }

    handleClick(e, link) {
        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const targetPosition = target.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = targetPosition - this.headerHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   VIDEO BACKGROUND
   ───────────────────────────────────────────────────────────────────────────── */

class VideoBackground {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        this.videos = ['v2.mp4', 'v3.mp4', 'v4.mp4', 'v5.mp4', 'v6.mp4'];
        this.currentIndex = 0;
        this.videoElement = null;
        this.basePath = 'assets/videos/';

        this.init();
    }

    init() {
        this.createVideoElement();
        this.loadVideo();
    }

    createVideoElement() {
        this.videoElement = document.createElement('video');
        this.videoElement.muted = true;
        this.videoElement.playsInline = true;
        this.videoElement.loop = false;
        this.videoElement.autoplay = true;

        this.videoElement.addEventListener('ended', () => this.nextVideo());
        this.videoElement.addEventListener('error', () => this.nextVideo());

        this.container.appendChild(this.videoElement);
    }

    loadVideo() {
        const videoPath = this.basePath + this.videos[this.currentIndex];
        this.videoElement.src = videoPath;
        this.videoElement.play().catch(() => {
            this.nextVideo();
        });
    }

    nextVideo() {
        this.currentIndex = (this.currentIndex + 1) % this.videos.length;
        this.loadVideo();
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCROLL TO TOP BUTTON
   ───────────────────────────────────────────────────────────────────────────── */

class ScrollToTop {
    constructor() {
        this.button = document.querySelector('.scroll-top');
        this.threshold = 500;

        if (this.button) {
            this.init();
        }
    }

    init() {
        window.addEventListener('scroll', Utils.throttle(() => this.toggleVisibility(), 100));
        this.button.addEventListener('click', () => this.scrollToTop());
    }

    toggleVisibility() {
        if (window.scrollY > this.threshold) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   TILT EFFECT (3D Card Hover)
   ───────────────────────────────────────────────────────────────────────────── */

class TiltEffect {
    constructor(selector = '.tilt-hover, .service-card') {
        this.elements = document.querySelectorAll(selector);
        this.maxTilt = 10;
        this.init();
    }

    init() {
        this.elements.forEach(element => {
            element.addEventListener('mousemove', (e) => this.handleMouseMove(e, element));
            element.addEventListener('mouseleave', () => this.handleMouseLeave(element));
        });
    }

    handleMouseMove(e, element) {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const tiltX = ((y - centerY) / centerY) * this.maxTilt;
        const tiltY = ((centerX - x) / centerX) * this.maxTilt;

        element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    }

    handleMouseLeave(element) {
        element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   TEXT SCRAMBLE EFFECT
   ───────────────────────────────────────────────────────────────────────────── */

class TextScramble {
    constructor(element) {
        this.element = element;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.element.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise(resolve => this.resolve = resolve);
        this.queue = [];

        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0; i < this.queue.length; i++) {
            let { from, to, start, end, char } = this.queue[i];

            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char">${char}</span>`;
            } else {
                output += from;
            }
        }

        this.element.innerHTML = output;

        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   TYPING EFFECT
   ───────────────────────────────────────────────────────────────────────────── */

class TypingEffect {
    constructor(element, strings, options = {}) {
        this.element = element;
        this.strings = strings;
        this.options = {
            typeSpeed: options.typeSpeed || 100,
            deleteSpeed: options.deleteSpeed || 50,
            delayBetween: options.delayBetween || 2000,
            loop: options.loop !== false
        };

        this.currentStringIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;

        this.init();
    }

    init() {
        this.type();
    }

    type() {
        const currentString = this.strings[this.currentStringIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentString.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            this.element.textContent = currentString.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }

        let typeSpeed = this.isDeleting ? this.options.deleteSpeed : this.options.typeSpeed;

        if (!this.isDeleting && this.currentCharIndex === currentString.length) {
            typeSpeed = this.options.delayBetween;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentStringIndex = (this.currentStringIndex + 1) % this.strings.length;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   FORM VALIDATION
   ───────────────────────────────────────────────────────────────────────────── */

class FormValidator {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        if (!this.form) return;

        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        this.form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearError(field));
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        
        let isValid = true;
        this.form.querySelectorAll('[required]').forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (isValid) {
            this.submitForm();
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let message = '';

        if (field.required && !value) {
            isValid = false;
            message = 'This field is required';
        }
        else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }
        else if (type === 'tel' && value) {
            const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
        }

        if (!isValid) {
            this.showError(field, message);
        } else {
            this.clearError(field);
        }

        return isValid;
    }

    showError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentElement.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            field.parentElement.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearError(field) {
        field.classList.remove('error');
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    submitForm() {
        console.log('Form submitted successfully!');
        
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.textContent = 'Thank you! Your message has been sent.';
        this.form.innerHTML = '';
        this.form.appendChild(successMessage);
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   CUSTOM CURSOR
   ───────────────────────────────────────────────────────────────────────────── */

class CustomCursor {
    constructor() {
        if (window.innerWidth < 1024 || 'ontouchstart' in window) return;

        this.cursor = null;
        this.cursorDot = null;
        this.init();
    }

    init() {
        this.createCursor();
        this.bindEvents();
    }

    createCursor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        
        this.cursorDot = document.createElement('div');
        this.cursorDot.className = 'custom-cursor-dot';

        document.body.appendChild(this.cursor);
        document.body.appendChild(this.cursorDot);

        const style = document.createElement('style');
        style.textContent = `
            .custom-cursor {
                width: 40px;
                height: 40px;
                border: 2px solid var(--cyber-mint);
                border-radius: 50%;
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
                transition: width 0.2s, height 0.2s, border-color 0.2s;
            }
            .custom-cursor.hover {
                width: 60px;
                height: 60px;
                border-color: var(--electric-purple);
            }
            .custom-cursor-dot {
                width: 6px;
                height: 6px;
                background: var(--cyber-mint);
                border-radius: 50%;
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        let cursorX = 0, cursorY = 0;
        let dotX = 0, dotY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            
            this.cursorDot.style.left = `${e.clientX}px`;
            this.cursorDot.style.top = `${e.clientY}px`;
        });

        const animateCursor = () => {
            dotX += (cursorX - dotX) * 0.15;
            dotY += (cursorY - dotY) * 0.15;
            
            this.cursor.style.left = `${dotX}px`;
            this.cursor.style.top = `${dotY}px`;
            
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        document.querySelectorAll('a, button, .btn').forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
        });
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   PARALLAX EFFECT
   ───────────────────────────────────────────────────────────────────────────── */

class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('[data-parallax]');
        if (this.elements.length === 0) return;

        this.init();
    }

    init() {
        window.addEventListener('scroll', Utils.throttle(() => this.update(), 16));
    }

    update() {
        const scrollY = window.scrollY;

        this.elements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   ACCORDION
   ───────────────────────────────────────────────────────────────────────────── */

class Accordion {
    constructor(selector = '.accordion') {
        this.accordions = document.querySelectorAll(selector);
        this.init();
    }

    init() {
        this.accordions.forEach(accordion => {
            const items = accordion.querySelectorAll('.accordion-item');
            
            items.forEach(item => {
                const header = item.querySelector('.accordion-header');
                const content = item.querySelector('.accordion-content');
                
                header?.addEventListener('click', () => {
                    const isOpen = item.classList.contains('active');
                    
                    // Close all items
                    items.forEach(i => {
                        i.classList.remove('active');
                        const c = i.querySelector('.accordion-content');
                        if (c) c.style.maxHeight = null;
                    });
                    
                    // Open clicked item if it was closed
                    if (!isOpen) {
                        item.classList.add('active');
                        if (content) {
                            content.style.maxHeight = content.scrollHeight + 'px';
                        }
                    }
                });
            });
        });
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   TABS
   ───────────────────────────────────────────────────────────────────────────── */

class Tabs {
    constructor(selector = '.tabs') {
        this.tabContainers = document.querySelectorAll(selector);
        this.init();
    }

    init() {
        this.tabContainers.forEach(container => {
            const triggers = container.querySelectorAll('.tab-trigger');
            const panels = container.querySelectorAll('.tab-panel');
            
            triggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    const tabId = trigger.dataset.tab;
                    
                    // Update triggers
                    triggers.forEach(t => t.classList.remove('active'));
                    trigger.classList.add('active');
                    
                    // Update panels
                    panels.forEach(panel => {
                        panel.classList.remove('active');
                        if (panel.dataset.tab === tabId) {
                            panel.classList.add('active');
                        }
                    });
                });
            });
        });
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   INITIALIZE ALL MODULES
   ───────────────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    // Core functionality
    new NavigationController();
    new ScrollAnimator();
    new CounterAnimator();
    new SmoothScroll();
    new ScrollToTop();

    // Visual effects
    new ParticleSystem('.particle-canvas');
    new MagneticButtons();
    new TiltEffect();
    new ParallaxEffect();

    // UI Components
    new Accordion();
    new Tabs();

    // Video background (if exists)
    new VideoBackground('.hero-video-bg');

    // Form validation (if exists)
    new FormValidator('.contact-form');

    // Custom cursor (desktop only) - uncomment to enable
    // new CustomCursor();

    console.log('🚀 Xprowess initialized successfully!');
});

/* ─────────────────────────────────────────────────────────────────────────────
   EXPORT FOR GLOBAL ACCESS
   ───────────────────────────────────────────────────────────────────────────── */

window.Xprowess = {
    Utils,
    ParticleSystem,
    TextScramble,
    TypingEffect,
    CounterAnimator,
    TiltEffect,
    Accordion,
    Tabs
};
