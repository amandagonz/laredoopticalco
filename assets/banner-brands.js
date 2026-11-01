(() => {
    const svg = document.querySelector('.banner-brands');
    const banner = document.querySelector('.black-friday-banner');
    if (!svg || !banner) return;
    const ns = 'http://www.w3.org/2000/svg';
    const brands = ['Tom Ford', 'Burberry', 'Gucci', 'YSL', 'Chloé', 'Versace', 'Ray-Ban', 'Oakley', 'Tiffany & Co.'];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const el = (name, attrs = {}) => {
        const node = document.createElementNS(ns, name);
        for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
        return node;
    };
    const render = () => {
        const { width, height } = banner.getBoundingClientRect();
        if (!width || !height) return;
        svg.replaceChildren();
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        const x = 19, y = 19, right = width - x, bottom = height - y;
        // The train continues from the top row to the bottom, skipping both sides.
        const lap = `M${x},${y}H${right}M${right},${bottom}H${x}`;
        const path = el('path', { id: 'banner-brand-route', d: lap, fill: 'none' });
        const defs = el('defs');
        defs.append(path);
        svg.append(defs);
        const perimeter = path.getTotalLength();
        // Repeat the horizontal route so labels can continue across each loop.
        path.setAttribute('d', `${lap} ${lap} ${lap}`);
        const measurements = brands.map(brand => {
            const text = el('text');
            text.textContent = `${brand} ·`;
            svg.append(text);
            const width = text.getComputedTextLength();
            text.remove();
            return width;
        });
        const brandWidth = measurements.reduce((sum, width) => sum + width, 0);
        const repeats = Math.max(1, Math.floor(perimeter / (brandWidth + brands.length * 28)));
        const gap = Math.max(4, (perimeter - brandWidth * repeats) / (brands.length * repeats));
        let offset = 0;
        for (let i = 0; i < repeats * brands.length; i++) {
            const index = i % brands.length;
            const text = el('text', { 'aria-hidden': 'true' });
            const label = el('textPath', { href: '#banner-brand-route', startOffset: offset });
            label.textContent = `${brands[index]} ·`;
            if (!reducedMotion.matches) {
                label.append(el('animate', {
                    attributeName: 'startOffset', from: offset, to: offset + perimeter,
                    dur: `${perimeter / 28}s`, repeatCount: 'indefinite', calcMode: 'linear'
                }));
            }
            text.append(label);
            svg.append(text);
            offset += measurements[index] + gap;
        }
    };
    new ResizeObserver(render).observe(banner);
    reducedMotion.addEventListener('change', render);
    if (document.fonts) document.fonts.ready.then(render);
    render();
})();
