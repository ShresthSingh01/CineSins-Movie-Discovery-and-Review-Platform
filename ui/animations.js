/**
 * Cinemaholic Interactions & Animations Helper
 */

export const animations = {
    init() {
        this.bindRipples();
        this.bindCardTilt();
        this.initReducedMotion();
    },

    /**
     * Subtle tilt effect for movie cards
     */
    bindCardTilt() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        document.addEventListener('mousemove', (e) => {
            const card = e.target.closest('.movie-card');
            if (!card) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rotateX = ((y / rect.height) - 0.5) * -10; // Max 5deg
            const rotateY = ((x / rect.width) - 0.5) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
        });

        document.addEventListener('mouseleave', (e) => {
            const card = e.target.closest('.movie-card');
            if (card) {
                card.style.transform = '';
            }
        }, true);
    },

    /**
     * Premium button ripple effect
     */
    bindRipples() {
        document.addEventListener('mousedown', (e) => {
            const btn = e.target.closest('button, .save-btn');
            if (!btn) return;

            const circle = document.createElement('span');
            const diameter = Math.max(btn.clientWidth, btn.clientHeight);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - btn.getBoundingClientRect().left}px`;
            circle.style.top = `${e.clientY - btn.getBoundingClientRect().top}px`;
            circle.classList.add('ripple');

            const prevRipple = btn.querySelector('.ripple');
            if (prevRipple) prevRipple.remove();

            btn.appendChild(circle);
        });
    },

    /**
     * Focus trap for accessibility
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
            if (!isTabPressed) return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        });

        if (firstFocusableElement) firstFocusableElement.focus();
    },

    initReducedMotion() {
        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handleMotionChange = (e) => {
            if (e.matches) {
                document.body.classList.add('reduce-motion');
            } else {
                document.body.classList.remove('reduce-motion');
            }
        };
        motionQuery.addEventListener('change', handleMotionChange);
        handleMotionChange(motionQuery);
    }
};
