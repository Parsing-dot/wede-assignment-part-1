// ================= PIXEL CANVAS ANIMATION =================
class PixelCanvasAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.pixels = [];
        this.lastTime = 0;
        
        // Using your website's main color palette with subtle opacities
        this.colors = [
            'rgba(255, 255, 255, 0.15)',
            'rgba(239, 205, 209, 0.25)', // Cotton Rose
            'rgba(222, 155, 162, 0.20)', // Old Rose
            'rgba(206, 105, 116, 0.15)', // Lobster Pink
            'rgba(189, 55, 69, 0.10)'    // Intense Cherry
        ];
        
        this.init();
        window.addEventListener('resize', () => this.init());
        requestAnimationFrame((t) => this.animate(t));
    }

    init() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.w = rect.width;
        this.h = rect.height;
        
        // Responsive gap for performance (larger gap on mobile)
        this.gap = this.w < 768 ? 12 : 8;
        
        this.canvas.width = this.w * dpr;
        this.canvas.height = this.h * dpr;
        this.canvas.style.width = `${this.w}px`;
        this.canvas.style.height = `${this.h}px`;
        
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.pixels = [];
        
        const centerX = this.w / 2;
        const centerY = this.h / 2;

        for (let x = 0; x < this.w; x += this.gap) {
            for (let y = 0; y < this.h; y += this.gap) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                this.pixels.push({
                    x, y,
                    color: this.colors[Math.floor(Math.random() * this.colors.length)],
                    size: 0,
                    maxSize: Math.random() * 1.5 + 0.5,
                    minSize: 0.2,
                    delay: distance * 1.2, // Ripple delay based on distance from center
                    elapsed: 0,
                    phase: 'appear',
                    shimmerDir: 1,
                    speed: Math.random() * 0.02 + 0.01
                });
            }
        }
    }

    animate(time) {
        if (!this.lastTime) this.lastTime = time;
        const dt = time - this.lastTime;
        this.lastTime = time;

        this.ctx.clearRect(0, 0, this.w, this.h);

        for (let p of this.pixels) {
            p.elapsed += dt;
            if (p.elapsed < p.delay) continue;

            if (p.phase === 'appear') {
                p.size += 0.05;
                if (p.size >= p.maxSize) {
                    p.size = p.maxSize;
                    p.phase = 'shimmer';
                }
            } else if (p.phase === 'shimmer') {
                p.size += p.speed * p.shimmerDir;
                if (p.size >= p.maxSize) {
                    p.size = p.maxSize;
                    p.shimmerDir = -1;
                } else if (p.size <= p.minSize) {
                    p.size = p.minSize;
                    p.shimmerDir = 1;
                }
            }

            const offset = (p.maxSize - p.size) / 2;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
        }

        requestAnimationFrame((t) => this.animate(t));
    }
}

// ================= ORIGIN BUTTON ANIMATION =================
class OriginButton {
    constructor(el) {
        this.el = el;
        this.circle = document.createElement('span');
        this.circle.className = 'origin-circle';
        this.el.appendChild(this.circle);
        
        this.el.addEventListener('pointerenter', this.handleEnter.bind(this));
        this.el.addEventListener('pointerleave', this.handleLeave.bind(this));
    }

    handleEnter(e) {
        const rect = this.el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate diameter to ensure the circle covers the whole button
        const diameter = Math.ceil(2 * Math.max(
            Math.hypot(x, y),
            Math.hypot(rect.width - x, y),
            Math.hypot(x, rect.height - y),
            Math.hypot(rect.width - x, rect.height - y)
        ));
        
        this.circle.style.left = `${x}px`;
        this.circle.style.top = `${y}px`;
        this.circle.style.width = `${diameter}px`;
        this.circle.style.height = `${diameter}px`;
        
        this.circle.classList.add('active');
        this.el.classList.add('origin-active');
    }

    handleLeave() {
        this.circle.classList.remove('active');
        this.el.classList.remove('origin-active');
    }
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Pixel Canvas Background
    new PixelCanvasAnimation('pixel-canvas');

    // Initialize Origin Buttons
    document.querySelectorAll('.origin-btn').forEach(btn => {
        new OriginButton(btn);
    });
});