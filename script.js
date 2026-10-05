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
    const btnPdf = document.getElementById('btnPdf');
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

    // Auto-shrink recipient name if it's too long
    function adjustNameSize() {
        let fontSize = 76; // Default max size in pixels
        previewName.style.fontSize = fontSize + 'px';
        const maxWidth = 850; 
        
        while (previewName.scrollWidth > maxWidth && fontSize > 28) {
            fontSize -= 2;
            previewName.style.fontSize = fontSize + 'px';
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
            // Must calculate scaling after the element is visible
            scaleCertificate();
        }, 3600);
    });

    // Reset Flow
    btnReset.addEventListener('click', () => {
        recipientNameInput.value = '';
        loadingText.textContent = "সার্টিফিকেট তৈরি করা হচ্ছে...";
        exportMsg.textContent = '';
        showView(landingView);
    });

    // Allow Enter key to submit
    recipientNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnGenerate.click();
        }
    });

    // ----------------------------------------------------
    // Export Logic (PNG & PDF)
    // ----------------------------------------------------
    async function exportCertificate(type) {
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

        const originalBtnText = type === 'png' ? btnPng.innerText : btnPdf.innerText;
        if (type === 'png') btnPng.innerText = 'ডাউনলোড হচ্ছে...';
        else btnPdf.innerText = 'ডাউনলোড হচ্ছে...';

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

            if (type === 'png') {
                const link = document.createElement('a');
                link.download = `${fileName}.png`;
                link.href = imgData;
                link.click();
            } else if (type === 'pdf') {
                const { jsPDF } = window.jspdf;
                // Create PDF with exact dimensions of the image to avoid stretching
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [1280, 720]
                });
                
                pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720);
                pdf.save(`${fileName}.pdf`);
            }
        } catch (err) {
            console.error("Export Error: ", err);
            exportMsg.textContent = 'সার্টিফিকেট ডাউনলোড করার সময় একটি সমস্যা হয়েছে।';
        } finally {
            certElement.style.transform = originalTransform;
            if (wrapper) {
                wrapper.style.height = origWrapHeight;
                wrapper.style.overflow = origWrapOverflow;
            }
            if (type === 'png') btnPng.innerText = originalBtnText;
            else btnPdf.innerText = originalBtnText;
        }
    }

    btnPng.addEventListener('click', () => exportCertificate('png'));
    btnPdf.addEventListener('click', () => exportCertificate('pdf'));
});
