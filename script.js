let currentFile = null;
let convertedPdfBytes = null;
let librariesLoaded = false;
let loadingPromise = null;

const uploadSection = document.getElementById('uploadSection');
const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const settingsSection = document.getElementById('settingsSection');

// --- 1. PREFETCHING LOGIC (SPEED BOOST) ---
// Start downloading as soon as mouse enters the upload zone
uploadSection.addEventListener('mouseenter', loadLibraries);
uploadSection.addEventListener('touchstart', loadLibraries, {passive: true});
fileInput.addEventListener('click', loadLibraries);

function loadLibraries() {
    if (librariesLoaded || loadingPromise) return;
    
    console.log("Prefetching PDF engines...");
    loadingPromise = Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js')
    ]).then(() => {
        // Set up the worker immediately after loading
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        librariesLoaded = true;
        console.log("PDF Engines Ready.");
    }).catch(err => {
        console.error("Failed to load libraries", err);
        loadingPromise = null; // Allow retry
    });
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if(document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// --- 2. STANDARD EVENT LISTENERS ---
uploadSection.addEventListener('dragover', e => { e.preventDefault(); uploadSection.classList.add('dragover'); });
uploadSection.addEventListener('dragleave', () => uploadSection.classList.remove('dragover');
uploadSection.addEventListener('drop', e => {
    e.preventDefault(); 
    uploadSection.classList.remove('dragover');
    loadLibraries(); // Ensure triggered on drop
    const files = e.dataTransfer.files;
    if (files.length && files[0].type === 'application/pdf') handleFileSelect({ target: { files } });
});

fileInput.addEventListener('change', handleFileSelect);
convertBtn.addEventListener('click', convertPDF);

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') return alert('Please select a valid PDF file');

    // Show loading cursor if libs aren't ready
    if (!librariesLoaded) {
        document.body.style.cursor = 'wait';
        uploadSection.style.opacity = '0.7';
        if (!loadingPromise) loadLibraries();
        await loadingPromise; // Wait for the download to finish
        document.body.style.cursor = 'default';
        uploadSection.style.opacity = '1';
    }

    currentFile = file;
    showFileInfo(file);
    settingsSection.classList.add('active');
    settingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    if (typeof gtag !== 'undefined') gtag('event', 'file_upload', { 'event_category': 'conversion', 'event_label': 'pdf_uploaded' });
}

function showFileInfo(file) {
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    document.getElementById('fileInfo').innerHTML = `
        <div class="file-info-row"><span class="file-info-label">File Name:</span><span class="file-info-value">${file.name}</span></div>
        <div class="file-info-row"><span class="file-info-label">File Size:</span><span class="file-info-value">${fileSize} MB</span></div>
        <div class="file-info-row"><span class="file-info-label">Type:</span><span class="file-info-value">PDF Document</span></div>`;
}

async function convertPDF() {
    if (!currentFile) return;
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    convertBtn.disabled = true;
    progressSection.classList.add('active');

    function updateProgress(percent, text){ progressFill.style.width = percent+'%'; progressText.textContent=text; }

    try {
        const dpi = parseInt(document.getElementById('dpiSelect').value);
        const arrayBuffer = await currentFile.arrayBuffer();
        updateProgress(10,'Loading PDF...');
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pdfDoc = await PDFLib.PDFDocument.create();
        
        for (let i=1;i<=pdf.numPages;i++){
            updateProgress(20+(i/pdf.numPages)*60,`Converting page ${i} of ${pdf.numPages}...`);
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: dpi/72 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width=viewport.width; canvas.height=viewport.height;
            
            await page.render({ canvasContext:ctx, viewport }).promise;
            applyScannedEffect(ctx,canvas.width,canvas.height);
            
            const imgData = canvas.toDataURL('image/jpeg',0.92);
            const imgBytes = await fetch(imgData).then(r=>r.arrayBuffer());
            const image = await pdfDoc.embedJpg(imgBytes);
            const pdfPage = pdfDoc.addPage([viewport.width,viewport.height]);
            pdfPage.drawImage(image,{ x:0,y:0,width:viewport.width,height:viewport.height });
        }
        updateProgress(90,'Finalizing PDF...');
        convertedPdfBytes = await pdfDoc.save();
        updateProgress(100,'Complete!');
        setTimeout(()=>{ 
            progressSection.classList.remove('active'); 
            document.getElementById('resultSection').classList.add('active'); 
            setupDownload(); 
        },500);
    } catch(err){ 
        console.error(err); 
        alert('Error converting PDF: '+err.message); 
        convertBtn.disabled=false; 
        progressSection.classList.remove('active'); 
    }
}

function applyScannedEffect(ctx, w, h) {
    ctx.fillStyle = '#fcfcf5';
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillRect(0, 0, w, h);

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
        imgData.data[i + 3] = 25;
    }
    nCtx.putImageData(imgData, 0, 0);

    ctx.globalAlpha = 0.15;
    ctx.fillStyle = ctx.createPattern(noiseCanvas, 'repeat');
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
}

function setupDownload(){
    const btn=document.getElementById('downloadBtn');
    // Clone to remove old events
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.onclick=()=>{
        const blob=new Blob([convertedPdfBytes],{type:'application/pdf'});
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a');
        a.href=url; a.download=currentFile.name.replace('.pdf','_scanned.pdf'); document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };
}

function resetApp(){
    currentFile=null; convertedPdfBytes=null; fileInput.value=''; settingsSection.classList.remove('active'); document.getElementById('progressSection').classList.remove('active'); document.getElementById('resultSection').classList.remove('active'); convertBtn.disabled=false;
}
