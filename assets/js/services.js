(function() {
    'use strict';

    // ============================================================================
    // 🍔 1. NAVBAR ENHANCEMENTS & MOBILE MENU FIX
    // ============================================================================
    // Even though we have CSS handling the basic visibility of the mobile menu, 
    // we want to make the user experience buttery smooth. This section ensures 
    // that when a user clicks a link on mobile, the menu gracefully closes. 
    // We also add a subtle visual cue to the navbar when they scroll down, 
    // and force the correct layout if they resize their browser window.
    
    const navToggle = document.getElementById('nav-toggle');
    const navbarMenu = document.getElementById('navbarMenu');
    const navLinks = document.querySelectorAll('.navbar-item');
    const mainNav = document.querySelector('.main-nav');

    // Close the mobile menu when a link is clicked so they don't have to manually close it
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle && navToggle.checked) {
                navToggle.checked = false;
            }
        });
    });

    // Add a nice shadow and blur to the navbar when scrolling down
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainNav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            mainNav.style.backdropFilter = 'blur(10px)';
        } else {
            mainNav.style.boxShadow = '0 2px 10px rgba(189, 55, 69, 0.3)';
            mainNav.style.backdropFilter = 'none';
        }
    });

    // Guarantee the navbar layout is correct when resizing the window
    function handleNavbarResize() {
        if (window.innerWidth >= 1024) {
            // Desktop: Force menu open, ensure burger is unchecked
            if (navToggle) navToggle.checked = false;
            if (navbarMenu) navbarMenu.style.display = 'flex';
        } else {
            // Mobile: Reset menu display to let the CSS toggle handle it
            if (navbarMenu) navbarMenu.style.display = '';
        }
    }
    window.addEventListener('resize', handleNavbarResize);
    handleNavbarResize(); // Run on initial load just in case


    // ============================================================================
    // 🫧 2. GOOEY HERO ANIMATION (Lava Lamp Effect)
    // ============================================================================
    // You know those cool, satisfying lava lamp animations where blobs merge and 
    // separate? That's exactly what we're building here! We use an SVG filter 
    // (specifically feGaussianBlur and feColorMatrix) to create a "gooey" effect.
    // When we animate some circular blobs, the filter makes them stick together 
    // and pull apart like liquid. We're using the company's beautiful cherry and 
    // rose color palette to make it perfectly on-brand.

    function initGooeyHero() {
        const hero = document.querySelector('.services-hero');
        if (!hero) return;

        // 1. Inject the SVG Gooey Filter into the DOM
        // We hide it visually, but the browser still uses it for our CSS filter.
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.style.position = "absolute";
        svg.style.width = "0";
        svg.style.height = "0";
        
        const defs = document.createElementNS(svgNS, "defs");
        const filter = document.createElementNS(svgNS, "filter");
        filter.setAttribute("id", "goo-filter");
        
        const blur = document.createElementNS(svgNS, "feGaussianBlur");
        blur.setAttribute("in", "SourceGraphic");
        blur.setAttribute("stdDeviation", "12"); // How blurry the blobs are before the matrix
        blur.setAttribute("result", "blur");
        
        const colorMatrix = document.createElementNS(svgNS, "feColorMatrix");
        colorMatrix.setAttribute("in", "blur");
        colorMatrix.setAttribute("mode", "matrix");
        // The magic numbers that create the sharp "goo" edges by increasing alpha contrast
        colorMatrix.setAttribute("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"); 
        colorMatrix.setAttribute("result", "goo");
        
        const composite = document.createElementNS(svgNS, "feComposite");
        composite.setAttribute("in", "SourceGraphic");
        composite.setAttribute("in2", "goo");
        composite.setAttribute("operator", "atop");
        
        filter.appendChild(blur);
        filter.appendChild(colorMatrix);
        filter.appendChild(composite);
        defs.appendChild(filter);
        svg.appendChild(defs);
        document.body.appendChild(svg);

        // 2. Create the container for the blobs and apply the filter
        const gooeyContainer = document.createElement('div');
        gooeyContainer.className = 'gooey-blobs-container';
        gooeyContainer.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            overflow: hidden; z-index: 0; filter: url(#goo-filter); pointer-events: none;
        `;
        hero.insertBefore(gooeyContainer, hero.firstChild);

        // 3. Generate the animated blobs using our exact brand colors
        const colors = ['#BD3745', '#CE6974', '#DE9BA2', '#EFCDD1'];
        for (let i = 0; i < 6; i++) {
            const blob = document.createElement('div');
            const size = Math.random() * 150 + 80; // Random size between 80px and 230px
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            blob.style.cssText = `
                position: absolute;
                width: ${size}px; height: ${size}px;
                background-color: ${color};
                border-radius: 50%;
                opacity: 0.6;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: floatBlob ${Math.random() * 15 + 10}s infinite alternate ease-in-out;
                animation-delay: ${Math.random() * -20}s;
            `;
            gooeyContainer.appendChild(blob);
        }

        // Inject the keyframes for the blob movement
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatBlob {
                0% { transform: translate(0, 0) scale(1); }
                33% { transform: translate(100px, -50px) scale(1.1); }
                66% { transform: translate(-50px, 100px) scale(0.9); }
                100% { transform: translate(50px, 50px) scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    }

    initGooeyHero();


    // ============================================================================
    // 🔍 3. SMART SERVICE SEARCH & DISCOVERY
    // ============================================================================
    // Finding exactly what you need on a massive enterprise services page can be 
    // a headache. That's why we've built a smart, forgiving search bar right in 
    // the hero section. As the user types, we instantly scan the page for matching 
    // headings, paragraphs, and list items. If we find a match, we show it in a 
    // neat dropdown. If they misspell something, we don't just say "Error" – we 
    // gently suggest some of our most popular services to keep them moving forward.

    // Inject the search bar into the hero if it doesn't already exist in the HTML
    const heroBody = document.querySelector('.services-hero .hero-body');
    if (heroBody && !document.getElementById('serviceSearch')) {
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'search-box-wrapper';
        searchWrapper.innerHTML = `
            <div class="control">
                <input id="serviceSearch" class="input" type="text" placeholder="Search services (e.g., CCTV, Fibre, Monitoring)...">
                <span class="search-icon">
                    <i class="fas fa-search"></i>
                </span>
            </div>
            <div id="searchSuggestions" class="search-suggestions"></div>
        `;
        const subtitle = heroBody.querySelector('.subtitle');
        if (subtitle) {
            subtitle.insertAdjacentElement('afterend', searchWrapper);
        } else {
            heroBody.appendChild(searchWrapper);
        }
    }

    const searchInput = document.getElementById('serviceSearch');
    const suggestionsBox = document.getElementById('searchSuggestions');

    if (searchInput && suggestionsBox) {
        // Helper: Gather all searchable text from the page's service sections
        function getAllServiceTexts() {
            const serviceSections = document.querySelectorAll('.split-section, .ict-solutions, .diagonal-section, .monitoring-section, .telco-lan-fibre, .wireless-it-section, .school-panel');
            const texts = [];
            
            serviceSections.forEach(section => {
                section.querySelectorAll('h2, h3, .title, .subtitle').forEach(h => {
                    const txt = h.textContent.trim();
                    if (txt.length > 2) texts.push(txt);
                });
                section.querySelectorAll('p').forEach(p => {
                    const txt = p.textContent.trim();
                    if (txt.length > 5) texts.push(txt);
                });
                section.querySelectorAll('li, .strip-item, .grid-item h3, .school-grid span').forEach(el => {
                    const txt = el.textContent.trim();
                    if (txt.length > 2) texts.push(txt);
                });
            });
            
            // Remove duplicates so the suggestions aren't repetitive
            return [...new Set(texts)];
        }

        const serviceTexts = getAllServiceTexts();

        // Helper: Smoothly scroll to the relevant section and give it a quick highlight
        function scrollToService(text) {
            const allElements = document.querySelectorAll('h2, h3, p, li, .strip-item, .grid-item');
            for (let el of allElements) {
                if (el.textContent.trim().toLowerCase().includes(text.toLowerCase())) {
                    const section = el.closest('section') || el.closest('.split-section') || el.closest('.diagonal-section') || el.closest('.monitoring-section') || el.closest('.telco-lan-fibre') || el.closest('.wireless-it-section') || el.closest('.school-panel');
                    
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        
                        // Quick visual flash to show the user exactly where they landed
                        section.style.transition = 'background 0.4s ease';
                        section.style.background = 'rgba(239, 205, 209, 0.3)'; // Cotton Rose tint
                        setTimeout(() => { 
                            section.style.background = ''; 
                        }, 1500);
                        return;
                    }
                }
            }
        }

        // Helper: Render the dropdown suggestions
        function renderSuggestions(results, query) {
            suggestionsBox.innerHTML = '';
            
            if (results.length === 0 && query.length > 1) {
                // The "We couldn't find that, but here's some inspiration" state
                const noResult = document.createElement('div');
                noResult.className = 'no-result';
                noResult.innerHTML = `<i class="fas fa-exclamation-circle" style="color:#BD3745;margin-right:8px;"></i> Service not found. Try searching for: CCTV, Fibre, LAN, or Monitoring.`;
                suggestionsBox.appendChild(noResult);

                // Show some popular suggestions to get them back on track
                const popularSuggestions = ['CCTV Installation', 'Dedicated Internet', 'Fibre Solutions', 'Network Monitoring', 'IT Support'];
                popularSuggestions.forEach(s => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.textContent = `💡 ${s}`;
                    item.addEventListener('click', () => {
                        searchInput.value = s;
                        suggestionsBox.classList.remove('show');
                        scrollToService(s);
                    });
                    suggestionsBox.appendChild(item);
                });
            } else {
                // Show the actual matches
                results.slice(0, 6).forEach(text => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.textContent = text.length > 60 ? text.substring(0, 60) + '...' : text;
                    item.addEventListener('click', () => {
                        searchInput.value = text;
                        suggestionsBox.classList.remove('show');
                        scrollToService(text);
                    });
                    suggestionsBox.appendChild(item);
                });
            }
            
            if (query.length > 1 || results.length > 0) {
                suggestionsBox.classList.add('show');
            } else {
                suggestionsBox.classList.remove('show');
            }
        }

        // Listen to the user typing
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length === 0) {
                suggestionsBox.classList.remove('show');
                return;
            }
            const lower = query.toLowerCase();
            const results = serviceTexts.filter(text => text.toLowerCase().includes(lower));
            renderSuggestions(results, query);
        });

        // Close the dropdown if the user clicks anywhere else on the page
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-box-wrapper')) {
                suggestionsBox.classList.remove('show');
            }
        });
    }


    // ============================================================================
    // 🖼️ 4. BEFORE & AFTER IMPACT SLIDER
    // ============================================================================
    // People love seeing the "after" picture, but letting them interact with it 
    // makes it memorable. This section creates a draggable slider that reveals 
    // the "modernized" network state over the "legacy" state. We handle both 
    // mouse and touch events here so it feels just as smooth on a smartphone 
    // as it does on a desktop.

    // Inject the comparison container if it doesn't exist in the HTML
    let comparisonContainer = document.getElementById('imageComparison');
    if (!comparisonContainer) {
        const impactSection = document.querySelector('.comparison-section') || document.querySelector('.section:last-of-type');
        if (impactSection) {
            comparisonContainer = document.createElement('div');
            comparisonContainer.id = 'imageComparison';
            comparisonContainer.style.padding = '2rem 0';
            impactSection.appendChild(comparisonContainer);
        }
    }

    if (comparisonContainer) {
        // Build the slider UI dynamically using pure JS
        const wrapper = document.createElement('div');
        wrapper.className = 'comparison-slider-wrapper';
        wrapper.style.cssText = `
            position: relative; width: 100%; max-width: 800px; margin: 0 auto;
            aspect-ratio: 16/9; background: #f0f0f0; border-radius: 16px;
            overflow: hidden; user-select: none; box-shadow: 0 20px 50px rgba(189,55,69,0.15);
        `;

        // "Before" Layer (Legacy Network)
        const beforeDiv = document.createElement('div');
        beforeDiv.style.cssText = `
            width: 100%; height: 100%; 
            background: linear-gradient(135deg, #d4a5a5, #b87373);
            display: flex; align-items: center; justify-content: center;
            flex-direction: column; gap: 1rem; color: white;
        `;
        beforeDiv.innerHTML = `
            <i class="fas fa-network-wired" style="font-size: 4rem; opacity: 0.6;"></i>
            <span style="font-size: 1.2rem; font-weight: 600; letter-spacing: 1px;">Legacy Infrastructure</span>
        `;
        wrapper.appendChild(beforeDiv);

        // "After" Layer (Modern ICT) - This one gets clipped by the slider
        const afterDiv = document.createElement('div');
        afterDiv.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, #BD3745, #CE6974);
            display: flex; align-items: center; justify-content: center;
            flex-direction: column; gap: 1rem; color: white;
            clip-path: inset(0 50% 0 0); /* Start at 50% */
        `;
        afterDiv.innerHTML = `
            <i class="fas fa-cloud-upload-alt" style="font-size: 4rem; opacity: 0.9;"></i>
            <span style="font-size: 1.2rem; font-weight: 600; letter-spacing: 1px;">Modern ICT Solutions</span>
        `;
        wrapper.appendChild(afterDiv);

        // The Draggable Handle
        const handle = document.createElement('div');
        handle.style.cssText = `
            position: absolute; top: 0; bottom: 0; width: 4px;
            background: rgba(255,255,255,0.9); cursor: ew-resize;
            display: flex; align-items: center; justify-content: center;
            left: calc(50% - 2px); z-index: 10;
        `;

        const knob = document.createElement('div');
        knob.style.cssText = `
            background: white; border-radius: 50%; width: 50px; height: 50px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;
        knob.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BD3745" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="15" y1="18" x2="9" y2="12"></line>
                <line x1="9" y1="6" x2="15" y2="12"></line>
            </svg>
        `;
        handle.appendChild(knob);
        wrapper.appendChild(handle);

        // "Before" and "After" Labels
        const labelBefore = document.createElement('div');
        labelBefore.className = 'before-after-label before';
        labelBefore.textContent = '🔴 Before';
        wrapper.appendChild(labelBefore);

        const labelAfter = document.createElement('div');
        labelAfter.className = 'before-after-label after';
        labelAfter.textContent = '✨ After';
        wrapper.appendChild(labelAfter);

        comparisonContainer.appendChild(wrapper);

        // --- The Drag Logic ---
        let isDragging = false;

        function setPosition(clientX) {
            const rect = wrapper.getBoundingClientRect();
            // Calculate percentage, ensuring it stays between 0 and 100
            let x = ((clientX - rect.left) / rect.width) * 100;
            x = Math.max(0, Math.min(100, x));
            
            // Update the clip-path to reveal the "After" image
            afterDiv.style.clipPath = `inset(0 ${100 - x}% 0 0)`;
            handle.style.left = `calc(${x}% - 2px)`;
        }

        // Mouse Events
        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            knob.style.transform = 'scale(1.2)'; // Satisfying tactile feedback
            e.preventDefault();
        });
        window.addEventListener('mouseup', () => {
            isDragging = false;
            knob.style.transform = 'scale(1)';
        });
        window.addEventListener('mousemove', (e) => {
            if (isDragging) setPosition(e.clientX);
        });

        // Touch Events (for mobile users)
        handle.addEventListener('touchstart', (e) => {
            isDragging = true;
            knob.style.transform = 'scale(1.2)';
            e.preventDefault();
        });
        window.addEventListener('touchend', () => {
            isDragging = false;
            knob.style.transform = 'scale(1)';
        });
        window.addEventListener('touchmove', (e) => {
            if (isDragging) setPosition(e.touches[0].clientX);
        }, { passive: true });

        // Set initial position to the middle
        setPosition(window.innerWidth / 2);
    }


    // ============================================================================
    // ✨ 5. SCROLL REVEAL ANIMATIONS (Intersection Observer)
    // ============================================================================
    // To make the page feel alive and dynamic, we don't just want everything to 
    // pop in at once. We use the Intersection Observer API to watch for elements 
    // entering the viewport. When they do, we trigger a smooth fade-and-slide-up 
    // animation. It's a subtle touch that makes scrolling feel incredibly premium.

    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.split-content, .split-visual, .grid-item, .monitor-panel, .col-card, .wireless-panel, .it-panel, .school-panel');
        
        // Initially hide them so they can animate in when scrolled to
        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Stagger the animation slightly based on the element's delay variable if it exists
                    const delay = entry.target.style.getPropertyValue('--delay') || '0s';
                    entry.target.style.transitionDelay = delay;
                    
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target); // Stop watching once it's revealed to save performance
                }
            });
        }, {
            threshold: 0.15, // Trigger when 15% of the element is visible
            rootMargin: '0px 0px -50px 0px' // Trigger just before it fully enters
        });

        revealElements.forEach(el => observer.observe(el));
    }

    initScrollReveal();

    console.log('✨ Mdukazi Projects — Services page fully loaded and interactive!');
    console.log('🔍 Try the smart search bar in the hero section.');
    console.log('🖼️ Drag the slider to see our network transformation impact.');

})();