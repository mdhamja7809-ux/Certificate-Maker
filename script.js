document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // ADMIN CONFIGURATION (Change these to customize)
    // ----------------------------------------------------
    const CONFIG = {
        organization: "CertiCraft Academy",
        courseTitle: "Masterclass in Design",
        description: "For outstanding performance, dedication, and successful completion of all coursework.",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        signerName: "Alex Developer",
        signerTitle: "Lead Instructor"
    };

    // ----------------------------------------------------
    // View Elements
    // ----------------------------------------------------
    const landingView = document.getElementById('landing-view');
    const animationView = document.getElementById('animation-view');
    const resultView = document.getElementById('result-view');
    
    // Inputs & Buttons
    const recipientNameInput = document.getElementById('recipientName');
    const btnGenerate = document.getElementById('btnGenerate');
    const btnReset = document.getElementById('btnReset');
    const btnPng = document.getElementById('btnPng');
    const landingError = document.getElementById('landing-error');
    const exportMsg = document.getElementById('export-msg');

    // Achievement Animation Elements
    const achievementStage = document.getElementById('achievementStage');
    const paperSheet = document.getElementById('paperSheet');
    const paperSvg = document.getElementById('paperSvg');
    const paperGlint = document.getElementById('paperGlint');
    const penContainer = document.getElementById('penContainer');
    const signaturePath = document.getElementById('signaturePath');
    const goldSeal = document.getElementById('goldSeal');
    const sealRipple = document.getElementById('sealRipple');
    const achievementBadge = document.getElementById('achievementBadge');
    const sparklesContainer = document.getElementById('sparklesContainer');
    const lineTitle = document.getElementById('lineTitle');
    const lineSub = document.getElementById('lineSub');
    const lineBody1 = document.getElementById('lineBody1');
    const lineBody2 = document.getElementById('lineBody2');
    const lineSig = document.getElementById('lineSig');
    const lineSigSub = document.getElementById('lineSigSub');

    // Certificate Preview Elements
    const previewOrg = document.getElementById('previewOrg');
    const previewName = document.getElementById('previewName');
    const previewCourse = document.getElementById('previewCourse');
    const previewDesc = document.getElementById('previewDesc');
    const previewDate = document.getElementById('previewDate');
    const previewSignature = document.getElementById('previewSignature');
    const previewSignerName = document.getElementById('previewSignerName');
    const previewSignerTitle = document.getElementById('previewSignerTitle');

    // ----------------------------------------------------
    // Initialization (Apply Config)
    // ----------------------------------------------------
    function applyConfig() {
        previewOrg.textContent = CONFIG.organization;
        previewCourse.textContent = CONFIG.courseTitle;
        previewDesc.textContent = CONFIG.description;
        previewDate.textContent = CONFIG.date;
        
        previewSignerName.textContent = CONFIG.signerName;
        previewSignerTitle.textContent = CONFIG.signerTitle;
    }

    // Auto-shrink recipient name (allows up to 2 lines) and signature (strictly 1 line)
    function adjustNameSize() {
        // 1. Recipient Name: can wrap up to 2 lines, bounded to 700px width and 135px height
        let fontSize = 76; // Default max size in pixels
        previewName.style.fontSize = fontSize + 'px';
        const maxWidth = 700;
        const maxHeight = 135;
        
        while ((previewName.scrollWidth > maxWidth || previewName.scrollHeight > maxHeight) && fontSize > 26) {
            fontSize -= 2;
            previewName.style.fontSize = fontSize + 'px';
        }

        // 2. Signature: must stay on a single line (never wrap) and scale down to fit the signature line
        let sigFontSize = 50; // Default signature size in pixels
        previewSignature.style.fontSize = sigFontSize + 'px';
        const maxSigWidth = 300;

        while (previewSignature.scrollWidth > maxSigWidth && sigFontSize > 20) {
            sigFontSize -= 2;
            previewSignature.style.fontSize = sigFontSize + 'px';
        }
    }

    // Scale Certificate to fit into the screen
    function scaleCertificate() {
        const wrapper = document.querySelector('.preview-wrapper');
        const cert = document.getElementById('certificate');
        if (!wrapper || !cert) return;
        
        // Base dimensions of the certificate
        const certWidth = 1280;
        const certHeight = 720;
        
        const isMobile = window.innerWidth <= 768;
        
        if (!isMobile) {
            // Desktop: restore aspect-ratio and scale by both axes
            wrapper.style.height = '';
            const padding = 40; 
            const availableWidth = wrapper.clientWidth - padding;
            const availableHeight = wrapper.clientHeight - padding;
            
            const scaleX = availableWidth / certWidth;
            const scaleY = availableHeight / certHeight;
            const scale = Math.min(scaleX, scaleY);
            
            if (scale < 1) {
                cert.style.transform = `scale(${scale})`;
            } else {
                cert.style.transform = `scale(1)`;
            }
        } else {
            // Mobile: compute available width and shrink wrapper height to eliminate empty space
            const isSmall = window.innerWidth <= 480;
            const padX = isSmall ? 16 : 20; // 8px or 10px padding each side
            const padY = isSmall ? 16 : 20;
            
            const availableWidth = Math.max(100, wrapper.clientWidth - padX);
            let scale = availableWidth / certWidth;
            
            // For landscape orientation on mobile, also ensure it fits the viewport height if needed
            if (window.innerHeight < 550 && window.innerWidth > window.innerHeight) {
                const maxAvailableHeight = Math.max(160, window.innerHeight - 160);
                const scaleH = maxAvailableHeight / certHeight;
                scale = Math.min(scale, scaleH);
            }
            
            // Never scale up beyond 1
            scale = Math.min(1, Math.max(0.1, scale));
            
            cert.style.transform = `scale(${scale})`;
            wrapper.style.height = `${Math.round(certHeight * scale + padY)}px`;
        }
    }

    // Handle Resize & Orientation change when on result view
    window.addEventListener('resize', () => {
        if (resultView.classList.contains('active')) {
            scaleCertificate();
        }
    });

    window.addEventListener('orientationchange', () => {
        if (resultView.classList.contains('active')) {
            setTimeout(scaleCertificate, 100);
        }
    });

    // ----------------------------------------------------
    // Flow Logic
    // ----------------------------------------------------
    
    // Switch active view
    function showView(viewElement) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        viewElement.classList.add('active');
    }

    // ----------------------------------------------------
    // Playful Achievement Animation Controller
    // ----------------------------------------------------
    let animFrameId = null;
    let animTimeouts = [];
    let isCertReady = false;
    let isAnimationActive = false;

    function clearAnimationTimers() {
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }
        animTimeouts.forEach(t => clearTimeout(t));
        animTimeouts = [];
    }

    function resetAchievementStage() {
        clearAnimationTimers();
        isAnimationActive = false;
        
        // Reset overlay classes
        if (animationView) {
            animationView.classList.remove('active', 'fade-out');
        }

        // Reset element styles and classes
        if (paperSheet) {
            paperSheet.classList.remove('float-in', 'stamp-impact', 'transform-out');
        }
        if (goldSeal) {
            goldSeal.classList.remove('stamped');
        }
        if (sealRipple) {
            sealRipple.classList.remove('active');
        }
        if (achievementBadge) {
            achievementBadge.classList.remove('badge-visible');
        }
        if (sparklesContainer) {
            sparklesContainer.classList.remove('sparkles-active');
        }
        if (paperGlint) {
            paperGlint.classList.remove('sweep');
        }
        if (penContainer) {
            penContainer.style.opacity = '0';
            penContainer.style.transform = 'translate(-100px, -100px)';
        }

        // Reset drawn SVG lines
        if (signaturePath) {
            const pathLen = signaturePath.getTotalLength ? signaturePath.getTotalLength() : 250;
            signaturePath.style.strokeDasharray = `${pathLen}`;
            signaturePath.style.strokeDashoffset = `${pathLen}`;
        }
        if (lineTitle) {
            lineTitle.style.strokeDasharray = '140';
            lineTitle.style.strokeDashoffset = '140';
        }
        if (lineSub) {
            lineSub.style.strokeDasharray = '80';
            lineSub.style.strokeDashoffset = '80';
        }
        if (lineBody1) lineBody1.style.opacity = '0';
        if (lineBody2) lineBody2.style.opacity = '0';
        if (lineSig) lineSig.style.opacity = '0';
        if (lineSigSub) lineSigSub.style.opacity = '0';
        
        const drawnIcon = document.querySelector('.drawn-icon');
        if (drawnIcon) drawnIcon.classList.remove('drawn');
    }

    // Helper: Map SVG coordinate (400x250) to Stage container pixels
    function getStageCoordinates(svgX, svgY) {
        if (!paperSvg || !achievementStage) return { x: 0, y: 0 };
        const stageRect = achievementStage.getBoundingClientRect();
        const paperRect = paperSvg.getBoundingClientRect();
        
        const scaleX = paperRect.width / 400;
        const scaleY = paperRect.height / 250;
        
        const posX = (paperRect.left - stageRect.left) + (svgX * scaleX);
        const posY = (paperRect.top - stageRect.top) + (svgY * scaleY);
        
        return { x: posX, y: posY };
    }

    // Helper: Position pen nib tip (nib tip is at 27.5px, 83.6px inside pen container)
    function setPenPosition(svgX, svgY, rotateDeg = -16) {
        if (!penContainer) return;
        const pos = getStageCoordinates(svgX, svgY);
        penContainer.style.transform = `translate(${pos.x - 27.5}px, ${pos.y - 83.6}px) rotate(${rotateDeg}deg)`;
    }

    // Finish Animation: Transition cleanly to final certificate
    function finishAndShowCertificate() {
        clearAnimationTimers();
        isAnimationActive = false;

        // Transition immediately to result view without flicker
        resultView.classList.add('active');
        landingView.classList.remove('active');
        if (animationView) {
            animationView.classList.remove('active', 'fade-out');
        }

        adjustNameSize();
        scaleCertificate();

        btnGenerate.disabled = false;
        btnGenerate.style.pointerEvents = '';
    }

    // Start playful achievement animation
    function startAchievementAnimation() {
        resetAchievementStage();
        isAnimationActive = true;
        btnGenerate.disabled = true;
        btnGenerate.style.pointerEvents = 'none';

        // Check prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            showView(animationView);
            animTimeouts.push(setTimeout(finishAndShowCertificate, 250));
            return;
        }

        // Show animation view
        showView(animationView);

        // Sequence Step 1: Transition in (0 - 0.4s)
        // Blank cream paper sheet floats up into exact center with 3D tilt
        animTimeouts.push(setTimeout(() => {
            if (!isAnimationActive) return;
            paperSheet.classList.add('float-in');
        }, 50));

        // SVG lines setup
        const sigLength = signaturePath ? signaturePath.getTotalLength() : 250;
        if (signaturePath) {
            signaturePath.style.strokeDasharray = `${sigLength}`;
            signaturePath.style.strokeDashoffset = `${sigLength}`;
        }
        if (lineTitle) {
            lineTitle.style.strokeDasharray = '140';
            lineTitle.style.strokeDashoffset = '140';
        }
        if (lineSub) {
            lineSub.style.strokeDasharray = '80';
            lineSub.style.strokeDashoffset = '80';
        }

        const animStartTime = performance.now();

        // 60fps RAF loop for pen movement & writing (Steps 2 & 3: 0.35s - 2.5s)
        function animatePenFrame(currentTime) {
            if (!isAnimationActive) return;

            const elapsed = (currentTime - animStartTime) / 1000; // in seconds

            if (elapsed < 0.35) {
                // Waiting for paper float-in
                penContainer.style.opacity = '0';
                animFrameId = requestAnimationFrame(animatePenFrame);
                return;
            }

            // Step 2: Pen Entrance (0.35s - 0.85s)
            if (elapsed >= 0.35 && elapsed < 0.85) {
                penContainer.style.opacity = '1';
                const p = (elapsed - 0.35) / 0.50; // 0 to 1
                const ease = 1 - Math.pow(1 - p, 3);
                const wobble = Math.sin(p * Math.PI * 3) * 3 * (1 - p);
                
                // Glide from top-right (440, -40) to Title line start (130, 56)
                const curX = 440 + (130 - 440) * ease;
                const curY = -40 + (56 - (-40)) * ease;
                const rot = 28 + (-16 - 28) * ease + wobble;
                
                setPenPosition(curX, curY, rot);
                animFrameId = requestAnimationFrame(animatePenFrame);
                return;
            }

            // Step 3a: Draw Title line (0.85s - 1.05s)
            if (elapsed >= 0.85 && elapsed < 1.05) {
                penContainer.style.opacity = '1';
                const p = (elapsed - 0.85) / 0.20;
                const curX = 130 + (270 - 130) * p;
                const curY = 56;
                const rot = -16 + Math.sin(p * 20) * 2;
                
                setPenPosition(curX, curY, rot);
                if (lineTitle) {
                    lineTitle.style.strokeDashoffset = `${140 * (1 - p)}`;
                }
                const drawnIcon = document.querySelector('.drawn-icon');
                if (drawnIcon) drawnIcon.classList.add('drawn');
                
                animFrameId = requestAnimationFrame(animatePenFrame);
                return;
            }

            // Step 3b Glide: Lift and glide to Subtitle line (1.05s - 1.15s)
            if (elapsed >= 1.05 && elapsed < 1.15) {
                penContainer.style.opacity = '1';
                if (lineTitle) lineTitle.style.strokeDashoffset = '0';
                const p = (elapsed - 1.05) / 0.10;
                // Arc from (270, 56) to (160, 70)
                const curX = 270 + (160 - 270) * p;
                const curY = 56 + (70 - 56) * p - Math.sin(p * Math.PI) * 6; // slight lift arc
                const rot = -10 + Math.sin(p * Math.PI) * 4;
                setPenPosition(curX, curY, rot);
                animFrameId = requestAnimationFrame(animatePenFrame);
                return;
            }

            // Step 3b: Draw Subtitle line (1.15s - 1.30s)
            if (elapsed >= 1.15 && elapsed < 1.30) {
                penContainer.style.opacity = '1';
                const p = (elapsed - 1.15) / 0.15;
                const curX = 160 + (240 - 160) * p;
                const curY = 70;
                const rot = -14 + Math.sin(p * 18) * 2;
                
                setPenPosition(curX, curY, rot);
                if (lineSub) {
                    lineSub.style.strokeDashoffset = `${80 * (1 - p)}`;
                }
                if (lineBody1) lineBody1.style.opacity = `${p * 0.7}`;
                if (lineBody2) lineBody2.style.opacity = `${p * 0.7}`;
                
                animFrameId = requestAnimationFrame(animatePenFrame);
                return;
            }

            // Step 3c Glide: Lift and glide to Signature Start (1.30s - 1.45s)
            if (elapsed >= 1.30 && elapsed < 1.45) {
                penContainer.style.opacity = '1';
                if (lineSub) lineSub.style.strokeDashoffset = '0';
                if (lineBody1) lineBody1.style.opacity = '0.7';
                if (lineBody2) lineBody2.style.opacity = '0.7';

                const p = (elapsed - 1.30) / 0.15;
                // Arc from (240, 70) to signature start (230, 174)
                const curX = 240 + (230 - 240) * p;
                const curY = 70 + (174 - 70) * p - Math.sin(p * Math.PI) * 10;
                const rot = -12 + ( -18 - (-12) ) * p;
                setPenPosition(curX, curY, rot);

                if (lineSig) lineSig.style.opacity = `${p * 0.7}`;
                if (lineSigSub) lineSigSub.style.opacity = `${p * 0.7}`;

                animFrameId = requestAnimationFrame(animatePenFrame);
                return;
            }

            // Step 3c: Writing Cursive Signature (1.45s - 2.20s)
            if (elapsed >= 1.45 && elapsed < 2.20) {
                penContainer.style.opacity = '1';
                if (lineSig) lineSig.style.opacity = '0.7';
                if (lineSigSub) lineSigSub.style.opacity = '0.7';

                const p = (elapsed - 1.45) / 0.75; // 0 to 1
                const clampedP = Math.min(1, Math.max(0, p));
                
                // Exact stroke drawing and pen tracking
                const curOffset = sigLength * (1 - clampedP);
                if (signaturePath) {
                    signaturePath.style.strokeDashoffset = `${curOffset}`;
                    const pt = signaturePath.getPointAtLength(clampedP * sigLength);
                    const rot = -18 + Math.sin(clampedP * 28) * 3.5;
                    setPenPosition(pt.x, pt.y, rot);
                }

                animFrameId = requestAnimationFrame(animatePenFrame);
                return;
            }

            // Step 3d: Gentle flourish scribble if certificate is still processing (no spinner!)
            if (elapsed >= 2.20 && !isCertReady) {
                penContainer.style.opacity = '1';
                if (signaturePath) signaturePath.style.strokeDashoffset = '0';
                const scribbleP = elapsed - 2.20;
                const curX = 335 + Math.sin(scribbleP * 12) * 8;
                const curY = 182 + Math.cos(scribbleP * 12) * 2;
                const rot = -18 + Math.sin(scribbleP * 12) * 3;
                setPenPosition(curX, curY, rot);
                animFrameId = requestAnimationFrame(animatePenFrame);
                return;
            }

            // Step 4: Pen flourish lift & exit (2.20s - 2.45s)
            if (elapsed >= 2.20 && elapsed < 2.45) {
                if (signaturePath) signaturePath.style.strokeDashoffset = '0';
                const p = (elapsed - 2.20) / 0.25;
                const ease = Math.pow(p, 2); // accelerate out
                
                // Lift from flourish end (335, 182) to top right (450, -50)
                const curX = 335 + (450 - 335) * ease;
                const curY = 182 + (-50 - 182) * ease;
                const rot = -18 + (25 - (-18)) * ease;
                penContainer.style.opacity = `${Math.max(0, 1 - ease * 1.2)}`;
                
                setPenPosition(curX, curY, rot);
                animFrameId = requestAnimationFrame(animatePenFrame);
                return;
            }

            // Pen has fully exited
            penContainer.style.opacity = '0';
        }

        animFrameId = requestAnimationFrame(animatePenFrame);

        // Sequence Step 5: Seal Stamp (2.5s - 3.0s)
        animTimeouts.push(setTimeout(() => {
            if (!isAnimationActive) return;
            goldSeal.classList.add('stamped');
        }, 2500));

        // Impact bounce & ripple (at 2.68s)
        animTimeouts.push(setTimeout(() => {
            if (!isAnimationActive) return;
            paperSheet.classList.add('stamp-impact');
            sealRipple.classList.add('active');
        }, 2680));

        // Sequence Step 6: Achievement Burst (3.0s - 3.6s)
        animTimeouts.push(setTimeout(() => {
            if (!isAnimationActive) return;
            achievementBadge.classList.add('badge-visible');
            sparklesContainer.classList.add('sparkles-active');

            // Gold and festive confetti pop
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 50,
                    spread: 68,
                    origin: { y: 0.56 },
                    colors: ['#f59e0b', '#fbbf24', '#fde68a', '#10b981', '#3b82f6', '#ec4899'],
                    ticks: 180,
                    gravity: 1.15
                });
            }
        }, 3000));

        // Sequence Step 7: Seamless morph & cross-fade into Real Certificate (3.55s - 4.20s)
        // Soft glint sweep across paper
        animTimeouts.push(setTimeout(() => {
            if (!isAnimationActive) return;
            paperGlint.classList.add('sweep');
        }, 3550));

        // Seamless Cross-fade: Activate resultView underneath, pre-scale certificate, and dissolve overlay
        animTimeouts.push(setTimeout(() => {
            if (!isAnimationActive) return;

            // 1. Activate result view behind the fixed animation view (zero white flash)
            resultView.classList.add('active');
            landingView.classList.remove('active');

            // 2. Compute final certificate layout while still covered
            adjustNameSize();
            scaleCertificate();

            // 3. Bloom paper slightly and dissolve the animation overlay seamlessly
            paperSheet.classList.add('transform-out');
            animationView.classList.add('fade-out');

            // 4. Once the 420ms fade-out finishes, cleanly clean up animation overlay
            animTimeouts.push(setTimeout(() => {
                if (!isAnimationActive) return;
                animationView.classList.remove('active', 'fade-out');
                isAnimationActive = false;
                clearAnimationTimers();
                btnGenerate.disabled = false;
                btnGenerate.style.pointerEvents = '';
            }, 440));
        }, 3750));
    }

    // Generate Click
    btnGenerate.addEventListener('click', () => {
        const name = recipientNameInput.value.trim();
        if (!name) {
            landingError.textContent = 'এগিয়ে যেতে অনুগ্রহ করে আপনার নাম লিখুন।';
            return;
        }
        landingError.textContent = '';
        
        // Populate the Certificate
        previewName.textContent = name;
        previewSignature.textContent = name;
        applyConfig();
        
        // Pre-adjust text sizes while hidden
        adjustNameSize();
        
        // Background certificate ready check
        isCertReady = false;
        document.fonts.ready.then(() => {
            isCertReady = true;
        }).catch(() => {
            isCertReady = true;
        });

        // Launch playful achievement animation
        startAchievementAnimation();
    });

    // ----------------------------------------------------
    // Keyboard Focus Mode Animation & Detection
    // ----------------------------------------------------
    const rootElement = document.documentElement;
    const landingCard = document.querySelector('.landing-card');
    let isKeyboardActive = false;
    let baseWindowHeight = window.innerHeight;

    // Smoothly updates focus mode state and calculates card translateY
    function updateKeyboardState(isOpen, keyboardHeight = 0) {
        if (!landingView.classList.contains('active') && isOpen) return;
        
        // Never affect desktop screens wider than 768px
        if (window.innerWidth > 768) {
            document.body.classList.remove('keyboard-open');
            rootElement.style.removeProperty('--kb-height');
            rootElement.style.removeProperty('--card-shift');
            isKeyboardActive = false;
            return;
        }

        if (isOpen) {
            isKeyboardActive = true;
            document.body.classList.add('keyboard-open');
            rootElement.style.setProperty('--kb-height', `${Math.round(keyboardHeight)}px`);

            // Calculate precise translateY using transform only
            if (landingCard) {
                const cardRect = landingCard.getBoundingClientRect();
                const viewportH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
                // Visible area takes keyboard height into account
                const visibleHeight = keyboardHeight > 0 
                    ? Math.min(viewportH, window.innerHeight - keyboardHeight)
                    : viewportH;
                
                // Normal unshifted top position relative to current window
                const unshiftedTop = (window.innerHeight - cardRect.height) / 2;
                // Ideal centered top position within the remaining visible space
                const idealTop = cardRect.height < visibleHeight 
                    ? Math.max(16, (visibleHeight - cardRect.height) / 2)
                    : 12;
                
                const shiftY = Math.max(0, unshiftedTop - idealTop);
                rootElement.style.setProperty('--card-shift', `-${Math.round(shiftY)}px`);
            }
        } else {
            isKeyboardActive = false;
            document.body.classList.remove('keyboard-open');
            rootElement.style.setProperty('--kb-height', '0px');
            rootElement.style.setProperty('--card-shift', '0px');
        }
    }

    // Check keyboard open/close via visualViewport API (resize and scroll)
    function checkVisualViewport() {
        if (!window.visualViewport) return;
        const currentHeight = window.visualViewport.height;
        const diff = Math.max(0, baseWindowHeight - currentHeight);

        // A height difference > 100px reliably detects soft keyboard on mobile
        if (diff > 100) {
            updateKeyboardState(true, diff);
        } else {
            // Update base height when keyboard is closed (handles screen rotation)
            baseWindowHeight = window.innerHeight;
            if (document.activeElement !== recipientNameInput) {
                updateKeyboardState(false, 0);
            }
        }
    }

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', checkVisualViewport);
        window.visualViewport.addEventListener('scroll', checkVisualViewport);
    }

    // Fallback detection using focusin and focusout on input
    recipientNameInput.addEventListener('focusin', () => {
        if (window.innerWidth <= 768) {
            const currentDiff = window.visualViewport 
                ? (baseWindowHeight - window.visualViewport.height) 
                : 0;
            const estimatedKbHeight = currentDiff > 100 ? currentDiff : 280;
            updateKeyboardState(true, estimatedKbHeight);
        }
    });

    recipientNameInput.addEventListener('focusout', () => {
        // Delay closing so direct clicks on "Generate" button register cleanly first
        setTimeout(() => {
            if (document.activeElement !== recipientNameInput) {
                updateKeyboardState(false, 0);
            }
        }, 150);
    });

    // Reset Flow
    btnReset.addEventListener('click', () => {
        recipientNameInput.value = '';
        exportMsg.textContent = '';
        resetAchievementStage();
        updateKeyboardState(false, 0);
        showView(landingView);
    });

    // Allow Enter key to submit
    recipientNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnGenerate.click();
        }
    });

    // ----------------------------------------------------
    // Messenger / In-App Browser Save Modal & Helpers
    // ----------------------------------------------------
    const saveModal = document.getElementById('save-modal');
    const modalCertImage = document.getElementById('modalCertImage');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnModalShare = document.getElementById('btnModalShare');
    const btnModalOpenChrome = document.getElementById('btnModalOpenChrome');
    let currentCertBlob = null;
    let currentCertFileName = 'certificate.png';

    function openSaveModal(imgData, blob, fileName) {
        currentCertBlob = blob;
        currentCertFileName = fileName;
        if (modalCertImage) {
            modalCertImage.src = imgData;
        }
        if (saveModal) {
            saveModal.classList.add('active');
            saveModal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeSaveModal() {
        if (saveModal) {
            saveModal.classList.remove('active');
            saveModal.setAttribute('aria-hidden', 'true');
        }
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeSaveModal);
    }

    if (saveModal) {
        saveModal.addEventListener('click', (e) => {
            if (e.target === saveModal) {
                closeSaveModal();
            }
        });
    }

    // Modal Share button: Re-trigger native share / save
    if (btnModalShare) {
        btnModalShare.addEventListener('click', async () => {
            if (!currentCertBlob) return;
            const file = new File([currentCertBlob], currentCertFileName, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'সার্টিফিকেট',
                        text: 'আমার সার্টিফিকেট'
                    });
                } catch (e) {
                    if (e.name !== 'AbortError') {
                        alert('আপনার ডিভাইসে সরাসরি শেয়ার সাপোর্ট করছে না। ছবির উপর চেপে ধরে Save image চাপুন।');
                    }
                }
            } else {
                alert('অনুগ্রহ করে ছবির উপর ২ সেকেন্ড চেপে ধরে (Long Press) "Save image" বা "Download image" চাপুন।');
            }
        });
    }

    // Modal Open in Chrome / Browser button
    if (btnModalOpenChrome) {
        btnModalOpenChrome.addEventListener('click', () => {
            const currentUrl = window.location.href;
            const isAndroid = /Android/i.test(navigator.userAgent || '');
            if (isAndroid) {
                // Try opening in Chrome directly via Android intent
                const cleanUrl = currentUrl.replace(/^https?:\/\//i, '');
                window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
            } else {
                // On iOS / other, copy URL and prompt
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(currentUrl).then(() => {
                        alert('লিংক কপি করা হয়েছে! Chrome বা Safari ব্রাউজারে পেস্ট করে খুলুন, অথবা উপরে ডানের ৩টি ডটে (⋮) চেপে "Open in Browser" সিলেক্ট করুন।');
                    }).catch(() => {
                        alert('উপরে ডানের ৩টি ডটে (⋮) চেপে "Open in Chrome" বা "Open in Safari" সিলেক্ট করুন।');
                    });
                } else {
                    alert('উপরে ডানের ৩টি ডটে (⋮) চেপে "Open in Chrome" বা "Open in Safari" সিলেক্ট করুন।');
                }
            }
        });
    }

    // ----------------------------------------------------
    // Export Logic (Image / PNG)
    // ----------------------------------------------------
    async function exportCertificate() {
        const name = recipientNameInput.value.trim() || 'Certificate';
        
        // Wait for all fonts to be fully loaded
        await document.fonts.ready;

        const certElement = document.getElementById('certificate');
        
        // Reset transform temporarily so html2canvas captures exact resolution
        const originalTransform = certElement.style.transform;
        const wrapper = document.querySelector('.preview-wrapper');
        const origWrapHeight = wrapper ? wrapper.style.height : '';
        const origWrapOverflow = wrapper ? wrapper.style.overflow : '';

        certElement.style.transform = 'scale(1)';
        if (wrapper) {
            wrapper.style.height = 'auto';
            wrapper.style.overflow = 'visible';
        }

        const originalBtnText = btnPng.innerText;
        btnPng.innerText = 'ডাউনলোড হচ্ছে...';

        try {
            const canvas = await html2canvas(certElement, {
                scale: 2, 
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            // Restore the UI transform immediately
            certElement.style.transform = originalTransform;
            if (wrapper) {
                wrapper.style.height = origWrapHeight;
                wrapper.style.overflow = origWrapOverflow;
            }

            const imgData = canvas.toDataURL('image/png');
            
            // Safe File Name (supports Latin and Bengali characters)
            const safeName = name.replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '_').toLowerCase();
            const fileName = `certificate_${safeName}.png`;

            // Detect Messenger, Facebook, Instagram, or other in-app WebViews
            const ua = navigator.userAgent || '';
            const isMessengerOrIAB = /FBAN|FBAV|Messenger|FB_IAB|Instagram|Line/i.test(ua);

            // Convert canvas to Blob for reliable downloads and files
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    exportMsg.textContent = 'ছবি তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
                    return;
                }

                // ----------------------------------------------------
                // CASE 1: In-App Browser (Messenger / Facebook / Instagram)
                // Direct download is blocked by Meta WebView, so we provide Save Modal / Share
                // ----------------------------------------------------
                if (isMessengerOrIAB) {
                    const file = new File([blob], fileName, { type: 'image/png' });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'সার্টিফিকেট',
                                text: 'সার্টিক্রাফট সার্টিফিকেট'
                            });
                            return;
                        } catch (shareErr) {
                            if (shareErr.name === 'AbortError') return;
                        }
                    }
                    openSaveModal(imgData, blob, fileName);
                    return;
                }

                // ----------------------------------------------------
                // CASE 2: Standard Browser (Chrome on phone, Chrome on PC, Safari, Firefox, Edge)
                // DIRECT DOWNLOAD to device Downloads folder (NO share sheet popup)
                // ----------------------------------------------------
                try {
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = fileName;
                    link.href = blobUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
                } catch (dlErr) {
                    // Fallback to data URL
                    const link = document.createElement('a');
                    link.download = fileName;
                    link.href = imgData;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }, 'image/png');

        } catch (err) {
            console.error("Export Error: ", err);
            exportMsg.textContent = 'সার্টিফিকেট ডাউনলোড করার সময় একটি সমস্যা হয়েছে।';
        } finally {
            certElement.style.transform = originalTransform;
            if (wrapper) {
                wrapper.style.height = origWrapHeight;
                wrapper.style.overflow = origWrapOverflow;
            }
            btnPng.innerText = originalBtnText;
        }
    }

    btnPng.addEventListener('click', exportCertificate);
});
