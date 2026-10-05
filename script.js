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
    const loadingText = document.getElementById('loading-text');

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
        
        // Switch to Loading View
        showView(animationView);
        
        // Simulate Generation Process
        setTimeout(() => { loadingText.textContent = "স্বাক্ষর যুক্ত করা হচ্ছে..."; }, 1200);
        setTimeout(() => { loadingText.textContent = "লেআউট চূড়ান্ত করা হচ্ছে..."; }, 2400);
        
        // Transition to Result View
        setTimeout(() => {
            showView(resultView);
            // Must calculate text sizes and scaling after the element is visible
            adjustNameSize();
            scaleCertificate();
        }, 3600);
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
        loadingText.textContent = "সার্টিফিকেট তৈরি করা হচ্ছে...";
        exportMsg.textContent = '';
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
            const fileName = `certificate_${safeName}`;

            const link = document.createElement('a');
            link.download = `${fileName}.png`;
            link.href = imgData;
            link.click();
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
