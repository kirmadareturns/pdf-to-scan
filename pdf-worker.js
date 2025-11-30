importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');

self.onmessage = async function (e) {
    const { arrayBuffer, pageIndex } = e.data;

    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(pageIndex);

    const viewport = page.getViewport({ scale: 1.0 });
    const offscreen = new OffscreenCanvas(viewport.width, viewport.height);
    const ctx = offscreen.getContext('2d', { alpha: false });

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await offscreen.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
    self.postMessage({ blob, pageIndex });
};
