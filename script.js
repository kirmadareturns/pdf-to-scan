// --- 1. AUTO-FIX HTML ---
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
    const newFiles = Array.from(event.target.files);
    if (newFiles.length === 0) return;

    const validFiles = newFiles.filter(f => f.type === 'application/pdf');
    if (validFiles.length === 0) return alert('Please upload PDF files only.');

    loadLibraries();

    const existingNames = new Set(currentFiles.map(f => f.name));
    const uniqueToAdd = validFiles.filter(f => !existingNames.has(f.name));
    
    currentFiles = [...currentFiles, ...uniqueToAdd];

    showFileInfo();
    settingsSection.classList.add('active');
    // Smooth scroll to settings
    settingsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    if (fileInputRef) fileInputRef.value = ''; 
}

function showFileInfo() {
    const totalSize = (currentFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2);
    
    document.getElementById('fileInfo').innerHTML = `
        <div class="file-info-row" style="display:flex; justify-content:space-between;">
            <span>Files Loaded: <strong>${currentFiles.length}</strong></span>
            <span>Total: ${totalSize} MB</span>
        </div>
    `;
}

// --- 6. CONVERSION PROCESS ---
async function convertPDF() {
    if (currentFiles.length === 0) return alert("No files loaded.");

    // >>> 1. START SCAN LIGHT <<<
    document.getElementById('scanOverlay').classList.add('active');

    if (!librariesLoaded) {
        convertBtn.textContent = "Loading Engine...";
        try { await loadLibraries(); } catch (e) { 
            document.getElementById('scanOverlay').classList.remove('active');
            return; 
        }
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

        for (let fIndex = 0; fIndex < currentFiles.length; fIndex++) {
            const file = currentFiles[fIndex];
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            for (let i = 1; i <= pdf.numPages; i++) {
                updateProgress(
                    ((fIndex / currentFiles.length) * 100) + ((i/pdf.numPages) * (100/currentFiles.length)), 
                    `Scanning Page ${i}...`
                );

                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: dpi / 72 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: ctx, viewport }).promise;
                
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'source-over';

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
            // >>> 2. STOP SCAN LIGHT <<<
            document.getElementById('scanOverlay').classList.remove('active');
            
            progressSection.classList.remove('active');
            document.getElementById('resultSection').classList.add('active');
            setupDownload();
        }, 500);

    } catch (err) {
        alert('Error: ' + err.message);
        document.getElementById('scanOverlay').classList.remove('active');
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
    document.getElementById('scanOverlay').classList.remove('active');
}

// --- 7. NEW FUNCTION FOR COLLAPSIBLE SECTIONS ---
function toggleSection(header) {
    header.parentElement.classList.toggle('open');
}
