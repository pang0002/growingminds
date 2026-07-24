// include.js
document.addEventListener('DOMContentLoaded', function () {

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
            };

            var openNav = function () {
                nav.classList.add('nav-open');
                scrim.classList.add('is-visible');
                toggle.setAttribute('aria-expanded', 'true');
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

    // Load header
    fetch('header.html')
        .then(function (response) {
            if (!response.ok) { throw new Error('Header not found'); }
            return response.text();
        })
        .then(function (data) {
            document.querySelector('header').outerHTML = data;
            initHeaderBehavior();
        })
        .catch(function (error) { console.error('Error loading header:', error); });

    // Load footer
    fetch('footer.html')
        .then(function (response) {
            if (!response.ok) { throw new Error('Footer not found'); }
            return response.text();
        })
        .then(function (data) {
            document.querySelector('footer').innerHTML = data;
        })
        .catch(function (error) { console.error('Error loading footer:', error); });
});