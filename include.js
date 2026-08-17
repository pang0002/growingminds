// include.js - Enhanced with interactions (full-screen scroll disabled)
document.addEventListener('DOMContentLoaded', function () {

    // Runs an init function in isolation — if it throws, the error is
    // logged but every OTHER init() call below it still runs normally.
    function safeInit(fn, label) {
        try {
            fn();
        } catch (err) {
            console.error('Growing Minds site: "' + label + '" failed to initialize:', err);
        }
    }

    // On the home page, header + sections + footer all live inside one
    // scrollable element (.fullscreen-scroll-container) instead of the
    // document itself. Other code (back-to-top, header shrink-on-scroll,
    // anchor links) needs to scroll/measure THAT element on the home
    // page, and the window everywhere else.
    function getHomeScrollEl() {
        return document.querySelector('.fullscreen-scroll-container');
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
            const scrollEl = getHomeScrollEl();
            if (scrollEl) {
                scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        let ticking = false;
        function updateVisibility() {
            const scrollEl = getHomeScrollEl();
            const y = scrollEl ? scrollEl.scrollTop : window.scrollY;
            if (y > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
            ticking = false;
        }
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(updateVisibility);
                ticking = true;
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        setTimeout(function () {
            const scrollEl = getHomeScrollEl();
            if (scrollEl) {
                scrollEl.addEventListener('scroll', onScroll, { passive: true });
            }
        }, 0);
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

        function showCard(index) {
            cards.forEach(function (card, i) {
                if (i === index) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });

            dots.forEach(function (dot, i) {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            currentIndex = index;

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
        }

        function nextCard() {
            const nextIndex = (currentIndex + 1) % cards.length;
            showCard(nextIndex);
        }

        function startAutoRotate() {
            if (intervalId) clearInterval(intervalId);
            isPaused = false;

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

            intervalId = setInterval(function () {
                if (!isPaused) {
                    nextCard();
                }
            }, 4000);
        }

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

        function resumeAutoRotate() {
            if (!isPaused) return;
            isPaused = false;

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

            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(function () {
                if (!isPaused) {
                    nextCard();
                }
            }, 4000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                pauseAutoRotate();
                showCard(index);
                setTimeout(resumeAutoRotate, 5000);
            });
        });

        const cardContainer = document.querySelector('.brand-interactive');
        if (cardContainer) {
            cardContainer.addEventListener('mouseenter', pauseAutoRotate);
            cardContainer.addEventListener('mouseleave', resumeAutoRotate);
        }

        if (cardContainer) {
            cardContainer.addEventListener('touchstart', function () {
                pauseAutoRotate();
                setTimeout(resumeAutoRotate, 5000);
            }, { passive: true });
        }

        showCard(0);
        setTimeout(startAutoRotate, 800);
    }

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

        if (header) {
            var headerTicking = false;
            var onScroll = function () {
                var scrollEl = getHomeScrollEl();
                var y = scrollEl ? scrollEl.scrollTop : window.scrollY;
                if (y > 12) {
                    header.classList.add('is-scrolled');
                } else {
                    header.classList.remove('is-scrolled');
                }
                headerTicking = false;
            };
            var onScrollThrottled = function () {
                if (!headerTicking) {
                    requestAnimationFrame(onScroll);
                    headerTicking = true;
                }
            };
            window.addEventListener('scroll', onScrollThrottled, { passive: true });
            setTimeout(function () {
                var homeScrollEl = getHomeScrollEl();
                if (homeScrollEl) {
                    homeScrollEl.addEventListener('scroll', onScrollThrottled, { passive: true });
                }
            }, 0);
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
                    var scrollEl = getHomeScrollEl();
                    if (scrollEl && scrollEl.contains(target)) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        var headerHeight = document.querySelector('header')?.offsetHeight || 80;
                        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
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
                    const successDiv = document.createElement('div');
                    successDiv.className = 'form-success show';
                    successDiv.innerHTML = '✅ Thank you! Your message has been sent. We\'ll get back to you soon.';
                    form.appendChild(successDiv);
                    form.reset();

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
    setTimeout(initActiveNav, 500);

    // ============================================================
    // INTERACTIVE PROCESS TIMELINE
    // ============================================================
    function initProcessTimeline() {
        const stepNodes = document.querySelectorAll('.step-node');
        const card = document.getElementById('processCard');
        const progressBar = document.getElementById('timelineProgress');

        let currentIndex = 0;
        let timer = null;
        let progressTimer = null;
        const intervalTime = 5000;
        const processSection = document.getElementById('process');

        if (!stepNodes.length || !card) return;

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
            currentIndex = index;

            stepNodes.forEach(function (node, idx) {
                if (idx === index) {
                    node.classList.add('active');
                } else {
                    node.classList.remove('active');
                }
            });

            if (animateProgress !== false) {
                const percentage = (index / (processData.length - 1)) * 100;
                progressBar.style.transition = 'width 0.6s ease-in-out';
                progressBar.style.width = percentage + '%';
            }

            card.style.opacity = '0.3';
            card.style.transform = 'translateY(6px)';

            setTimeout(function () {
                if (stepPhase) stepPhase.textContent = data.phase;
                if (stepTitle) stepTitle.textContent = data.title;
                if (stepSubtitle) stepSubtitle.textContent = data.subtitle;
                if (stepIcon) stepIcon.textContent = data.icon;
                if (stepDesc) stepDesc.textContent = data.desc;

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

        function startProgressAnimation() {
            stopProgressAnimation();
            
            const startPercent = (currentIndex / (processData.length - 1)) * 100;
            const endPercent = ((currentIndex + 1) / (processData.length - 1)) * 100;
            
            if (currentIndex < processData.length - 1) {
                progressBar.style.transition = 'none';
                progressBar.style.width = startPercent + '%';
                void progressBar.offsetWidth;
                progressBar.style.transition = 'width ' + (intervalTime / 1000) + 's linear';
                progressBar.style.width = endPercent + '%';
            } else {
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

        function startAutoSwap() {
            stopAutoSwap();
            stopProgressAnimation();
            startProgressAnimation();
            
            timer = setInterval(function () {
                const nextIndex = (currentIndex + 1) % processData.length;
                updateStep(nextIndex, false);
                if (nextIndex < processData.length - 1) {
                    startProgressAnimation();
                } else {
                    progressBar.style.transition = 'none';
                    progressBar.style.width = '100%';
                }
            }, intervalTime);
        }

        function stopAutoSwap() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
            stopProgressAnimation();
        }

        stepNodes.forEach(function (node) {
            node.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-step'), 10);
                stopAutoSwap();
                updateStep(index, true);
                startAutoSwap();
            });
        });

        if (processSection) {
            processSection.addEventListener('mouseenter', function() {
                stopAutoSwap();
                const currentWidth = parseFloat(progressBar.style.width) || 0;
                progressBar.style.transition = 'none';
                progressBar.style.width = currentWidth + '%';
            });
            
            processSection.addEventListener('mouseleave', function() {
                startAutoSwap();
            });
        }

        updateStep(0, true);
        setTimeout(startAutoSwap, 1000);
    }

    safeInit(initProcessTimeline, 'initProcessTimeline');

    // ============================================================
    // EXPANDABLE CARDS - ACCORDION BEHAVIOR
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

            cardsContainer.querySelectorAll('.expandable-card.expanded').forEach(function (c) {
                c.classList.remove('expanded');
            });

            if (!isCurrentlyExpanded) {
                card.classList.add('expanded');
            }
        });
    }

    safeInit(initExpandableCards, 'initExpandableCards');

    // ============================================================
    // SIGNAL CARDS - FLIP CARD BEHAVIOR
    // ============================================================
    function initSignalCards() {
        const cards = document.querySelectorAll('.signal-card');
        if (!cards.length) return;

        cards.forEach(function (card) {
            const frontBtn = card.querySelector('.signal-card-front .signal-reveal-btn');
            const backBtn = card.querySelector('.signal-card-back .signal-reveal-btn-back');
            
            function flipToBack(e) {
                if (e) e.stopPropagation();
                card.classList.add('revealed');
            }
            
            function flipToFront(e) {
                if (e) e.stopPropagation();
                card.classList.remove('revealed');
            }
            
            if (frontBtn) {
                frontBtn.addEventListener('click', flipToBack);
            }
            
            if (backBtn) {
                backBtn.addEventListener('click', flipToFront);
            }
            
            const frontFace = card.querySelector('.signal-card-front');
            if (frontFace) {
                frontFace.addEventListener('click', function(e) {
                    if (!e.target.closest('.signal-reveal-btn')) {
                        card.classList.add('revealed');
                    }
                });
            }
            
            const backFace = card.querySelector('.signal-card-back');
            if (backFace) {
                backFace.addEventListener('click', function(e) {
                    if (!e.target.closest('.signal-reveal-btn-back')) {
                        card.classList.remove('revealed');
                    }
                });
            }
        });
    }

    safeInit(initSignalCards, 'initSignalCards');

    // ============================================================
    // FULL-SCREEN SCROLL - DISABLED (fixes header overlap on mobile)
    // ============================================================
    function initFullScreenScroll() {
        const isHomePage = window.location.pathname === '/' || 
                          window.location.pathname === '/index.html' ||
                          window.location.pathname.endsWith('index.html') ||
                          window.location.pathname === '';
        
        if (!isHomePage) return;
        
        const body = document.body;
        body.classList.add('home-page');
        
        // DISABLE the full-screen scroll experience entirely.
        // This fixes the header being pulled out of flow and overlapping content.
        // Sections will now flow naturally down the page.
        body.classList.add('home-page-flow');
        
        // Remove any existing full-screen container if it was created
        const container = document.querySelector('.fullscreen-scroll-container');
        if (container) {
            // Move sections back to their original parent
            const parent = container.parentNode;
            while (container.firstChild) {
                parent.insertBefore(container.firstChild, container);
            }
            container.remove();
        }
        
        // Reset any sections that might have inline styles
        document.querySelectorAll('.section-fullscreen').forEach(function(section) {
            section.style.minHeight = '';
            section.style.height = '';
            section.style.paddingTop = '';
            section.style.display = '';
            section.style.alignItems = '';
            section.style.justifyContent = '';
            section.style.flexShrink = '';
            section.style.width = '';
            section.style.scrollSnapAlign = '';
        });
        
        // Reset header
        const header = document.querySelector('header');
        if (header) {
            header.style.position = '';
            header.style.top = '';
            header.style.left = '';
            header.style.width = '';
            header.style.zIndex = '';
        }
        
        // Remove dot navigation if it exists
        const dotNav = document.querySelector('.section-nav-dots');
        if (dotNav) dotNav.remove();
        
        // Remove scroll indicators
        document.querySelectorAll('.scroll-indicator').forEach(function(el) {
            el.remove();
        });
        
        // Restore normal body overflow
        body.classList.remove('home-page-locked');
        body.style.overflow = '';
        
        // Re-enable native scrolling on the body
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }
    safeInit(initFullScreenScroll, 'initFullScreenScroll');

});