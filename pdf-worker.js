// pdf-worker.js

// Import PDF.js (from CDN)
importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');

self.onmessage = async function(e) {
    const { arrayBuffer, pageIndex } = e.data;

    try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(pageIndex);

        const viewport = page.getViewport({ scale: 2 }); // You can adjust scale for quality
        const canvas = new OffscreenCanvas(viewport.width, viewport.height);
        const ctx = canvas.getContext('2d');

        // Optional: white background for PDF page
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, viewport.width, viewport.height);

        await page.render({ canvasContext: ctx, viewport }).promise;

        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
        const reader = new FileReader();

        reader.onloadend = function() {
            const dataURL = reader.result;
            // Send back to main thread
            self.postMessage({ dataURL, pageIndex });
        };
        reader.readAsDataURL(blob);

    } catch (err) {
        console.error('Worker error processing page', pageIndex, err);
        // Send error back so main thread can handle
        self.postMessage({ error: err.message, pageIndex });
    }
};
