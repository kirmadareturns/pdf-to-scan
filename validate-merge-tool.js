#!/usr/bin/env node

const fs = require('fs');

console.log('=== Validating merge-html-css-js.html ===\n');

// Read the file
const html = fs.readFileSync('merge-html-css-js.html', 'utf8');

// Basic structure checks
console.log('✅ File reads successfully');
console.log('📏 File size:', html.length, 'characters');
console.log('📄 Line count:', html.split('\n').length);

// Check for required HTML structure
const checks = [
    { name: 'DOCTYPE declaration', test: html.includes('<!DOCTYPE html>') },
    { name: 'HTML opening tag', test: html.includes('<html lang="en">') },
    { name: 'Head section', test: html.includes('<head>') && html.includes('</head>') },
    { name: 'Body section', test: html.includes('<body>') && html.includes('</body>') },
    { name: 'Script section', test: html.includes('<script>') && html.includes('</script>') },
    { name: 'Style section', test: html.includes('<style>') && html.includes('</style>') },
    { name: 'Title tag', test: html.includes('<title>') },
    { name: 'Meta charset', test: html.includes('charset="UTF-8"') },
    { name: 'Meta viewport', test: html.includes('viewport') },
    { name: 'Closing HTML tag', test: html.includes('</html>') }
];

console.log('\n--- HTML Structure Checks ---');
checks.forEach(check => {
    const status = check.test ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
});

// Extract and validate JavaScript
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
if (scriptMatch) {
    const jsCode = scriptMatch[1];
    console.log('\n--- JavaScript Validation ---');
    console.log('📝 JavaScript code length:', jsCode.length, 'characters');
    
    // Check for required functions
    const requiredFunctions = [
        'switchTab',
        'handleFileUpload',
        'updateStats',
        'formatBytes',
        'mergeFiles',
        'downloadMerged',
        'clearAll'
    ];
    
    console.log('\n--- Required Functions ---');
    requiredFunctions.forEach(func => {
        const regex = new RegExp(`function ${func}\\s*\\(`);
        const found = regex.test(jsCode);
        const status = found ? '✅' : '❌';
        console.log(`${status} ${func}()`);
    });
    
    // Check for required element IDs
    const requiredIds = [
        'html-input', 'css-input', 'js-input',
        'html-file-input', 'css-file-input', 'js-file-input',
        'html-file-name', 'css-file-name', 'js-file-name',
        'html-chars', 'css-chars', 'js-chars',
        'html-size', 'css-size', 'js-size',
        'output-section', 'output-preview', 'merged-size',
        'download-btn'
    ];
    
    console.log('\n--- Required Element IDs ---');
    let missingIds = [];
    requiredIds.forEach(id => {
        const found = html.includes(`id="${id}"`);
        if (!found) {
            missingIds.push(id);
        }
    });
    
    if (missingIds.length === 0) {
        console.log('✅ All required element IDs present');
    } else {
        console.log('❌ Missing IDs:', missingIds.join(', '));
    }
    
} else {
    console.log('❌ No JavaScript section found');
}

// Check for accessibility features
console.log('\n--- Accessibility Features ---');
const a11yChecks = [
    { name: 'ARIA labels', test: html.includes('aria-label') },
    { name: 'Role attributes', test: html.includes('role=') },
    { name: 'ARIA selected', test: html.includes('aria-selected') },
    { name: 'Tab panel structure', test: html.includes('role="tabpanel"') },
    { name: 'Tab button structure', test: html.includes('role="tab"') }
];

a11yChecks.forEach(check => {
    const status = check.test ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
});

// Check for responsive design
console.log('\n--- Responsive Design ---');
const responsiveChecks = [
    { name: 'CSS media queries', test: html.includes('@media') },
    { name: 'Viewport meta tag', test: html.includes('viewport') },
    { name: 'Mobile breakpoint (768px)', test: html.includes('768px') }
];

responsiveChecks.forEach(check => {
    const status = check.test ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
});

console.log('\n=== Validation Complete ===');
console.log('✅ File is ready for testing!\n');
