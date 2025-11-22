// --- 1. AUTO-FIX HTML ---
// This line forces your file picker to accept multiple files
const fileInputRef = document.getElementById('fileInput');
if (fileInputRef) {
    fileInputRef.setAttribute('multiple', 'multiple');
}

// --- 2. VARIABLES ---
let currentFiles = []; 
let convertedPdfBytes = null;
let librariesLoaded = false;
let loadingPromise = null;

const uploadSection = document.getElementById('uploadSection');
const convertBtn = document.getElementById('convertBtn');
const settingsSection = document.getElementById('settingsSection');

// --- 3. LIBRARY LOADER ---
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
}

async function loadLibraries() {
    if (librariesLoaded) return;
    if (loadingPromise) return loadingPromise;

    console.log("Loading PDF Engine...");
    loadingPromise = Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js')
    ]).then(async () => {
        let attempts = 0;
        while (typeof window.pdfjsLib === 'undefined' && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }
        if (typeof window.pdfjsLib === 'undefined') throw new Error("PDF Engine failed.");
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        librariesLoaded = true;
        console.log("Engine Ready.");
    }).catch(err => {
        console.error(err);
        loadingPromise = null;
        alert("Internet connection required for PDF tools.");
    });
    return loadingPromise;
}

// --- 4. EVENT LISTENERS ---
if (uploadSection) {
    uploadSection.addEventListener('mouseenter', loadLibraries);
    uploadSection.addEventListener('touchstart', loadLibraries, { passive: true });
    
    // Drag & Drop Support
    uploadSection.addEventListener('dragover', e => {
        e.preventDefault();
        uploadSection.classList.add('dragover');
    });
    uploadSection.addEventListener('dragleave', () => uploadSection.classList.remove('dragover'));
    uploadSection.addEventListener('drop', e => {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
        handleFileSelect({ target: { files: e.dataTransfer.files } });
    });
}

if (fileInputRef) fileInputRef.addEventListener('change', handleFileSelect);
if (convertBtn) convertBtn.addEventListener('click', convertPDF);

// --- 5. FILE HANDLING ---
async function handleFileSelect(event) {
    // Get files from input
    const newFiles = Array.from(event.target.files);
    
    if (newFiles.length === 0) return;

    // Filter only PDFs
    const validFiles = newFiles.filter(f => f.type === 'application/pdf');
    if (validFiles.length === 0) return alert('Please upload PDF files only.');

    loadLibraries();

    // Add new files to our list (APPENDING, not replacing)
    const existingNames = new Set(currentFiles.map(f => f.name));
    const uniqueToAdd = validFiles.filter(f => !existingNames.has(f.name));
    
    currentFiles = [...currentFiles, ...uniqueToAdd];

    // Update the UI
    showFileInfo();
    settingsSection.classList.add('active');
    settingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Clear the input
    if (fileInputRef) fileInputRef.value = ''; 
}

function showFileInfo() {
    const totalSize = (currentFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2);
    
    document.getElementById('fileInfo').innerHTML = `
        <div class="file-info-row">
            <span class="file-info-label">Files Loaded:</span>
            <span class="file-info-value"><strong>${currentFiles.length}</strong></span>
        </div>
        <div class="file-info-row">
            <span class="file-info-label">Total Size:</span>
            <span class="file-info-value">${totalSize} MB</span>
        </div>
        <div style="margin-top:8px; font-size:0.8em; color:#666;">
            ${currentFiles.map(f => f.name).join('<br>')}
        </div>
    `;
}

// --- 6. CONVERSION PROCESS ---
async function convertPDF() {
    if (currentFiles.length === 0) return alert("No files loaded.");

    // >>> NEW: INSTANT SCAN LIGHT TRIGGER <<<
    triggerScanEffect();

    if (!librariesLoaded) {
        convertBtn.textContent = "Loading Engine...";
        try { await loadLibraries(); } catch (e) { stopScanEffect(); return; }
        convertBtn.textContent = "Convert to Scanned PDF";
    }

    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    convertBtn.disabled = true;
    progressSection.classList.add('active');

    function updateProgress(percent, text) {
        progressFill.style.width = percent + '%';
        progressText.textContent = text;
    }

    try {
        const dpi = parseInt(document.getElementById('dpiSelect').value) || 150;
        const pdfDoc = await PDFLib.PDFDocument.create();

        // Loop through FILES
        for (let fIndex = 0; fIndex < currentFiles.length; fIndex++) {
            const file = currentFiles[fIndex];
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // Loop through PAGES
            for (let i = 1; i <= pdf.numPages; i++) {
                updateProgress(
                    ((fIndex / currentFiles.length) * 100) + ((i/pdf.numPages) * (100/currentFiles.length)), 
                    `Processing File ${fIndex + 1}/${currentFiles.length} - Page ${i}`
                );

                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: dpi / 72 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: ctx, viewport }).promise;
                
                // Scan Effect
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = '#fcfcf5';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'source-over';

                // Add to PDF
                const imgData = canvas.toDataURL('image/jpeg', 0.8);
                const imgBytes = await fetch(imgData).then(r => r.arrayBuffer());
                const image = await pdfDoc.embedJpg(imgBytes);
                const pdfPage = pdfDoc.addPage([viewport.width, viewport.height]);
                pdfPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height });
            }
        }

        updateProgress(100, 'Finished!');
        convertedPdfBytes = await pdfDoc.save();
        
        setTimeout(() => {
            // >>> NEW: STOP SCAN LIGHT <<<
            stopScanEffect();
            progressSection.classList.remove('active');
            document.getElementById('resultSection').classList.add('active');
            setupDownload();
        }, 500);

    } catch (err) {
        alert('Error: ' + err.message);
        // >>> NEW: STOP SCAN LIGHT ON ERROR <<<
        stopScanEffect();
        convertBtn.disabled = false;
        progressSection.classList.remove('active');
    }
}

function setupDownload() {
    const btn = document.getElementById('downloadBtn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.onclick = () => {
        const blob = new Blob([convertedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFiles.length > 1 ? 'scanned_batch_merged.pdf' : currentFiles[0].name.replace('.pdf', '_scanned.pdf');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
}

function resetApp() {
    currentFiles = [];
    convertedPdfBytes = null;
    if (fileInputRef) fileInputRef.value = '';
    settingsSection.classList.remove('active');
    document.getElementById('progressSection').classList.remove('active');
    document.getElementById('resultSection').classList.remove('active');
    convertBtn.disabled = false;
    stopScanEffect(); // Ensure light is off
}

// --- 7. NEW UI HELPERS (COLLAPSIBLE & ANIMATION) ---

// Called by onclick in HTML for SEO/FAQ sections
function toggleSection(headerElement) {
    const wrapper = headerElement.parentElement;
    wrapper.classList.toggle('active');
}

function triggerScanEffect() {
    const overlay = document.getElementById('scanOverlay');
    if (overlay) {
        overlay.classList.add('scanning');
    }
}

function stopScanEffect() {
    const overlay = document.getElementById('scanOverlay');
    if (overlay) {
        overlay.classList.remove('scanning');
    }
}
