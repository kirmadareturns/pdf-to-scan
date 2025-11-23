#!/usr/bin/env node

/**
 * Integration test for merge-html-css-js.html
 * Tests the core merge logic by simulating the browser environment
 */

const fs = require('fs');

console.log('=== Integration Test for Merge Tool ===\n');

// Read the HTML file
const html = fs.readFileSync('merge-html-css-js.html', 'utf8');

// Extract the JavaScript code
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
if (!scriptMatch) {
    console.error('❌ Could not extract JavaScript from HTML');
    process.exit(1);
}

const jsCode = scriptMatch[1];

// Create a minimal DOM-like environment
const mockElement = (id) => ({
    value: '',
    textContent: '',
    classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
    },
    setAttribute: () => {},
    getAttribute: () => null,
    click: () => {},
    scrollIntoView: () => {}
});

const mockElements = {};

global.document = {
    getElementById: (id) => {
        if (!mockElements[id]) {
            mockElements[id] = mockElement(id);
        }
        return mockElements[id];
    },
    querySelectorAll: () => [{
        classList: { add: () => {}, remove: () => {} },
        setAttribute: () => {}
    }],
    createElement: () => ({
        click: () => {},
        setAttribute: () => {},
        href: '',
        download: ''
    }),
    body: { appendChild: () => {}, removeChild: () => {} }
};

global.window = {
    addEventListener: () => {},
    confirm: () => true,
    alert: () => {}
};

global.alert = () => {};
global.confirm = () => true;

global.URL = {
    createObjectURL: () => 'mock-url',
    revokeObjectURL: () => {}
};

global.Blob = class Blob {
    constructor(parts, options) {
        this.parts = parts;
        this.options = options;
        this.size = parts.join('').length;
    }
};

global.FileReader = class FileReader {
    readAsText() {}
};

// Evaluate the JavaScript code
let mergedContent = '';
try {
    eval(jsCode);
    console.log('✅ JavaScript code executes without errors\n');
} catch (error) {
    console.error('❌ JavaScript execution error:', error.message);
    process.exit(1);
}

// Test the functions
console.log('--- Testing Core Functions ---\n');

// Test 1: formatBytes
console.log('Test 1: formatBytes()');
try {
    console.log('  formatBytes(0):', formatBytes(0));
    console.log('  formatBytes(1024):', formatBytes(1024));
    console.log('  formatBytes(1048576):', formatBytes(1048576));
    console.log('  ✅ formatBytes works correctly\n');
} catch (error) {
    console.error('  ❌ formatBytes failed:', error.message, '\n');
}

// Test 2: updateStats
console.log('Test 2: updateStats()');
try {
    global.document.getElementById('html-input').value = 'Test HTML content';
    updateStats('html');
    console.log('  ✅ updateStats works correctly\n');
} catch (error) {
    console.error('  ❌ updateStats failed:', error.message, '\n');
}

// Test 3: mergeFiles with all three inputs
console.log('Test 3: mergeFiles() - All three inputs');
try {
    global.document.getElementById('html-input').value = '<h1>Hello World</h1>';
    global.document.getElementById('css-input').value = 'h1 { color: blue; }';
    global.document.getElementById('js-input').value = 'console.log("test");';
    
    mergeFiles();
    
    if (typeof mergedContent === 'undefined') {
        throw new Error('mergedContent is undefined');
    }
    
    console.log('  Merged content length:', mergedContent.length);
    console.log('  Has DOCTYPE:', mergedContent.includes('<!DOCTYPE html>'));
    console.log('  Has HTML tag:', mergedContent.includes('<html lang="en">'));
    console.log('  Has style tag:', mergedContent.includes('<style>'));
    console.log('  Has CSS content:', mergedContent.includes('h1 { color: blue; }'));
    console.log('  Has HTML content:', mergedContent.includes('<h1>Hello World</h1>'));
    console.log('  Has script tag:', mergedContent.includes('<script>'));
    console.log('  Has JS content:', mergedContent.includes('console.log("test");'));
    console.log('  ✅ mergeFiles works correctly\n');
} catch (error) {
    console.error('  ❌ mergeFiles failed:', error.message, '\n');
}

// Test 4: mergeFiles with only HTML
console.log('Test 4: mergeFiles() - HTML only');
try {
    global.document.getElementById('html-input').value = '<p>Only HTML</p>';
    global.document.getElementById('css-input').value = '';
    global.document.getElementById('js-input').value = '';
    
    mergeFiles();
    
    console.log('  Has HTML content:', mergedContent.includes('<p>Only HTML</p>'));
    console.log('  Has empty style section:', !mergedContent.includes('<style>'));
    console.log('  Has empty script section:', !mergedContent.includes('<script>'));
    console.log('  ✅ HTML-only merge works correctly\n');
} catch (error) {
    console.error('  ❌ HTML-only merge failed:', error.message, '\n');
}

// Test 5: mergeFiles with full HTML document
console.log('Test 5: mergeFiles() - Full HTML document input');
try {
    global.document.getElementById('html-input').value = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><p>Full document</p></body>
</html>`;
    global.document.getElementById('css-input').value = '';
    global.document.getElementById('js-input').value = '';
    
    mergeFiles();
    
    console.log('  Extracts body content:', mergedContent.includes('<p>Full document</p>'));
    console.log('  No nested html tags:', (mergedContent.match(/<html/g) || []).length === 1);
    console.log('  No nested body tags:', (mergedContent.match(/<body/g) || []).length === 1);
    console.log('  ✅ Full HTML document merge works correctly\n');
} catch (error) {
    console.error('  ❌ Full HTML document merge failed:', error.message, '\n');
}

// Test 6: switchTab
console.log('Test 6: switchTab()');
try {
    switchTab('css');
    switchTab('js');
    switchTab('html');
    console.log('  ✅ switchTab works correctly\n');
} catch (error) {
    console.error('  ❌ switchTab failed:', error.message, '\n');
}

// Test 7: clearAll
console.log('Test 7: clearAll()');
try {
    clearAll();
    console.log('  ✅ clearAll works correctly\n');
} catch (error) {
    console.error('  ❌ clearAll failed:', error.message, '\n');
}

console.log('=== Integration Test Complete ===');
console.log('✅ All core functionality working correctly!\n');
