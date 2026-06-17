/**
 * Mdukazi Projects — Main Script
 * ================================
 Handles four things in order:
 1. AOS (Animate On Scroll) initialisation
   2. Hero word-switcher animation (spring-style, 21st.dev approach)
   3. Dynamic feature cards — loaded from data.json, fallback built in
   4. Live search / filter on the feature cards
   5. Animated stat counters (count up from zero)
 
 Everything waits for DOMContentLoaded so we never touch
  an element that hasn't been parsed yet.
 */
document.addEventListener('DOMContentLoaded', () => {


    /* =============================================
       1. AOS — Animate On Scroll
       Triggers the fade-in/slide-in effects defined
       via data-aos="..." attributes in the HTML.
       'once: true' means the animation only fires the
       first time an element enters the viewport —
       no replaying when you scroll back up.
    ============================================= */
    AOS.init({
        duration: 750,          // how long each animation takes (ms)
        easing:   'ease-out-cubic',
        once:     true,         // animate once, then leave it visible
        offset:   80,           // trigger 80px before the element is fully in view
    });


    /* =============================================
       2. Hero Word Switcher
       Cycles through the <span class="word"> elements
       inside .word-switcher. The active class slides
       the word into view; the exit class shoots it upward.
       All the visual work is in CSS — JS just swaps classes.
    ============================================= */
    const words       = document.querySelectorAll('.word-switcher .word');
    let   activeIndex = 0; // track which word is currently showing

    if (words.length > 0) {
        // Make sure the first word starts in the visible position
        words[0].classList.add('active');

        setInterval(() => {
            const currentWord = words[activeIndex];

            // Work out the next word index, looping back to 0 at the end
            const nextIndex = (activeIndex + 1) % words.length;
            const nextWord  = words[nextIndex];

            // 1. Tell the current word to shoot upward and fade out
            currentWord.classList.remove('active');
            currentWord.classList.add('exit');

            // 2. Bring the next word in from below
            nextWord.classList.add('active');

            // 3. After the CSS exit transition finishes, clean up the exit class
            //    so the word resets to its "waiting below" position silently
            setTimeout(() => {
                currentWord.classList.remove('exit');
            }, 450); // should match the transition duration in CSS

            // Advance the pointer
            activeIndex = nextIndex;

        }, 2200); // swap every 2.2 seconds — feels natural, not rushed
    }


    /* =============================================
       3. Dynamic Feature Cards
       We try to load data.json first. If the file
       doesn't exist yet (common during dev), we fall
       back to the hardcoded array below — so the page
       never looks broken while you're building.
    ============================================= */

    // Grab the grid container that script.js is responsible for filling
    const featuresContainer = document.getElementById('features-container');

    // Keep a full copy of all features so the search filter can work from it
    let allFeatures = [];

    // Fallback data — mirrors what you'd put in data.json
    // Just create a real data.json when you're ready; this stays as backup
    const fallbackFeatures = [
        {
            id: 1,
            icon: '📡',
            title: 'Dedicated Data Service',
            description: 'Exclusive bandwidth reserved solely for your business operations — no sharing with neighbours.'
        },
        {
            id: 2,
            icon: '💰',
            title: 'Fixed Monthly Pricing',
            description: 'Predictable costs every month with no hidden fees, no throttling surprises.'
        },
        {
            id: 3,
            icon: '♾️',
            title: 'Uncapped Data',
            description: 'Unlimited data usage — download, upload, and stream as much as your business needs.'
        },
        {
            id: 4,
            icon: '🚀',
            title: 'Unshaped Traffic',
            description: 'No traffic shaping or prioritisation — all your data flows at full speed, always.'
        },
        {
            id: 5,
            icon: '⚡',
            title: 'Guaranteed Speeds',
            description: 'Always-on service with consistent, SLA-backed performance you can actually rely on.'
        },
        {
            id: 6,
            icon: '🛡️',
            title: '24/7 Monitoring',
            description: 'Round-the-clock network monitoring and support so issues get caught before you notice them.'
        },
    ];

    // Try fetching the real JSON first; fall back silently if it's not there yet
    fetch('data.json')
        .then(response => {
            // If the server returned anything other than 200, treat it as missing
            if (!response.ok) throw new Error('data.json not found');
            return response.json();
        })
        .then(data => {
            // data.json loaded successfully — use it
            allFeatures = data.features;
            renderFeatures(allFeatures);
            animateStats();
        })
        .catch(() => {
            // data.json missing or malformed — use the fallback and move on
            console.info('data.json not found — using fallback feature data. Create data.json to override this.');
            allFeatures = fallbackFeatures;
            renderFeatures(allFeatures);
            animateStats();
        });


    /**
     * renderFeatures
     * Clears the grid and injects a card for each feature object.
     * Called on initial load and every time the search term changes.
     *
     * @param {Array} features — array of { id, icon, title, description }
     */
    function renderFeatures(features) {
        // Wipe whatever was in the container (loading message or previous results)
        featuresContainer.innerHTML = '';

        if (features.length === 0) {
            // Let the user know their search returned nothing
            featuresContainer.innerHTML = '<p class="loading-msg">No services match your search — try a different keyword.</p>';
            return;
        }

        features.forEach((feature, index) => {
            // Build the outer wrapper div that AOS will animate
            const col = document.createElement('div');

            // Build the card itself
            const card = document.createElement('div');
            card.className = 'feature-card';
            card.setAttribute('data-aos', 'fade-up');
            // Stagger each card slightly so they cascade in rather than all at once
            card.setAttribute('data-aos-delay', String(index * 80));

            // Fill the card with icon, heading, and description
            // We use textContent for the heading and description to avoid XSS
            // (in case data.json ever comes from an external source)
            const iconEl = document.createElement('div');
            iconEl.className = 'feature-icon';
            iconEl.textContent = feature.icon;

            const titleEl = document.createElement('h3');
            titleEl.textContent = feature.title;

            const descEl = document.createElement('p');
            descEl.textContent = feature.description;

            // Assemble and append
            card.appendChild(iconEl);
            card.appendChild(titleEl);
            card.appendChild(descEl);
            featuresContainer.appendChild(card);
        });

        // Tell AOS to re-scan the DOM so it picks up the freshly injected cards
        AOS.refresh();
    }


    /* =============================================
       4. Live Search / Filter
       Filters the feature cards in real time as the
       user types. Matches against both title and
       description so "uncapped" and "unlimited" both work.
    ============================================= */
    const searchInput = document.getElementById('feature-search');
    const searchBtn   = document.getElementById('search-btn');

    /**
     * filterFeatures
     * Reads the current input value and re-renders only
     * the features whose title or description contains the term.
     */
    function filterFeatures() {
        const term = searchInput.value.toLowerCase().trim();

        if (term === '') {
            // Empty search = show everything
            renderFeatures(allFeatures);
            return;
        }

        const filtered = allFeatures.filter(feature =>
            feature.title.toLowerCase().includes(term) ||
            feature.description.toLowerCase().includes(term)
        );

        renderFeatures(filtered);
    }

    // Fire on every keystroke so results update as you type
    searchInput.addEventListener('input', filterFeatures);

    // Also fire on the button click (and Enter key via the button)
    searchBtn.addEventListener('click', filterFeatures);

    // Allow pressing Enter inside the input to trigger a search too
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') filterFeatures();
    });


    /* =============================================
       5. Animated Stat Counters
       Each .stat-number element has a data-target attribute
       with the final value. We animate from 0 to that value
       using requestAnimationFrame for a silky smooth count-up.
       Called after the features render so the page is ready.
    ============================================= */

    /**
     * animateStats
     * Runs the count-up animation on every element with class .stat-number.
     * Automatically detects whether the target is a decimal (e.g. 99.9)
     * and formats it accordingly.
     */
    function animateStats() {
        const statEls   = document.querySelectorAll('.stat-number');
        const duration  = 2000; // total animation time in ms

        statEls.forEach(statEl => {
            const target    = parseFloat(statEl.getAttribute('data-target'));
            const isDecimal = !Number.isInteger(target); // e.g. 99.9 vs 24
            const startTime = performance.now();

            /**
             * tick — called on every animation frame.
             * Calculates progress (0 → 1), applies an ease-out curve,
             * and updates the element text.
             */
            function tick(currentTime) {
                // How far through the animation are we? (clamped 0–1)
                const progress = Math.min((currentTime - startTime) / duration, 1);

                // Ease-out quartic: fast start, gentle landing
                const eased = 1 - Math.pow(1 - progress, 4);

                // Set the text — one decimal place for decimals, integer otherwise
                statEl.textContent = isDecimal
                    ? (target * eased).toFixed(1)
                    : Math.floor(target * eased);

                // Keep going until we've hit the end
                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    // Make absolutely sure the final value is exact, not a rounding artifact
                    statEl.textContent = isDecimal ? target.toFixed(1) : target;
                }
            }

            requestAnimationFrame(tick);
        });
    }


}); // end DOMContentLoaded