(() => {
    const media = matchMedia('(hover: hover) and (pointer: fine)');
    const root = document.documentElement;
    const cursor = document.querySelector('.diamond-cursor');
    const hide = () => root.classList.remove('diamond-active');
    document.addEventListener('pointermove', (event) => {
        if (!media.matches || event.pointerType !== 'mouse') return hide();
        // Native controls and editable fields retain their normal cursor.
        if (event.target.closest('iframe, video, input, textarea, [contenteditable="true"]')) return hide();
        cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        cursor.classList.toggle('is-link', Boolean(event.target.closest('a, button, summary, [role="button"]')));
        root.classList.add('diamond-active');
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', hide);
    document.addEventListener('pointerdown', (event) => { if (event.pointerType !== 'mouse') hide(); });
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', hide);
    media.addEventListener('change', hide);
})();
