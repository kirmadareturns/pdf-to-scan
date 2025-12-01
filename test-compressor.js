const fs = require('fs');

console.log('Testing pdf-compressor.html...\n');

const html = fs.readFileSync('pdf-compressor.html', 'utf8');

const checks = [
    { name: 'File size', test: () => (html.length / 1024).toFixed(1) + ' KB' },
    { name: 'Has DOCTYPE', test: () => html.includes('<!DOCTYPE html') },
    { name: 'Has QPDF script', test: () => html.includes('qpdf-wasm') },
    { name: 'Has JSZip script', test: () => html.includes('jszip') },
    { name: 'Has compress function', test: () => html.includes('compressPDF') },
    { name: 'Has upload zone', test: () => html.includes('uploadZone') },
    { name: 'Has drag-drop support', test: () => html.includes('dragover') },
    { name: 'Has paste support', test: () => html.includes('paste') },
    { name: 'Has metadata removal option', test: () => html.includes('optRemoveMetadata') },
    { name: 'Has annotation removal option', test: () => html.includes('optRemoveAnnotations') },
    { name: 'Has max compression option', test: () => html.includes('optMaxCompression') },
    { name: 'Has object streams option', test: () => html.includes('optObjectStreams') },
    { name: 'Has progress bar', test: () => html.includes('progressFill') },
    { name: 'Has results section', test: () => html.includes('resultsSection') },
    { name: 'Has stats display', test: () => html.includes('statOriginal') },
    { name: 'Has techniques list', test: () => html.includes('techniquesList') },
    { name: 'Has reset functionality', test: () => html.includes('resetTool') },
    { name: 'Has error handling', test: () => html.includes('showError') },
    { name: 'Has accessibility (aria)', test: () => html.includes('aria-label') },
    { name: 'Has responsive design', test: () => html.includes('@media') },
    { name: 'Uses primary color', test: () => html.includes('--primary: #A50113') },
    { name: 'Has schema.org markup', test: () => html.includes('schema.org') },
    { name: 'Has meta description', test: () => html.includes('meta name="description"') },
    { name: 'QPDF compression flags', test: () => html.includes('--compress-streams') },
    { name: 'QPDF linearization', test: () => html.includes('--linearize') },
    { name: 'QPDF object streams', test: () => html.includes('--object-streams') },
    { name: 'Batch processing (multiple files)', test: () => html.includes('multiple') },
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
    try {
        const result = check.test();
        if (result === true || (typeof result === 'string' && result.length > 0)) {
            console.log(`✓ ${check.name}: ${result === true ? 'YES' : result}`);
            passed++;
        } else {
            console.log(`✗ ${check.name}: FAILED`);
            failed++;
        }
    } catch (error) {
        console.log(`✗ ${check.name}: ERROR - ${error.message}`);
        failed++;
    }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Total Checks: ${checks.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`${'='.repeat(50)}`);

if (failed === 0) {
    console.log('\n✓ ALL CHECKS PASSED - pdf-compressor.html is ready!\n');
    process.exit(0);
} else {
    console.log('\n✗ Some checks failed. Review implementation.\n');
    process.exit(1);
}
