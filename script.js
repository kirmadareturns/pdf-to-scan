let currentFiles = []; // CHANGED: Now stores an array of files
let convertedPdfBytes = null;
let librariesLoaded = false;
let loadingPromise = null;

const uploadSection = document.getElementById('uploadSection');
const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const settingsSection = document.getElementById('settingsSection');

// --- 1. ROBUST LIBRARY LOADER ---
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            return resolve();
        }
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

    console.log("Starting PDF Engine download...");
    
    loadingPromise = Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js')
    ]).then(async () => {
        let attempts = 0;
        while (typeof window.pdfjsLib === 'undefined' && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }
        
        if (typeof window.pdfjsLib === 'undefined') {
            throw new Error("PDF Engine loaded but failed to initialize.");
        }

        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        librariesLoaded = true;
        console.log("PDF Engine Fully Ready.");
    }).catch(err => {
        console.error("Library Load Error:", err);
        loadingPromise = null;
        alert("Could not load PDF tools. Please check internet connection.");
    });

    return loadingPromise;
}

// --- 2. PREFETCH TRIGGERS ---
if (uploadSection) {
    uploadSection.addEventListener('mouseenter', loadLibraries);
    uploadSection.addEventListener('touchstart', loadLibraries, { passive: true });
}

// --- 3. EVENT LISTENERS ---
if (uploadSection) {
    uploadSection.addEventListener('dragover', e => {
        e.preventDefault();
        uploadSection.classList.add('dragover');
    });
    uploadSection.addEventListener('dragleave', () => uploadSection.classList.remove('dragover'));
    uploadSection.addEventListener('drop', e => {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
        // Pass the file list correctly
        handleFileSelect({ target: { files: e.dataTransfer.files } });
    });
}

if (fileInput) fileInput.addEventListener('change', handleFileSelect);
if (convertBtn) convertBtn.addEventListener('click', convertPDF);

// --- 4. MULTI-FILE HANDLING ---
async function handleFileSelect(event) {
    const files = Array.from(event.target.files); // Convert FileList to Array
    if (files.length === 0) return;

    // Filter for PDFs
    const validFiles = files.filter(f => f.type === 'application/pdf');
    if (validFiles.length === 0) return alert('Please select valid PDF files');

    loadLibraries();

    currentFiles = validFiles; // Store array
    showFileInfo(validFiles);
    settingsSection.classList.add('active');
    settingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (typeof gtag !== 'undefined') gtag('event', 'file_upload', { 'event_category': 'conversion', 'event_label': 'pdf_uploaded' });
}

function showFileInfo(files) {
    // Calculate total size
    const totalSize = (files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2);
    const count = files.length;
    
    // Create a display string (e.g., "doc1.pdf, doc2.pdf...")
    let nameDisplay = files.map(f => f.name).join(', ');
    if (nameDisplay.length > 60) nameDisplay = nameDisplay.substring(0, 60) + '...';

    document.getElementById('fileInfo').innerHTML = `
        <div class="file-info-row"><span class="file-info-label">Files:</span><span class="file-info-value">${count} Selected</span></div>
        <div class="file-info-row"><span class="file-info-label">Total Size:</span><span class="file-info-value">${totalSize} MB</span></div>
        <div class="file-info-row"><span class="file-info-label">List:</span><span class="file-info-value" style="font-size:0.85em;">${nameDisplay}</span></div>`;
}

// --- 5. BATCH CONVERSION LOGIC ---
async function convertPDF() {
    if (!currentFiles || currentFiles.length === 0) return;

    // Ensure libraries are loaded
    if (!librariesLoaded) {
        document.body.style.cursor = 'wait';
        convertBtn.disabled = true;
        convertBtn.textContent = "Loading Engine...";
        try {
            await loadLibraries();
        } catch (e) {
            convertBtn.disabled = false;
            convertBtn.textContent = "Convert to Scanned PDF";
            document.body.style.cursor = 'default';
            return;
        }
        document.body.style.cursor = 'default';
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
        const dpi = parseInt(document.getElementById('dpiSelect').value);
        
        // Create ONE master document to hold all scanned pages
        const pdfDoc = await PDFLib.PDFDocument.create();
        
        updateProgress(5, 'Initializing Batch...');

        // Iterate through every uploaded file
        for (let fIndex = 0; fIndex < currentFiles.length; fIndex++) {
            const file = currentFiles[fIndex];
            const arrayBuffer = await file.arrayBuffer();
            
            // Load the current PDF
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // Iterate through every page of the current PDF
            for (let i = 1; i <= pdf.numPages; i++) {
                // Calculate progress based on file index AND page index
                const baseProgress = 10 + ((fIndex / currentFiles.length) * 85);
                const pageProgress = (i / pdf.numPages) * (85 / currentFiles.length);
                const totalProgress = baseProgress + pageProgress;

                updateProgress(
                    totalProgress, 
                    `Processing File ${fIndex + 1}/${currentFiles.length} (Page ${i}/${pdf.numPages})...`
                );

                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: dpi / 72 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Render original PDF page to canvas
                await page.render({ canvasContext: ctx, viewport }).promise;
                
                // Apply the "Scanned" look
                applyScannedEffect(ctx, canvas.width, canvas.height);

                // Convert canvas to image and add to master PDF
                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                const imgBytes = await fetch(imgData).then(r => r.arrayBuffer());
                const image = await pdfDoc.embedJpg(imgBytes);
                const pdfPage = pdfDoc.addPage([viewport.width, viewport.height]);
                pdfPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height });
            }
        }

        updateProgress(98, 'Finalizing PDF...');
        convertedPdfBytes = await pdfDoc.save();
        updateProgress(100, 'Done!');
        
        setTimeout(() => {
            progressSection.classList.remove('active');
            document.getElementById('resultSection').classList.add('active');
            setupDownload();
        }, 500);

    } catch (err) {
        console.error(err);
        alert('Error converting PDF: ' + err.message);
        convertBtn.disabled = false;
        progressSection.classList.remove('active');
    }
}

function applyScannedEffect(ctx, w, h) {
    // 1. Add white background (handling transparency)
    ctx.fillStyle = '#fcfcf5';
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillRect(0, 0, w, h);

    // 2. Create Noise Pattern
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 50;
    noiseCanvas.height = 50;
    const nCtx = noiseCanvas.getContext('2d');
    const imgData = nCtx.createImageData(50, 50);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const v = 230 + Math.random() * 25;
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 25; // Low alpha
    }
    nCtx.putImageData(imgData, 0, 0);

    // 3. Apply Noise
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = ctx.createPattern(noiseCanvas, 'repeat');
    ctx.fillRect(0, 0, w, h);

    // Reset settings
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
}

// --- 6. DOWNLOAD HANDLING ---
function setupDownload() {
    const btn = document.getElementById('downloadBtn');
    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.onclick = () => {
        const blob = new Blob([convertedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Smart Naming logic
        let fileName;
        if (currentFiles.length === 1) {
            fileName = currentFiles[0].name.replace('.pdf', '_scanned.pdf');
        } else {
            fileName = `scanned_batch_${currentFiles.length}_files.pdf`;
        }

        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
}

function resetApp() {
    currentFiles = [];
    convertedPdfBytes = null;
    fileInput.value = '';
    settingsSection.classList.remove('active');
    document.getElementById('progressSection').classList.remove('active');
    document.getElementById('resultSection').classList.remove('active');
    convertBtn.disabled = false;
}
