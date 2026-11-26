(() => {
    const svg = document.querySelector('.hero-brands');
    const hero = document.querySelector('.hero');
    if (!svg || !hero) return;
    const ns = 'http://www.w3.org/2000/svg';
    const brands = ['Tom Ford', 'Burberry', 'Gucci', 'YSL', 'Chloé', 'Versace', 'Ray-Ban', 'Oakley', 'Tiffany & Co.'];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const el = (name, attrs = {}) => {
        const node = document.createElementNS(ns, name);
        for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
        return node;
    };
    let animationFrame;
    const render = () => {
        cancelAnimationFrame(animationFrame);
        const { width, height } = hero.getBoundingClientRect();
        if (!width || !height) return;
        svg.replaceChildren();
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        const x = 18, y = 18, right = width - x, bottom = height - y, radius = 22;
        const route = `M${x + radius},${y}H${right - radius}Q${right},${y} ${right},${y + radius}V${bottom - radius}Q${right},${bottom} ${right - radius},${bottom}H${x + radius}Q${x},${bottom} ${x},${bottom - radius}V${y + radius}Q${x},${y} ${x + radius},${y}Z`;
        const path = el('path', { id: 'hero-brand-route', d: route, fill: 'none' });
        const defs = el('defs');
        defs.append(path);
        svg.append(defs);
        const perimeter = path.getTotalLength();
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
        // On narrow screens the full brand list can be longer than the visible
        // route. Keep that extra length in the loop instead of crowding labels.
        const cycle = Math.max(perimeter, repeats * (brandWidth + brands.length * 28));
        const gap = (cycle - brandWidth * repeats) / (brands.length * repeats);
        const labels = [];
        let offset = 0;
        for (let i = 0; i < repeats * brands.length; i++) {
            const index = i % brands.length;
            // A second copy carries labels across the start of the route.
            for (const shift of [0, -cycle]) {
                const text = el('text', { 'aria-hidden': 'true' });
                const label = el('textPath', { href: '#hero-brand-route' });
                label.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#hero-brand-route');
                label.textContent = `${brands[index]} ·`;
                text.append(label);
                svg.append(text);
                labels.push({ label, offset, shift });
            }
            offset += measurements[index] + gap;
        }
        const update = distance => {
            for (const { label, offset, shift } of labels) {
                label.setAttribute('startOffset', (offset + distance) % cycle + shift);
            }
        };
        update(0);
        if (!reducedMotion.matches) {
            // Updating the attribute directly also works on mobile browsers
            // that do not consistently animate SVG textPath with SMIL.
            let previous;
            let distance = 0;
            const tick = now => {
                if (previous !== undefined) distance = (distance + Math.min(now - previous, 100) * 0.028) % cycle;
                previous = now;
                update(distance);
                animationFrame = requestAnimationFrame(tick);
            };
            animationFrame = requestAnimationFrame(tick);
        }
    };
    new ResizeObserver(render).observe(hero);
    reducedMotion.addEventListener('change', render);
    if (document.fonts) document.fonts.ready.then(render);
    render();
})();
