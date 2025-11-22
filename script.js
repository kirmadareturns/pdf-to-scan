// --- 1. VARIABLES ---
let currentFiles = []; 
let convertedPdfBytes = null;
let librariesLoaded = false;
let loadingPromise = null;

const uploadSection = document.getElementById('uploadSection');
const convertBtn = document.getElementById('convertBtn');
const settingsSection = document.getElementById('settingsSection');

// --- 2. AUTO-FIX INPUT ---
const fileInputRef = document.getElementById('fileInput');
if (fileInputRef) fileInputRef.setAttribute('multiple', 'multiple');

// --- 3. LIBRARY LOADING ---
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function loadLibraries() {
    if (librariesLoaded) return;
    // Load PDF.js and PDF-Lib
    await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js')
    ]);
    // Wait for window.pdfjsLib
    while (typeof window.pdfjsLib === 'undefined') { await new Promise(r => setTimeout(r, 50)); }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    librariesLoaded = true;
}

// --- 4. NEW UI FUNCTIONS (SCAN & COLLAPSE) ---
function toggleSection(header) {
    // Toggle the class 'active' on the parent wrapper
    header.parentElement.classList.toggle('active');
}

function triggerScanEffect() {
    const overlay = document.getElementById('scanOverlay');
    if (overlay) overlay.classList.add('scanning');
}

function stopScanEffect() {
    const overlay = document.getElementById('scanOverlay');
    if (overlay) overlay.classList.remove('scanning');
}

// --- 5. EVENT LISTENERS ---
if (uploadSection) {
    uploadSection.addEventListener('click', () => fileInputRef.click());
    uploadSection.addEventListener('dragover', (e) => { e.preventDefault(); uploadSection.style.background = '#fff5f5'; });
    uploadSection.addEventListener('dragleave', () => { uploadSection.style.background = ''; });
    uploadSection.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadSection.style.background = '';
        handleFiles(e.dataTransfer.files);
    });
}

if (fileInputRef) {
    fileInputRef.addEventListener('change', (e) => handleFiles(e.target.files));
}

if (convertBtn) {
    convertBtn.addEventListener('click', convertPDF);
}

// --- 6. MAIN LOGIC ---
async function handleFiles(files) {
    const newFiles = Array.from(files).filter(f => f.type === 'application/pdf');
    if (newFiles.length === 0) return alert("Please upload PDF files.");
    
    await loadLibraries();
    currentFiles = [...currentFiles, ...newFiles];
    
    // UI Updates
    document.getElementById('fileInfo').innerHTML = `Loaded <strong>${currentFiles.length}</strong> file(s).`;
    uploadSection.style.display = 'none'; // Hide upload, show settings
    settingsSection.classList.add('active');
}

async function convertPDF() {
    if (currentFiles.length === 0) return;

    // 1. START SCAN LIGHT
    triggerScanEffect();
    
    // 2. SHOW PROGRESS
    const progressSection = document.getElementById('progressSection');
    const bar = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    
    settingsSection.classList.remove('active');
    progressSection.classList.add('active');
    convertBtn.disabled = true;

    try {
        const dpi = parseInt(document.getElementById('dpiSelect').value) || 300;
        const pdfDoc = await PDFLib.PDFDocument.create();

        for (let i = 0; i < currentFiles.length; i++) {
            const fileData = await currentFiles[i].arrayBuffer();
            const srcPdf = await window.pdfjsLib.getDocument({ data: fileData }).promise;
            
            for (let p = 1; p <= srcPdf.numPages; p++) {
                // Update text
                text.innerText = `Scanning File ${i+1}, Page ${p}...`;
                bar.style.width = `${((i / currentFiles.length) * 100) + (p/srcPdf.numPages * 10)}%`;

                const page = await srcPdf.getPage(p);
                const viewport = page.getViewport({ scale: dpi / 72 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                
                // Render PDF to Canvas
                await page.render({ canvasContext: ctx, viewport }).promise;
                
                // Apply "Scan" White Layer behind (simple approach)
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Embed back to PDF
                const imgData = canvas.toDataURL('image/jpeg', 0.75); // Compress slightly for "scan" look
                const imgBytes = await fetch(imgData).then(r => r.arrayBuffer());
                const embeddedImg = await pdfDoc.embedJpg(imgBytes);
                
                const newPage = pdfDoc.addPage([viewport.width, viewport.height]);
                newPage.drawImage(embeddedImg, { x: 0, y: 0, width: viewport.width, height: viewport.height });
            }
        }

        bar.style.width = '100%';
        text.innerText = 'Finalizing...';
        convertedPdfBytes = await pdfDoc.save();

        // 3. FINISH & STOP LIGHT
        setTimeout(() => {
            stopScanEffect();
            progressSection.classList.remove('active');
            document.getElementById('resultSection').classList.add('active');
            
            // Setup Download
            const dlBtn = document.getElementById('downloadBtn');
            dlBtn.onclick = () => {
                const blob = new Blob([convertedPdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'scanned_document.pdf';
                a.click();
            };
        }, 800);

    } catch (err) {
        alert("Error: " + err.message);
        stopScanEffect();
        settingsSection.classList.add('active');
        progressSection.classList.remove('active');
        convertBtn.disabled = false;
    }
}

function resetApp() {
    location.reload();
}
