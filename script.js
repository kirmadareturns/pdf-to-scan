let currentFiles = []; // Stores all uploaded files
let convertedPdfBytes = null;
let librariesLoaded = false;
let loadingPromise = null;

const uploadSection = document.getElementById('uploadSection');
const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const settingsSection = document.getElementById('settingsSection');

// --- 1. LIBRARY LOADER (Unchanged) ---
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
        if (typeof window.pdfjsLib === 'undefined') throw new Error("PDF Engine failed.");
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        librariesLoaded = true;
        console.log("PDF Engine Fully Ready.");
    }).catch(err => {
        console.error(err);
        loadingPromise = null;
        alert("Connection error: Could not load PDF tools.");
    });
    return loadingPromise;
}

// --- 2. TRIGGERS & EVENTS ---
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

if (fileInput) fileInput.addEventListener('change', handleFileSelect);
if (convertBtn) convertBtn.addEventListener('click', convertPDF);

// --- 3. UPDATED FILE HANDLING (APPEND MODE) ---
async function handleFileSelect(event) {
    const newFiles = Array.from(event.target.files);
    if (newFiles.length === 0) return;

    // Filter PDFs
    const validFiles = newFiles.filter(f => f.type === 'application/pdf');
    if (validFiles.length === 0) return alert('Only PDF files are allowed.');

    loadLibraries();

    // APPEND new files to existing list (Don't overwrite)
    // Check for duplicates based on name to be safe
    const existingNames = new Set(currentFiles.map(f => f.name));
    const uniqueNewFiles = validFiles.filter(f => !existingNames.has(f.name));
    
    if (uniqueNewFiles.length === 0 && currentFiles.length > 0) {
        // If user adds same file again, just ignore or alert
        console.log("File already added.");
    } else {
        currentFiles = [...currentFiles, ...uniqueNewFiles];
    }

    // Reset input so user can select more if they want
    if (fileInput) fileInput.value = ''; 

    showFileInfo();
    settingsSection.classList.add('active');
    settingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (typeof gtag !== 'undefined') gtag('event', 'file_upload', { 'event_category': 'conversion', 'event_label': 'pdf_uploaded' });
}

function showFileInfo() {
    const totalSize = (currentFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2);
    const count = currentFiles.length;
    
    // List first few names
    let nameDisplay = currentFiles.map(f => f.name).join(', ');
    if (nameDisplay.length > 50) nameDisplay = nameDisplay.substring(0, 50) + '...';

    document.getElementById('fileInfo').innerHTML = `
        <div class="file-info-row"><span class="file-info-label">Queue:</span><span class="file-info-value"><strong>${count}</strong> File(s) Ready</span></div>
        <div class="file-info-row"><span class="file-info-label">Total Size:</span><span class="file-info-value">${totalSize} MB</span></div>
        <div class="file-info-row"><span class="file-info-label">Files:</span><span class="file-info-value" style="font-size:0.8em;">${nameDisplay}</span></div>
        ${count > 1 ? '<div style="margin-top:5px; font-size:0.8em; color:#666;">(Files will be merged into one PDF)</div>' : ''}
    `;
}

// --- 4. BATCH CONVERSION LOGIC ---
async function convertPDF() {
    if (currentFiles.length === 0) return alert("No files selected!");

    if (!librariesLoaded) {
        document.body.style.cursor = 'wait';
        convertBtn.disabled = true;
        convertBtn.textContent = "Loading Engine...";
        try { await loadLibraries(); } catch (e) { 
            convertBtn.disabled = false; 
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
        const dpi = parseInt(document.getElementById('dpiSelect').value) || 150; // Default to 150 if null
        const pdfDoc = await PDFLib.PDFDocument.create();
        
        updateProgress(5, 'Starting Batch...');

        // --- MAIN LOOP: Process each file ---
        for (let fIndex = 0; fIndex < currentFiles.length; fIndex++) {
            const file = currentFiles[fIndex];
            console.log(`Processing file ${fIndex + 1}: ${file.name}`);
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // --- PAGE LOOP: Process each page ---
            for (let i = 1; i <= pdf.numPages; i++) {
                // Math for smooth progress bar
                const totalFiles = currentFiles.length;
                const fileProgressChunk = 90 / totalFiles; // Each file gets a chunk of the bar
                const currentBase = 5 + (fIndex * fileProgressChunk);
                const pageProgress = (i / pdf.numPages) * fileProgressChunk;
                
                updateProgress(
                    currentBase + pageProgress, 
                    `File ${fIndex + 1}/${totalFiles} - Page ${i}/${pdf.numPages}`
                );

                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: dpi / 72 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: ctx, viewport }).promise;
                applyScannedEffect(ctx, canvas.width, canvas.height);

                const imgData = canvas.toDataURL('image/jpeg', 0.85); // 0.85 quality is faster/smaller
                const imgBytes = await fetch(imgData).then(r => r.arrayBuffer());
                const image = await pdfDoc.embedJpg(imgBytes);
                const pdfPage = pdfDoc.addPage([viewport.width, viewport.height]);
                pdfPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height });
            }
        }

        updateProgress(95, 'Merging files...');
        convertedPdfBytes = await pdfDoc.save();
        updateProgress(100, 'Done!');
        
        setTimeout(() => {
            progressSection.classList.remove('active');
            document.getElementById('resultSection').classList.add('active');
            setupDownload();
        }, 500);

    } catch (err) {
        console.error(err);
        alert('Error during conversion: ' + err.message);
        convertBtn.disabled = false;
        progressSection.classList.remove('active');
    }
}

function applyScannedEffect(ctx, w, h) {
    // White bg
    ctx.fillStyle = '#fcfcf5';
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillRect(0, 0, w, h);

    // Noise
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 50;
    noiseCanvas.height = 50;
    const nCtx = noiseCanvas.getContext('2d');
    const imgData = nCtx.createImageData(50, 50);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const v = 235 + Math.random() * 20;
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 30; 
    }
    nCtx.putImageData(imgData, 0, 0);

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = ctx.createPattern(noiseCanvas, 'repeat');
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
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
        
        // Naming
        let fName = 'scanned_document.pdf';
        if (currentFiles.length === 1) fName = currentFiles[0].name.replace('.pdf', '_scanned.pdf');
        else fName = `scanned_batch_${currentFiles.length}_files.pdf`;

        a.download = fName;
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
    document.getElementById('fileInfo').innerHTML = '';
}
