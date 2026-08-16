// include.js - Enhanced with interactions and full-screen scroll
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
    // FULL-SCREEN SCROLL
    // ============================================================
    function initFullScreenScroll() {
        const isHomePage = window.location.pathname === '/' || 
                          window.location.pathname === '/index.html' ||
                          window.location.pathname.endsWith('index.html') ||
                          window.location.pathname === '';
        
        if (!isHomePage) return;
        
        const body = document.body;
        body.classList.add('home-page');

        // On mobile, skip the custom swipe/wheel-hijacking full-screen
        // experience entirely. It forces every section to exactly one
        // screen height with overflow hidden, which clips content that's
        // taller than the viewport (very common on narrow phones), and
        // it blocks native touch scrolling (touch-action: none +
        // touchmove preventDefault). Below this width, sections just
        // flow normally down the page like any other site.
        const isMobileViewport = window.innerWidth <= 768;
        if (isMobileViewport) {
            body.classList.add('home-page-flow');
            return;
        }
        
        const sections = document.querySelectorAll('.section-fullscreen');
        if (sections.length === 0) return;
        
        function setFullHeight() {
            const vh = window.innerHeight;
            // The header is fixed (out of flow, set below) and overlays
            // on top, so the space actually visible under it is
            // (vh - headerHeight), not the full vh. Sections should
            // center their content within THAT visible space — not the
            // full vh — or content ends up sitting lower than the real
            // visual center (too much empty space up top).
            //
            // But some sections (the hero) have more content than that
            // visible space can hold on a shorter window. So: set a
            // min-height matching the visible area (via min-height: vh
            // with padding-top: headerHeight, border-box), and leave
            // height as auto so a section only grows taller than that
            // floor if its own content genuinely needs the room —
            // nothing gets clipped, and shorter sections still center
            // exactly in the visible viewport.
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 0;
            sections.forEach(function(section) {
                section.style.minHeight = vh + 'px';
                section.style.height = 'auto';
                // !important: some sections have a stylesheet rule
                // forcing padding: 0 !important, which would otherwise
                // silently cancel this and reintroduce the header overlap
                // just for that section.
                section.style.setProperty('padding-top', headerHeight + 'px', 'important');
                section.style.boxSizing = 'border-box';
                section.style.display = 'flex';
                section.style.alignItems = 'center';
                section.style.justifyContent = 'center';
                section.style.flexShrink = '0';
                section.style.width = '100%';
                section.style.scrollSnapAlign = 'start';
            });
        }
        
        setFullHeight();
        
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(setFullHeight, 200);
        });
        
        const container = document.createElement('div');
        container.className = 'fullscreen-scroll-container';
        container.style.cssText = `
            height: 100vh;
            height: 100dvh;
            overflow-y: scroll;
            scroll-snap-type: y mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            position: relative;
            width: 100%;
            touch-action: none;
            overscroll-behavior: contain;
        `;

        const parent = sections[0].parentNode;
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');

        const anchor = document.createComment('home-scroll-container');
        parent.insertBefore(anchor, header || sections[0]);

        if (header) {
            container.appendChild(header);
            // Take the header out of normal flow so it never pushes or
            // shrinks the sections below it — it just floats on top.
            // (setFullHeight() compensates by giving every section its
            // own top padding equal to the header's height.)
            header.style.position = 'fixed';
            header.style.top = '0';
            header.style.left = '0';
            header.style.width = '100%';
        }
        sections.forEach(function(section) {
            container.appendChild(section);
        });
        if (footer) {
            container.appendChild(footer);
            footer.style.scrollSnapAlign = 'start';
            footer.style.scrollSnapStop = 'always';
        }

        parent.insertBefore(container, anchor);
        parent.removeChild(anchor);

        body.classList.add('home-page-locked');
        
        sections.forEach(function(section, index) {
            const isVeryLast = index === sections.length - 1 && !footer;
            if (!isVeryLast && !section.querySelector('.scroll-indicator')) {
                const indicator = document.createElement('div');
                indicator.className = 'scroll-indicator';
                
                if (section.classList.contains('cta-section') || 
                    section.classList.contains('dark-band')) {
                    indicator.classList.add('scroll-indicator--light');
                }
                
                indicator.innerHTML = `
                    <span>Scroll</span>
                    <div class="arrow"></div>
                `;
                section.appendChild(indicator);
            }
        });
        
        const dotNav = document.createElement('div');
        dotNav.className = 'section-nav-dots';
        dotNav.setAttribute('role', 'navigation');
        dotNav.setAttribute('aria-label', 'Section navigation');
        
        sections.forEach(function(section, index) {
            const link = document.createElement('a');
            link.href = '#';
            link.setAttribute('data-index', index);
            
            const heading = section.querySelector('h1, h2');
            const label = heading ? heading.textContent.trim() : 'Section ' + (index + 1);
            link.setAttribute('aria-label', 'Go to ' + label);
            
            if (index === 0) link.classList.add('active');
            
            dotNav.appendChild(link);
        });
        
        document.body.appendChild(dotNav);

        const sectionCount = sections.length;
        const NAV_LOCK_MS = 1000;
        let currentIndex = 0;
        let isAnimating = false;
        let lockTimer = null;
        let lastScrollTime = 0;
        let scrollTimeout = null;

        function getStops() {
            const stops = [];
            sections.forEach(function(section) {
                stops.push(section.offsetTop);
            });
            if (footer) {
                stops.push(Math.max(0, container.scrollHeight - container.clientHeight));
            }
            return stops;
        }

        function updateActiveDot(index) {
            const dotIndex = Math.min(index, sectionCount - 1);
            const dots = dotNav.querySelectorAll('a');
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === dotIndex);
            });
        }

        function syncScrollPosition() {
            const stops = getStops();
            const scrollTop = container.scrollTop;
            let nearest = 0;
            let nearestDist = Infinity;
            stops.forEach(function(stopTop, i) {
                const dist = Math.abs(scrollTop - stopTop);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = i;
                }
            });
            if (nearest !== currentIndex && !isAnimating) {
                currentIndex = nearest;
                updateActiveDot(currentIndex);
            }
        }

        container.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(syncScrollPosition, 100);
        }, { passive: true });

        function goToSection(index) {
            const stops = getStops();
            const maxIndex = stops.length - 1;
            const clamped = Math.max(0, Math.min(maxIndex, index));
            
            if (clamped === currentIndex) return;
            if (isAnimating) return;
            
            const now = Date.now();
            if (now - lastScrollTime < NAV_LOCK_MS) return;
            lastScrollTime = now;
            
            const currentScrollTop = container.scrollTop;
            const targetScrollTop = stops[clamped];
            if (Math.abs(currentScrollTop - targetScrollTop) < 20) return;
            
            currentIndex = clamped;
            isAnimating = true;

            container.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
            updateActiveDot(clamped);

            clearTimeout(lockTimer);
            lockTimer = setTimeout(function() {
                isAnimating = false;
                syncScrollPosition();
            }, NAV_LOCK_MS);
        }

        dotNav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                goToSection(parseInt(this.getAttribute('data-index'), 10));
            });
        });

        let wheelTimeout = null;
        let wheelDirection = 0;
        
        container.addEventListener('wheel', function(e) {
            e.preventDefault();
            
            if (wheelTimeout) return;
            if (isAnimating) return;
            
            const delta = e.deltaY;
            if (Math.abs(delta) < 10) return;
            
            const direction = delta > 0 ? 1 : -1;
            
            if (wheelDirection && wheelDirection !== direction) {
                wheelDirection = direction;
                return;
            }
            wheelDirection = direction;
            
            wheelTimeout = setTimeout(function() {
                wheelTimeout = null;
                wheelDirection = 0;
            }, NAV_LOCK_MS);
            
            goToSection(currentIndex + direction);
            
        }, { passive: false });

        let touchStartY = 0;
        let touchStartX = 0;
        let touchStartTime = 0;

        container.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
            touchStartTime = Date.now();
        }, { passive: true });

        container.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });

        container.addEventListener('touchend', function(e) {
            if (isAnimating) return;
            
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndTime = Date.now();
            
            const deltaY = touchStartY - touchEndY;
            const deltaX = touchStartX - touchEndX;
            const deltaTime = touchEndTime - touchStartTime;
            
            if (deltaTime > 500) return;
            if (Math.abs(deltaY) < Math.abs(deltaX)) return;
            
            const SWIPE_THRESHOLD = 40;
            if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;
            
            const direction = deltaY > 0 ? 1 : -1;
            goToSection(currentIndex + direction);
            
        }, { passive: true });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault();
                if (isAnimating) return;
                goToSection(currentIndex + 1);
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                if (isAnimating) return;
                goToSection(currentIndex - 1);
            }
        });

        container.scrollTo({ top: 0, behavior: 'instant' });
        
        setTimeout(function() {
            container.scrollTo({ top: 0, behavior: 'instant' });
            currentIndex = 0;
            updateActiveDot(0);
        }, 100);
    }
    safeInit(initFullScreenScroll, 'initFullScreenScroll');

});