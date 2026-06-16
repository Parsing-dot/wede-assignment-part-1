document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 100
    });

    // 2. Rotating Text Animation (Vanilla JS equivalent of Framer Motion)
    const rotatingTexts = document.querySelectorAll('.rotating-text');
    let currentIndex = 0;

    // Set first item as active initially
    if (rotatingTexts.length > 0) {
        rotatingTexts[0].classList.add('active');
    }

    setInterval(() => {
        const current = rotatingTexts[currentIndex];
        const nextIndex = (currentIndex + 1) % rotatingTexts.length;
        const next = rotatingTexts[nextIndex];

        // Animate current out (upwards)
        current.classList.remove('active');
        current.classList.add('exit-up');

        // Animate next in (from bottom)
        next.classList.add('active');

        // Cleanup exit animation class after transition
        setTimeout(() => {
            current.classList.remove('exit-up');
        }, 500); // Matches CSS transition duration

        currentIndex = nextIndex;
    }, 2000); // Change every 2 seconds

    // 3. Dynamic Content Loading from JSON
    const featuresContainer = document.getElementById('features-container');
    let allFeatures = []; // Store globally for filtering

    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            allFeatures = data.features;
            renderFeatures(allFeatures);
            animateStats(); // Trigger stat counter animation after load
        })
        .catch(error => {
            console.error('Error loading features:', error);
            featuresContainer.innerHTML = '<p class="has-text-centered has-text-danger">Failed to load services. Please try again later.</p>';
        });

    // Function to render features
    function renderFeatures(features) {
        featuresContainer.innerHTML = ''; // Clear loading state
        
        if (features.length === 0) {
            featuresContainer.innerHTML = '<p class="has-text-centered">No services match your search.</p>';
            return;
        }

        features.forEach((feature, index) => {
            const column = document.createElement('div');
            column.className = 'column is-4';
            // Add AOS attributes for scroll animation on dynamic elements
            column.setAttribute('data-aos', 'fade-up');
            column.setAttribute('data-aos-delay', `${index * 100}`);

            column.innerHTML = `
                <div class="feature-card">
                    <div class="feature-icon">${feature.icon}</div>
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
            `;
            featuresContainer.appendChild(column);
        });
        
        // Refresh AOS to recognize newly added DOM elements
        AOS.refresh();
    }

    // 4. Search / Filter Functionality
    const searchInput = document.getElementById('feature-search');
    const searchBtn = document.getElementById('search-btn');

    function filterFeatures() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filtered = allFeatures.filter(feature => 
            feature.title.toLowerCase().includes(searchTerm) || 
            feature.description.toLowerCase().includes(searchTerm)
        );
        renderFeatures(filtered);
    }

    searchInput.addEventListener('input', filterFeatures);
    searchBtn.addEventListener('click', filterFeatures);

    // 5. Animated Stats Counter
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            const isDecimal = target % 1 !== 0;
            const duration = 2000; // 2 seconds
            const start = 0;
            const startTime = performance.now();

            function updateCount(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-out quart function for smooth landing
                const easeOut = 1 - Math.pow(1 - progress, 4);
                const currentCount = start + (target - start) * easeOut;

                stat.textContent = isDecimal ? currentCount.toFixed(1) : Math.floor(currentCount);

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                }
            }
            requestAnimationFrame(updateCount);
        });
    }
});