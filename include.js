// include.js - Enhanced with interactions
document.addEventListener('DOMContentLoaded', function () {

    // ============================================================
    // SCROLL PROGRESS BAR
    // ============================================================
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.prepend(progressBar);

        window.addEventListener('scroll', function () {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = progress + '%';
        }, { passive: true });
    }
    initScrollProgress();

    // ============================================================
    // BACK TO TOP BUTTON
    // ============================================================
    function initBackToTop() {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.innerHTML = '↑';
        btn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(btn);

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', function () {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, { passive: true });
    }
    initBackToTop();

    // ============================================================
    // SCROLL REVEAL ANIMATIONS (Intersection Observer)
    // ============================================================
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -40px 0px'
            });

            revealElements.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            // Fallback: show all elements immediately
            revealElements.forEach(function (el) {
                el.classList.add('visible');
            });
        }
    }
    initScrollReveal();

    // ============================================================
    // BUTTON RIPPLE EFFECT
    // ============================================================
    function initRippleEffect() {
        document.querySelectorAll('.btn-ripple').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                const rect = btn.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                btn.appendChild(ripple);
                setTimeout(function () { ripple.remove(); }, 600);
            });
        });
    }
    initRippleEffect();

    // ============================================================
    // INTERACTIVE CARDS - Auto-rotating card display
    // ============================================================
    function initInteractiveCards() {
        const container = document.getElementById('interactiveCards');
        if (!container) return;

        const cards = container.querySelectorAll('.interactive-card');
        const dots = document.querySelectorAll('.card-nav-dots .dot');
        const rotateBar = document.querySelector('.rotate-bar');
        let currentIndex = 0;
        let intervalId = null;
        let isPaused = false;

        // Show a specific card
        function showCard(index) {
            // Update cards
            cards.forEach(function (card, i) {
                if (i === index) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });

            // Update dots
            dots.forEach(function (dot, i) {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            currentIndex = index;

            // Reset and restart progress bar
            if (rotateBar) {
                rotateBar.classList.remove('animating');
                // Force reflow
                void rotateBar.offsetWidth;
                rotateBar.style.width = '0%';
                setTimeout(function () {
                    if (!isPaused) {
                        rotateBar.classList.add('animating');
                    }
                }, 50);
            }
        }

        // Go to next card
        function nextCard() {
            const nextIndex = (currentIndex + 1) % cards.length;
            showCard(nextIndex);
        }

        // Start auto-rotation
        function startAutoRotate() {
            if (intervalId) clearInterval(intervalId);
            isPaused = false;

            // Start progress bar
            if (rotateBar) {
                rotateBar.classList.remove('animating');
                void rotateBar.offsetWidth;
                rotateBar.style.width = '0%';
                setTimeout(function () {
                    if (!isPaused) {
                        rotateBar.classList.add('animating');
                    }
                }, 50);
            }

            // Change card every 4 seconds
            intervalId = setInterval(function () {
                if (!isPaused) {
                    nextCard();
                }
            }, 4000);
        }

        // Pause auto-rotation
        function pauseAutoRotate() {
            isPaused = true;
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            if (rotateBar) {
                rotateBar.classList.remove('animating');
            }
        }

        // Resume auto-rotation
        function resumeAutoRotate() {
            if (!isPaused) return;
            isPaused = false;

            // Restart progress bar from current position
            if (rotateBar) {
                rotateBar.classList.remove('animating');
                void rotateBar.offsetWidth;
                // Start from beginning of cycle
                rotateBar.style.width = '0%';
                setTimeout(function () {
                    if (!isPaused) {
                        rotateBar.classList.add('animating');
                    }
                }, 50);
            }

            // Restart interval
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(function () {
                if (!isPaused) {
                    nextCard();
                }
            }, 4000);
        }

        // Set up dot click handlers
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                pauseAutoRotate();
                showCard(index);
                // Resume after a delay
                setTimeout(resumeAutoRotate, 5000);
            });
        });

        // Pause on hover
        const cardContainer = document.querySelector('.brand-interactive');
        if (cardContainer) {
            cardContainer.addEventListener('mouseenter', pauseAutoRotate);
            cardContainer.addEventListener('mouseleave', resumeAutoRotate);
        }

        // Also pause on touch devices
        if (cardContainer) {
            cardContainer.addEventListener('touchstart', function () {
                pauseAutoRotate();
                // Resume after touch ends
                setTimeout(resumeAutoRotate, 5000);
            }, { passive: true });
        }

        // Initialize first card
        showCard(0);

        // Start auto-rotation after a short delay
        setTimeout(startAutoRotate, 800);
    }

    // Call interactive cards after DOM is ready
    initInteractiveCards();

    // ============================================================
    // HEADER BEHAVIOR
    // ============================================================
    function initHeaderBehavior() {
        var header = document.querySelector('header');
        var nav = document.getElementById('site-nav');
        var toggle = document.getElementById('nav-toggle');
        var scrim = document.getElementById('nav-scrim');

        if (toggle && nav && scrim) {
            var closeNav = function () {
                nav.classList.remove('nav-open');
                scrim.classList.remove('is-visible');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            };

            var openNav = function () {
                nav.classList.add('nav-open');
                scrim.classList.add('is-visible');
                toggle.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            };

            toggle.addEventListener('click', function () {
                var isOpen = nav.classList.contains('nav-open');
                if (isOpen) { closeNav(); } else { openNav(); }
            });

            scrim.addEventListener('click', closeNav);

            nav.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', closeNav);
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') { closeNav(); }
            });
        }

        // Scroll-triggered header shrink
        if (header) {
            var onScroll = function () {
                if (window.scrollY > 12) {
                    header.classList.add('is-scrolled');
                } else {
                    header.classList.remove('is-scrolled');
                }
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }
    }

    // ============================================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;
                var target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    var headerHeight = document.querySelector('header')?.offsetHeight || 80;
                    var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================================================
    // LOAD HEADER
    // ============================================================
    fetch('header.html')
        .then(function (response) {
            if (!response.ok) { throw new Error('Header not found'); }
            return response.text();
        })
        .then(function (data) {
            document.querySelector('header').outerHTML = data;
            initHeaderBehavior();
            initSmoothScroll();
        })
        .catch(function (error) { console.error('Error loading header:', error); });

    // ============================================================
    // LOAD FOOTER
    // ============================================================
    fetch('footer.html')
        .then(function (response) {
            if (!response.ok) { throw new Error('Footer not found'); }
            return response.text();
        })
        .then(function (data) {
            document.querySelector('footer').innerHTML = data;
        })
        .catch(function (error) { console.error('Error loading footer:', error); });

    // ============================================================
    // FORM HANDLING (Contact Page)
    // ============================================================
    function initContactForm() {
        const form = document.querySelector('.contact-form form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(function (response) {
                if (response.ok) {
                    // Show success message
                    const successDiv = document.createElement('div');
                    successDiv.className = 'form-success show';
                    successDiv.innerHTML = '✅ Thank you! Your message has been sent. We\'ll get back to you soon.';
                    form.appendChild(successDiv);
                    form.reset();

                    // Remove success message after 5 seconds
                    setTimeout(function () {
                        successDiv.classList.remove('show');
                        setTimeout(function () { successDiv.remove(); }, 500);
                    }, 5000);
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(function (error) {
                alert('Oops! Something went wrong. Please try again or email us directly.');
            })
            .finally(function () {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }
    initContactForm();

    // ============================================================
    // PARALLAX EFFECT FOR HERO BLOBS
    // ============================================================
    function initParallax() {
        const blobs = document.querySelectorAll('.hero .blob, .page-hero .blob');
        if (!blobs.length) return;

        window.addEventListener('scroll', function () {
            const scrollY = window.scrollY;
            blobs.forEach(function (blob, index) {
                const speed = 0.03 + (index * 0.01);
                blob.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
            });
        }, { passive: true });
    }
    initParallax();

    // ============================================================
    // ACTIVE NAV LINK HIGHLIGHTING
    // ============================================================
    function initActiveNav() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('#site-nav a:not(.btn-nav)');

        navLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                link.style.color = 'var(--color-primary)';
                link.style.fontWeight = '600';
            }
        });
    }
    // Run after header loads
    setTimeout(initActiveNav, 500);
});