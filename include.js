// include.js - Enhanced with interactions and full-screen scroll
document.addEventListener('DOMContentLoaded', function () {

    // Runs an init function in isolation — if it throws, the error is
    // logged but every OTHER init() call below it still runs normally.
    // Without this, a single bug in e.g. the parallax or tabs feature
    // would silently stop every feature listed after it (including the
    // expandable cards accordion) from ever being wired up.
    function safeInit(fn, label) {
        try {
            fn();
        } catch (err) {
            console.error('Growing Minds site: "' + label + '" failed to initialize:', err);
        }
    }

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

        let ticking = false;
        function updateVisibility() {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(updateVisibility);
                ticking = true;
            }
        }, { passive: true });
    }
    safeInit(initBackToTop, 'initBackToTop');

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
    safeInit(initScrollReveal, 'initScrollReveal');

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
    safeInit(initRippleEffect, 'initRippleEffect');

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
    safeInit(initInteractiveCards, 'initInteractiveCards');

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
            var headerTicking = false;
            var onScroll = function () {
                if (window.scrollY > 12) {
                    header.classList.add('is-scrolled');
                } else {
                    header.classList.remove('is-scrolled');
                }
                headerTicking = false;
            };
            window.addEventListener('scroll', function () {
                if (!headerTicking) {
                    requestAnimationFrame(onScroll);
                    headerTicking = true;
                }
            }, { passive: true });
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
    fetch('header.html', { cache: 'no-store' })
        .then(function (response) {
            if (!response.ok) { throw new Error('Header not found'); }
            return response.text();
        })
        .then(function (data) {
            document.querySelector('header').outerHTML = data;
            safeInit(initHeaderBehavior, 'initHeaderBehavior');
            safeInit(initSmoothScroll, 'initSmoothScroll');

            // Set active nav link after header loads
            setTimeout(function () {
                var currentPath = window.location.pathname.split('/').pop() || 'index.html';
                var navLinks = document.querySelectorAll('#site-nav a:not(.btn-nav)');
                navLinks.forEach(function (link) {
                    var href = link.getAttribute('href');
                    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                        link.classList.add('active');
                    }
                });
            }, 100);
        })
        .catch(function (error) { console.error('Error loading header:', error); });

    // ============================================================
    // LOAD FOOTER
    // ============================================================
    fetch('footer.html', { cache: 'no-store' })
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
    safeInit(initContactForm, 'initContactForm');

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

    // ============================================================
    // FRAMEWORK CAROUSEL
    // ============================================================
    function initFrameworkCarousel() {
        const carousel = document.getElementById('frameworkCarousel');
        if (!carousel) return;

        const track = document.getElementById('carouselTrack');
        const dotsContainer = document.getElementById('carouselDots');
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');

        const frameworkData = [
            {
                title: "Self-Awareness",
                icon: "🧠",
                desc: "When children understand how they learn — their strengths, what they find hard, and where they need support — self-doubt quietly turns into confidence. We help them build that clear, stigma-free self-knowledge.",
                features: [
                    "Discover their unique learning profile and strengths",
                    "Build a simple, useful vocabulary for emotions and thinking",
                    "Develop realistic, positive self-acceptance without labels or shame"
                ]
            },
            {
                title: "Self-Management",
                icon: "🌿",
                desc: "Equipping children with practical tools to manage big feelings, stay focused, and handle frustration — so overwhelm doesn't stop them from learning.",
                features: [
                    "Emotion regulation and calming strategies that actually work",
                    "Focus tools and smooth task-switching techniques",
                    "Simple routines that build impulse control and stress tolerance"
                ]
            },
            {
                title: "Social Connection",
                icon: "💬",
                desc: "Helping children connect authentically — reading social cues, expressing themselves clearly, and building real friendships.",
                features: [
                    "Perspective-taking and genuine empathy",
                    "Clear verbal and non-verbal communication",
                    "Collaborative play and calm conflict resolution"
                ]
            },
            {
                title: "Thinking Skills",
                icon: "⚙️",
                desc: "Strengthening the core cognitive muscles — working memory, flexible thinking, and problem-solving — that power both school success and everyday confidence.",
                features: [
                    "Stronger working memory and information processing",
                    "Cognitive flexibility when plans change",
                    "Sequential planning and practical problem-solving"
                ]
            },
            {
                title: "Learning Independence",
                icon: "🚀",
                desc: "Empowering children to take ownership of their learning — asking for help when they need it, setting goals, and building the resilience that lasts a lifetime.",
                features: [
                    "Self-advocacy: knowing how and when to ask for support",
                    "Goal-setting and simple progress tracking",
                    "Intrinsic motivation and bounce-back resilience"
                ]
            }
        ];
        let currentIndex = 0;
        let autoTimer = null;
        let isPaused = false;
        const AUTO_MS = 5500;

        // Build cards
        frameworkData.forEach(function (data, i) {
            const card = document.createElement('div');
            card.className = 'carousel-card' + (i === 0 ? ' active' : '');
            card.setAttribute('data-index', i);
            card.setAttribute('role', 'tabpanel');
            card.innerHTML =
                '<div class="carousel-card-icon">' + data.icon + '</div>' +
                '<h3 class="carousel-card-title">' + data.title + '</h3>' +
                '<p class="carousel-card-desc">' + data.desc + '</p>' +
                '<ul class="carousel-card-features">' +
                    data.features.map(function (f) {
                        return '<li>' + f + '</li>';
                    }).join('') +
                '</ul>';
            track.appendChild(card);
        });

        // Build dots
        frameworkData.forEach(function (_, i) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Go to ' + frameworkData[i].title);
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            dot.addEventListener('click', function () {
                goTo(i);
                restartAuto();
            });
            dotsContainer.appendChild(dot);
        });

        const cards = track.querySelectorAll('.carousel-card');
        const dots = dotsContainer.querySelectorAll('.carousel-dot');

        function goTo(index) {
            if (index < 0) index = frameworkData.length - 1;
            if (index >= frameworkData.length) index = 0;
            currentIndex = index;

            cards.forEach(function (card, i) {
                card.classList.toggle('active', i === currentIndex);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === currentIndex);
                dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
            });
        }

        function next() { goTo(currentIndex + 1); }
        function prev() { goTo(currentIndex - 1); }

        function startAuto() {
            stopAuto();
            if (isPaused) return;
            autoTimer = setInterval(function () {
                if (!isPaused) next();
            }, AUTO_MS);
        }

        function stopAuto() {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        }

        function restartAuto() {
            stopAuto();
            startAuto();
        }

        // Arrow clicks
        if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restartAuto(); });
        if (nextBtn) nextBtn.addEventListener('click', function () { next(); restartAuto(); });

        // Pause on hover / touch
        carousel.addEventListener('mouseenter', function () {
            isPaused = true;
            stopAuto();
        });
        carousel.addEventListener('mouseleave', function () {
            isPaused = false;
            startAuto();
        });

        // Simple swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        track.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
            isPaused = true;
            stopAuto();
        }, { passive: true });
        track.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) next();
                else prev();
            }
            isPaused = false;
            startAuto();
        }, { passive: true });

        // Init
        goTo(0);
        setTimeout(startAuto, 800);
    }

    // Initialize Framework Carousel
    safeInit(initFrameworkCarousel, 'initFrameworkCarousel');

    // ============================================================
    // INTERACTIVE PROCESS TIMELINE - WITH SMOOTH PROGRESS ANIMATION
    // ============================================================
    function initProcessTimeline() {
        const stepNodes = document.querySelectorAll('.step-node');
        const card = document.getElementById('processCard');
        const progressBar = document.getElementById('timelineProgress');

        // Tracking state and timer configurations
        let currentIndex = 0;
        let timer = null;
        let progressTimer = null;
        let progressValue = 0;
        const intervalTime = 5000; // Delay in milliseconds (5 seconds)
        const processSection = document.getElementById('process'); // Reference for hover detection

        if (!stepNodes.length || !card) return;

        // Preserving EXACT original titles, subtitles, and descriptions
        const processData = [
            {
                phase: "Phase 01",
                title: "Understand",
                subtitle: "Screening & Assessment",
                icon: "🔍",
                desc: "We begin by understanding your child's unique learning profile through comprehensive screening and assessment.",
                highlights: [
                    { icon: "📄", title: "Comprehensive Intake", desc: "Detailed history & parent perspective" },
                    { icon: "🎯", title: "Profile Mapping", desc: "Pinpointing cognitive & learning strengths" }
                ]
            },
            {
                phase: "Phase 02",
                title: "Plan",
                subtitle: "Personalised Learning Plan",
                icon: "📅",
                desc: "We create a tailored plan that addresses your child's specific strengths, needs and developmental goals.",
                highlights: [
                    { icon: "🛣️", title: "Targeted Roadmap", desc: "Clear milestones & achievable goals" },
                    { icon: "🤝", title: "Parent Alignment", desc: "Co-designed strategies for home consistency" }
                ]
            },
            {
                phase: "Phase 03",
                title: "Build",
                subtitle: "Evidence-Based Intervention",
                icon: "🔧",
                desc: "We implement targeted, evidence-informed interventions to build the skills behind learning and development.",
                highlights: [
                    { icon: "🧩", title: "Skill-Building Sessions", desc: "Structured, engaging learning intervention" },
                    { icon: "🧠", title: "Cognitive Scaffolding", desc: "Developing executive & emotional tools" }
                ]
            },
            {
                phase: "Phase 04",
                title: "Thrive",
                subtitle: "Confidence & Independence",
                icon: "⭐",
                desc: "Your child gains the confidence and independence to navigate learning and life with resilience.",
                highlights: [
                    { icon: "🚀", title: "Self-Advocacy", desc: "Empowering children to articulate their needs" },
                    { icon: "🌱", title: "Real-World Application", desc: "Applying strategies in school and daily life" }
                ]
            },
            {
                phase: "Phase 05",
                title: "Grow",
                subtitle: "Progress Monitoring",
                icon: "❇️",
                desc: "We continuously monitor progress, adjusting our approach to ensure your child keeps growing and achieving.",
                highlights: [
                    { icon: "📊", title: "Regular Reviews", desc: "Transparent feedback and progress tracking" },
                    { icon: "🔄", title: "Adaptive Planning", desc: "Evolving strategies as your child advances" }
                ]
            }
        ];

        const stepPhase = document.getElementById('stepPhase');
        const stepTitle = document.getElementById('stepTitle');
        const stepSubtitle = document.getElementById('stepSubtitle');
        const stepIcon = document.getElementById('stepIcon');
        const stepDesc = document.getElementById('stepDesc');
        const highlightsContainer = card.querySelector('.step-highlights');

        function updateStep(index, animateProgress) {
            const data = processData[index];
            if (!data) return;

            // Update current index
            currentIndex = index;

            // Update step nodes
            stepNodes.forEach(function (node, idx) {
                if (idx === index) {
                    node.classList.add('active');
                } else {
                    node.classList.remove('active');
                }
            });

            // If animateProgress is true, we'll animate the bar smoothly
            if (animateProgress !== false) {
                // Set the progress bar to the exact position for this step
                const percentage = (index / (processData.length - 1)) * 100;
                progressBar.style.transition = 'width 0.6s ease-in-out';
                progressBar.style.width = percentage + '%';
            }

            // Animate card swap
            card.style.opacity = '0.3';
            card.style.transform = 'translateY(6px)';

            setTimeout(function () {
                if (stepPhase) stepPhase.textContent = data.phase;
                if (stepTitle) stepTitle.textContent = data.title;
                if (stepSubtitle) stepSubtitle.textContent = data.subtitle;
                if (stepIcon) stepIcon.textContent = data.icon;
                if (stepDesc) stepDesc.textContent = data.desc;

                // Render takeaway highlights
                if (highlightsContainer) {
                    highlightsContainer.innerHTML = '';
                    data.highlights.forEach(function (hl) {
                        const item = document.createElement('div');
                        item.className = 'highlight-item';
                        item.innerHTML = `
                            <span class="hl-icon">${hl.icon}</span>
                            <div>
                                <strong>${hl.title}</strong>
                                <small>${hl.desc}</small>
                            </div>
                        `;
                        highlightsContainer.appendChild(item);
                    });
                }

                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 180);
        }

        // Start the progress bar animation (smoothly moves from current to next)
        function startProgressAnimation() {
            stopProgressAnimation();
            
            const startPercent = (currentIndex / (processData.length - 1)) * 100;
            const endPercent = ((currentIndex + 1) / (processData.length - 1)) * 100;
            
            // Only animate if not at the last step
            if (currentIndex < processData.length - 1) {
                progressBar.style.transition = 'none';
                progressBar.style.width = startPercent + '%';
                
                // Force reflow
                void progressBar.offsetWidth;
                
                // Start the smooth animation to the next step
                progressBar.style.transition = 'width ' + (intervalTime / 1000) + 's linear';
                progressBar.style.width = endPercent + '%';
            } else {
                // At the last step, just show full progress
                progressBar.style.transition = 'none';
                progressBar.style.width = '100%';
            }
        }

        function stopProgressAnimation() {
            if (progressTimer) {
                clearInterval(progressTimer);
                progressTimer = null;
            }
        }

        // Start auto-advancing through steps
        function startAutoSwap() {
            stopAutoSwap(); // Prevent duplicate running timers
            stopProgressAnimation();
            
            // Start progress bar animation
            startProgressAnimation();
            
            // Set timer to change step
            timer = setInterval(function () {
                const nextIndex = (currentIndex + 1) % processData.length;
                updateStep(nextIndex, false); // Don't animate progress bar here, it's already animated
                
                // Start the next progress animation
                if (nextIndex < processData.length - 1) {
                    startProgressAnimation();
                } else {
                    // At the last step, we stay at 100%
                    progressBar.style.transition = 'none';
                    progressBar.style.width = '100%';
                }
            }, intervalTime);
        }

        // Clear the running timer
        function stopAutoSwap() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
            stopProgressAnimation();
        }

        // Click handler for step nodes
        stepNodes.forEach(function (node) {
            node.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-step'), 10);
                
                // Reset auto-swap timer on manual interaction
                stopAutoSwap();
                updateStep(index, true); // Animate progress bar
                startAutoSwap(); // Restart auto-swap after manual click
            });
        });

        // Pause timer when parent hovers mouse over the section to read
        if (processSection) {
            processSection.addEventListener('mouseenter', function() {
                stopAutoSwap();
                // Pause the progress bar animation
                const currentWidth = parseFloat(progressBar.style.width) || 0;
                progressBar.style.transition = 'none';
                progressBar.style.width = currentWidth + '%';
            });
            
            processSection.addEventListener('mouseleave', function() {
                startAutoSwap();
            });
        }

        // Initialize with first step
        updateStep(0, true);
        
        // Start auto-swap after a short delay
        setTimeout(startAutoSwap, 1000);
    }

    // Initialize Process Timeline
    safeInit(initProcessTimeline, 'initProcessTimeline');

    // ============================================================
    // EXPANDABLE CARDS - ACCORDION BEHAVIOR (ONLY ONE AT A TIME)
    // Uses event delegation on the shared grid container instead of a
    // separate listener per card/button. This is deliberately more
    // robust than per-element listeners: it can't end up with stale
    // or missing bindings if the DOM changes, and there's exactly one
    // listener responsible for the accordion behavior — so there's no
    // possibility of two separate handlers disagreeing with each other.
    // ============================================================
    function initExpandableCards() {
        const cardsContainer = document.querySelector('.services-grid');
        if (!cardsContainer) return;

        cardsContainer.addEventListener('click', function (e) {
            const toggleBtn = e.target.closest('.expand-toggle');
            const header = e.target.closest('.service-card-header');
            const trigger = toggleBtn || header;
            if (!trigger) return;

            const card = trigger.closest('.expandable-card');
            if (!card || !cardsContainer.contains(card)) return;

            e.preventDefault();

            const isCurrentlyExpanded = card.classList.contains('expanded');

            // Close every expanded card in this grid...
            cardsContainer.querySelectorAll('.expandable-card.expanded').forEach(function (c) {
                c.classList.remove('expanded');
            });

            // ...then re-open only the one that was clicked (unless it
            // was the one already open, in which case leave it closed).
            if (!isCurrentlyExpanded) {
                card.classList.add('expanded');
            }
        });
    }

    // Initialize Expandable Cards
    safeInit(initExpandableCards, 'initExpandableCards');

    // ============================================================
    // FULL-SCREEN SCROLL SECTIONS (HOME PAGE ONLY)
    // ============================================================
    function initFullScreenScroll() {
        // Only run on the home page
        const isHomePage = window.location.pathname === '/' || 
                          window.location.pathname === '/index.html' ||
                          window.location.pathname.endsWith('index.html') ||
                          window.location.pathname === '';
        
        if (!isHomePage) return;
        
        const body = document.body;
        body.classList.add('home-page');
        
        // Wrap all fullscreen sections in a scroll container
        const sections = document.querySelectorAll('.section-fullscreen');
        if (sections.length === 0) return;
        
        // Check if already wrapped
        if (document.querySelector('.scroll-container')) return;
        
        // Create scroll container
        const container = document.createElement('div');
        container.className = 'scroll-container';
        container.style.height = '100vh';
        container.style.height = '100dvh';
        container.style.overflowY = 'scroll';
        container.style.scrollSnapType = 'y mandatory';
        container.style.scrollBehavior = 'smooth';
        container.style.WebkitOverflowScrolling = 'touch';
        
        // Move all sections into the container
        const parent = sections[0].parentNode;
        sections.forEach(function(section) {
            container.appendChild(section);
        });
        parent.appendChild(container);
        
        // Add scroll indicators to sections that don't have them
        sections.forEach(function(section, index) {
            const isLast = index === sections.length - 1;
            if (!isLast) {
                // Check if indicator already exists
                if (!section.querySelector('.scroll-indicator')) {
                    const indicator = document.createElement('div');
                    indicator.className = 'scroll-indicator';
                    
                    // Check if section has dark background
                    if (section.classList.contains('cta-section') || 
                        section.classList.contains('dark-band') ||
                        section.classList.contains('founder-spotlight')) {
                        indicator.classList.add('scroll-indicator--light');
                    }
                    
                    indicator.innerHTML = `
                        <span>Scroll</span>
                        <div class="arrow"></div>
                    `;
                    section.appendChild(indicator);
                }
            }
        });
        
        // Create navigation dots
        const dotNav = document.createElement('div');
        dotNav.className = 'section-nav-dots';
        dotNav.setAttribute('role', 'navigation');
        dotNav.setAttribute('aria-label', 'Section navigation');
        
        const sectionTitles = [];
        sections.forEach(function(section) {
            // Try to get a title from the section
            const heading = section.querySelector('h1, h2');
            const title = heading ? heading.textContent.trim() : 'Section';
            sectionTitles.push(title);
        });
        
        sections.forEach(function(section, index) {
            const link = document.createElement('a');
            link.href = '#';
            link.setAttribute('data-index', index);
            link.setAttribute('aria-label', 'Go to ' + sectionTitles[index]);
            
            const tooltip = document.createElement('span');
            tooltip.className = 'dot-tooltip';
            tooltip.textContent = sectionTitles[index].length > 20 ? 
                sectionTitles[index].substring(0, 18) + '…' : 
                sectionTitles[index];
            link.appendChild(tooltip);
            
            if (index === 0) link.classList.add('active');
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetIndex = parseInt(this.getAttribute('data-index'), 10);
                const targetSection = sections[targetIndex];
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
            
            dotNav.appendChild(link);
        });
        
        document.body.appendChild(dotNav);
        
        // Update active dot on scroll
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const index = Array.from(sections).indexOf(entry.target);
                    const dots = dotNav.querySelectorAll('a');
                    dots.forEach(function(dot, i) {
                        dot.classList.toggle('active', i === index);
                    });
                }
            });
        }, {
            threshold: 0.5,
            root: container
        });
        
        sections.forEach(function(section) {
            observer.observe(section);
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault();
                const container = document.querySelector('.scroll-container');
                if (container) {
                    container.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
                }
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                const container = document.querySelector('.scroll-container');
                if (container) {
                    container.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
                }
            }
        });
        
        // Wheel handling for smoother experience
        let isScrolling = false;
        container.addEventListener('wheel', function(e) {
            if (isScrolling) {
                e.preventDefault();
                return;
            }
            
            // Allow natural scroll on touch devices
            if ('ontouchstart' in window) return;
            
            const delta = e.deltaY;
            if (Math.abs(delta) < 20) return;
            
            e.preventDefault();
            isScrolling = true;
            
            const direction = delta > 0 ? 1 : -1;
            const targetY = Math.round(container.scrollTop / window.innerHeight) * window.innerHeight + (direction * window.innerHeight);
            
            container.scrollTo({
                top: Math.max(0, Math.min(targetY, container.scrollHeight - container.clientHeight)),
                behavior: 'smooth'
            });
            
            setTimeout(function() {
                isScrolling = false;
            }, 800);
        }, { passive: false });
        
        // Handle resize to maintain fullscreen
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                // Ensure sections still fill the viewport
                sections.forEach(function(section) {
                    section.style.minHeight = window.innerHeight + 'px';
                    section.style.height = window.innerHeight + 'px';
                });
            }, 200);
        });
        
        // Initial height fix
        sections.forEach(function(section) {
            section.style.minHeight = window.innerHeight + 'px';
            section.style.height = window.innerHeight + 'px';
        });
    }
    safeInit(initFullScreenScroll, 'initFullScreenScroll');

});