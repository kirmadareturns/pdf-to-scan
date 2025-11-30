async function startProcessing() {
    if (State.isProcessing || State.files.length === 0) return;
    State.isProcessing = true;
    DOM.dropzone.classList.add('scanning');

    await waitForLibraries();
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const { jsPDF } = window.jspdf;

    const maxWorkers = navigator.hardwareConcurrency || 4;

    const createProgressUpdater = () => {
        let lastUpdate = 0;
        return text => {
            const now = Date.now();
            if (now - lastUpdate > 100) {
                DOM.progressText.innerText = text;
                lastUpdate = now;
            }
        };
    };

    // Process PDFs sequentially to save memory
    for (const file of State.files) {
        await processSinglePDF(file, jsPDF, maxWorkers, createProgressUpdater());
    }

    // Clean up
    State.files = [];
    renderFileList();
    DOM.dropzone.classList.remove('scanning');
    State.isProcessing = false;
}
