importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');

self.onmessage = async (e) => {
    const { arrayBuffer, pageIndex } = e.data;
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(pageIndex);

    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = new OffscreenCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d', { alpha: false });

    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });

    const reader = new FileReader();
    reader.onloadend = () => {
        self.postMessage({ dataURL: reader.result, pageIndex });
    };
    reader.readAsDataURL(blob);
};
