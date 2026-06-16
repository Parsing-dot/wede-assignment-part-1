document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS (Animate On Scroll)
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 100 });

    // 2. Rotating Text Animation
    const rotatingTexts = document.querySelectorAll('.rotating-text');
    let currentIndex = 0;
    if (rotatingTexts.length > 0) rotatingTexts[0].classList.add('active');

    setInterval(() => {
        const current = rotatingTexts[currentIndex];
        const nextIndex = (currentIndex + 1) % rotatingTexts.length;
        const next = rotatingTexts[nextIndex];
        current.classList.remove('active');
        current.classList.add('exit-up');
        next.classList.add('active');
        setTimeout(() => current.classList.remove('exit-up'), 500);
        currentIndex = nextIndex;
    }, 2000);

    // 3. Dynamic Content Loading from JSON
    const featuresContainer = document.getElementById('features-container');
    let allFeatures = [];

    // Sample data fallback if data.json is not yet created
    const fallbackData = {
        features: [
            { id: 1, icon: "📡", title: "Dedicated Data Service", description: "Exclusive bandwidth reserved solely for your business operations." },
            { id: 2, icon: "💰", title: "Fixed Monthly Pricing", description: "Predictable costs with no hidden fees or surprises." },
            { id: 3, icon: "♾️", title: "Uncapped", description: "Unlimited data usage without restrictions or throttling." },
            { id: 4, icon: "🚀", title: "Unshaped", description: "No traffic shaping - all your data flows freely." },
            { id: 5, icon: "⚡", title: "Guaranteed Speeds", description: "Always-on service with consistent performance." },
            { id: 6, icon: "🛡️", title: "24/7 Monitoring", description: "Round-the-clock network monitoring and support." }
        ]
    };

    fetch('data.json')
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(data => { allFeatures = data.features; renderFeatures(allFeatures); animateStats(); })
        .catch(() => { 
            console.log('Using fallback data (ensure data.json exists in root)');
            allFeatures = fallbackData.features; 
            renderFeatures(allFeatures); 
            animateStats(); 
        });

    function renderFeatures(features) {
        featuresContainer.innerHTML = '';
        if (features.length === 0) {
            featuresContainer.innerHTML = '<p class="text-center">No services match your search.</p>';
            return;
        }
        features.forEach((feature, index) => {
            const card = document.createElement('div');
            card.className = 'feature-card';
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', `${index * 100}`);
            card.innerHTML = `
                <div class="feature-icon">${feature.icon}</div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            `;
            featuresContainer.appendChild(card);
        });
        AOS.refresh();
    }

    // 4. Search / Filter Functionality
    const searchInput = document.getElementById('feature-search');
    const searchBtn = document.getElementById('search-btn');
    function filterFeatures() {
        const term = searchInput.value.toLowerCase().trim();
        const filtered = allFeatures.filter(f => f.title.toLowerCase().includes(term) || f.description.toLowerCase().includes(term));
        renderFeatures(filtered);
    }
    searchInput.addEventListener('input', filterFeatures);
    searchBtn.addEventListener('click', filterFeatures);

    // 5. Animated Stats Counter
    function animateStats() {
        document.querySelectorAll('.stat-number').forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            const isDecimal = target % 1 !== 0;
            const duration = 2000;
            const startTime = performance.now();
            function updateCount(currentTime) {
                const progress = Math.min((currentTime - startTime) / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 4);
                stat.textContent = isDecimal ? (target * easeOut).toFixed(1) : Math.floor(target * easeOut);
                if (progress < 1) requestAnimationFrame(updateCount);
            }
            requestAnimationFrame(updateCount);
        });
    }
});