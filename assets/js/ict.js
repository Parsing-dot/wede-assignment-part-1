(function() {
            'use strict';

            // --------------------------------------------------------------
            // 1. NAVBAR: already fixed with CSS, no extra JS needed.
            // --------------------------------------------------------------

            // --------------------------------------------------------------
            // 2. HERO GRID ANIMATION (Boxes effect) with company colors
            // --------------------------------------------------------------
            const heroGrid = document.querySelector('.hero-grid-bg');
            if (heroGrid) {
                const cells = heroGrid.querySelectorAll('.grid-cell');
                const companyColors = [
                    'rgba(189,55,69,0.15)',
                    'rgba(206,105,116,0.15)',
                    'rgba(222,155,162,0.15)',
                    'rgba(239,205,209,0.15)',
                ];
                // Randomly hover cells on a loop
                setInterval(() => {
                    // remove previous hovers
                    cells.forEach(c => c.classList.remove('hovered'));
                    // pick 3-8 random cells
                    const count = 3 + Math.floor(Math.random() * 6);
                    for (let i = 0; i < count; i++) {
                        const idx = Math.floor(Math.random() * cells.length);
                        const cell = cells[idx];
                        if (cell) {
                            cell.classList.add('hovered');
                            const color = companyColors[Math.floor(Math.random() * companyColors.length)];
                            cell.style.fill = color;
                            // reset after a moment
                            setTimeout(() => {
                                cell.classList.remove('hovered');
                                cell.style.fill = 'rgba(255,255,255,0.02)';
                            }, 800 + Math.random() * 400);
                        }
                    }
                }, 1200);
            }

            // --------------------------------------------------------------
            // 3. PRICE TOOLTIP on hover (South African Rands)
            // --------------------------------------------------------------
            const tip = document.getElementById('priceTip');
            const priceElements = document.querySelectorAll('[data-price]');

            function showTip(e, text) {
                tip.textContent = text;
                tip.style.display = 'block';
                const x = e.clientX + 16;
                const y = e.clientY - 10;
                // keep within viewport
                const tipRect = tip.getBoundingClientRect();
                const left = Math.min(x, window.innerWidth - tipRect.width - 20);
                const top = Math.max(10, Math.min(y, window.innerHeight - tipRect.height - 20));
                tip.style.left = left + 'px';
                tip.style.top = top + 'px';
            }

            function hideTip() {
                tip.style.display = 'none';
            }

            priceElements.forEach(el => {
                const price = el.getAttribute('data-price');
                if (!price) return;
                el.addEventListener('mouseenter', function(e) {
                    showTip(e, price);
                });
                el.addEventListener('mousemove', function(e) {
                    // update position as mouse moves
                    const x = e.clientX + 16;
                    const y = e.clientY - 10;
                    const tipRect = tip.getBoundingClientRect();
                    const left = Math.min(x, window.innerWidth - tipRect.width - 20);
                    const top = Math.max(10, Math.min(y, window.innerHeight - tipRect.height - 20));
                    tip.style.left = left + 'px';
                    tip.style.top = top + 'px';
                });
                el.addEventListener('mouseleave', hideTip);
            });

            // --------------------------------------------------------------
            // 4. ORBIT ANIMATION for Residential section
            // --------------------------------------------------------------
            const orbitContainer = document.getElementById('orbitContainer');
            if (orbitContainer) {
                const items = orbitContainer.querySelectorAll('.orbit-item');
                const center = orbitContainer.querySelector('.radial-center');
                if (items.length && center) {
                    // Get dimensions
                    const containerRect = orbitContainer.getBoundingClientRect();
                    const containerWidth = orbitContainer.offsetWidth || 400;
                    const containerHeight = orbitContainer.offsetHeight || 400;
                    const radius = Math.min(containerWidth, containerHeight) * 0.38; // orbit radius

                    // Store initial angles from data-angle attribute
                    const angles = [];
                    items.forEach((item, idx) => {
                        const angleDeg = parseFloat(item.getAttribute('data-angle')) || (idx * 72);
                        angles.push(angleDeg);
                    });

                    let animationId = null;
                    let startTime = null;
                    const duration = 20000; // 20 seconds for full orbit

                    function animateOrbit(timestamp) {
                        if (!startTime) startTime = timestamp;
                        const elapsed = (timestamp - startTime) % duration;
                        const progress = elapsed / duration; // 0 to 1

                        items.forEach((item, idx) => {
                            const baseAngle = angles[idx] || (idx * 72);
                            // Add rotation over time (each item moves at same speed)
                            const angleDeg = baseAngle + (progress * 360);
                            const rad = (angleDeg * Math.PI) / 180;
                            const x = containerWidth / 2 + radius * Math.cos(rad) - (item.offsetWidth / 2 || 50);
                            const y = containerHeight / 2 + radius * Math.sin(rad) - (item.offsetHeight / 2 || 50);
                            item.style.left = x + 'px';
                            item.style.top = y + 'px';
                            // slight scale for depth: items at back (sin negative) smaller
                            const scale = 0.85 + 0.15 * (0.5 + 0.5 * Math.sin(rad));
                            item.style.transform = `scale(${scale})`;
                            // z-index: front items on top
                            const zIndex = Math.floor(10 + 10 * (0.5 + 0.5 * Math.sin(rad)));
                            item.style.zIndex = zIndex;
                        });

                        animationId = requestAnimationFrame(animateOrbit);
                    }

                    // Start animation
                    animationId = requestAnimationFrame(animateOrbit);

                    // Cleanup on page unload (optional)
                    window.addEventListener('beforeunload', function() {
                        if (animationId) cancelAnimationFrame(animationId);
                    });

                    // Handle resize to recalc positions
                    let resizeTimeout;
                    window.addEventListener('resize', function() {
                        clearTimeout(resizeTimeout);
                        resizeTimeout = setTimeout(() => {
                            // update container dimensions
                            const newRect = orbitContainer.getBoundingClientRect();
                            const newWidth = orbitContainer.offsetWidth || 400;
                            const newHeight = orbitContainer.offsetHeight || 400;
                            // We'll just restart the animation with new dimensions
                            if (animationId) cancelAnimationFrame(animationId);
                            startTime = null;
                            // update radius
                            const newRadius = Math.min(newWidth, newHeight) * 0.38;
                            // reposition items immediately
                            items.forEach((item, idx) => {
                                const baseAngle = angles[idx] || (idx * 72);
                                const progress = ((performance.now() - startTime) % duration) / duration;
                                const angleDeg = baseAngle + (progress * 360);
                                const rad = (angleDeg * Math.PI) / 180;
                                const x = newWidth / 2 + newRadius * Math.cos(rad) - (item.offsetWidth / 2 || 50);
                                const y = newHeight / 2 + newRadius * Math.sin(rad) - (item.offsetHeight / 2 || 50);
                                item.style.left = x + 'px';
                                item.style.top = y + 'px';
                            });
                            animationId = requestAnimationFrame(animateOrbit);
                        }, 300);
                    });
                }
            }

            // --------------------------------------------------------------
            // 5. SCROLL INDICATOR: smooth scroll to solutions
            // --------------------------------------------------------------
            const scrollBtn = document.querySelector('.scroll-btn');
            if (scrollBtn) {
                scrollBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.getElementById('solutions');
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            }

            console.log('✨ Mdukazi Projects — Solutions page enhanced.');
            console.log('💰 Hover over any service to see pricing in ZAR.');
            console.log('🔄 Residential icons orbit around the Home Hub.');
        })();