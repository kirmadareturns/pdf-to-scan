#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Testing Dual-Interface PDF-to-Scan Tool...\n');

const filePath = path.join(__dirname, 'pdf-to-scan.html');
const content = fs.readFileSync(filePath, 'utf-8');

let passCount = 0;
let failCount = 0;

function test(name, condition, details = '') {
    if (condition) {
        console.log(`✓ ${name}`);
        passCount++;
    } else {
        console.log(`✗ ${name}`);
        if (details) console.log(`  ${details}`);
        failCount++;
    }
}

// Structure Tests
test('File exists and is readable', content.length > 0);
test('Valid HTML5 DOCTYPE', content.includes('<!DOCTYPE html>'));
test('HTML lang attribute present', content.includes('<html lang="en">'));

// Meta Tags & SEO
test('Open Graph meta tags present', content.includes('og:title') && content.includes('og:description'));
test('Twitter Card meta tags present', content.includes('twitter:card') && content.includes('twitter:title'));
test('Canonical link present', content.includes('<link rel="canonical"'));
test('Robots meta tag present', content.includes('<meta name="robots"'));

// JSON-LD Schemas
test('WebApplication schema present', content.includes('"@type": "WebApplication"'));
test('FAQPage schema present', content.includes('"@type": "FAQPage"'));
test('Schema context correct', content.includes('"@context": "https://schema.org"'));

// Mode Toggle
test('Toggle switch present', content.includes('id="modeToggle"'));
test('Navbar present', content.includes('<nav class="navbar">'));
test('Mode toggle container present', content.includes('mode-toggle-container'));
test('Toggle has accessibility attributes', content.includes('role="switch"') && content.includes('aria-checked'));

// CSS Mode Visibility Controls
test('Mode visibility CSS rules present', 
    content.includes('body.mode-human .machine-view') && 
    content.includes('body.mode-machine .human-view'));
test('Human view CSS present', content.includes('.human-view'));
test('Machine view CSS present', content.includes('.machine-view'));
test('Terminal aesthetic CSS present', content.includes('--terminal-bg') && content.includes('--terminal-green'));

// Human View Structure
test('Human view container present', content.includes('class="container human-view'));
test('Human view hero section', content.includes('<div class="hero">'));
test('Human view tool card', content.includes('<div class="tool-card">'));

// Human View Required IDs (preserved from original)
const requiredIds = [
    'fileInput', 'uploadSection', 'settingsSection', 'scanOverlay',
    'fileInfo', 'tilt', 'noise', 'blur', 'bwCheck', 'contrastCheck', 
    'borderCheck', 'previewBtn', 'convertBtn', 'progressSection',
    'progressFill', 'statusText', 'resultSection', 'downloadBtn',
    'previewArea', 'previewCanvas'
];

requiredIds.forEach(id => {
    test(`Required ID present: ${id}`, content.includes(`id="${id}"`));
});

// Machine View Structure
test('Machine view container present', content.includes('class="machine-view'));
test('Machine header present', content.includes('class="machine-header">'));
test('Machine tool card present', content.includes('class="machine-tool-card"'));

// Machine View Duplicate IDs (with Machine suffix)
const machineIds = [
    'scanOverlayMachine', 'uploadSectionMachine', 'settingsSectionMachine',
    'fileInfoMachine', 'tiltMachine', 'noiseMachine', 'blurMachine',
    'bwCheckMachine', 'contrastCheckMachine', 'borderCheckMachine',
    'previewBtnMachine', 'convertBtnMachine', 'progressSectionMachine',
    'progressFillMachine', 'statusTextMachine', 'resultSectionMachine',
    'downloadBtnMachine', 'previewAreaMachine', 'previewCanvasMachine'
];

machineIds.forEach(id => {
    test(`Machine ID present: ${id}`, content.includes(`id="${id}"`));
});

// Machine View Semantic HTML
test('Machine specs table present', content.includes('class="specs-table"'));
test('Machine FAQ definition list present', content.includes('class="faq-machine"'));
test('Machine section present', content.includes('class="machine-section"'));
test('Semantic <data> tags used', content.includes('<data value='));
test('Definition list <dl> present', content.includes('<dl class="faq-machine">'));
test('Definition terms <dt> present', content.includes('<dt>'));
test('Definition descriptions <dd> present', content.includes('<dd>'));

// Machine View Content Sections
test('Technical specifications section', content.includes('TECHNICAL_SPECIFICATIONS'));
test('FAQ database section', content.includes('FAQ_DATABASE'));
test('Feature matrix section', content.includes('FEATURE_MATRIX'));
test('API reference section', content.includes('API_REFERENCE'));
test('System metadata section', content.includes('SYSTEM_METADATA'));

// JavaScript Functionality
test('Mode toggle function present', content.includes('function toggleMode()'));
test('Initialize mode function present', content.includes('function initializeModeToggle()'));
test('Set mode function present', content.includes('function setMode('));
test('Update document title function', content.includes('function updateDocumentTitle('));
test('localStorage mode persistence', content.includes("localStorage.getItem('pdfToolMode')"));
test('Handle file function present', content.includes('function handleFile('));
test('Get current settings function', content.includes('function getCurrentSettings()'));
test('Apply scan effect function present', content.includes('async function applyScanEffectVisual('));
test('Perform conversion function present', content.includes('async function performConversion('));

// Event Listeners
test('DOMContentLoaded listener', content.includes("window.addEventListener('DOMContentLoaded'"));
test('Drag and drop events', content.includes("addEventListener('dragover'") && content.includes("addEventListener('drop'"));
test('File input change listener', content.includes("fileInput.addEventListener('change'"));

// Accessibility
test('ARIA labels present', content.includes('aria-label'));
test('ARIA roles present', content.includes('role='));
test('ARIA live regions', content.includes('aria-live'));
test('Focus visible styles', content.includes(':focus-visible'));
test('Min touch target sizes (44px)', content.includes('min-height: 44px'));

// Responsive Design
test('Media queries present', content.includes('@media (max-width: 768px)'));
test('Mobile breakpoint (480px)', content.includes('@media (max-width: 480px)'));
test('Dark mode support', content.includes('@media (prefers-color-scheme: dark)'));
test('Reduced motion support', content.includes('@media (prefers-reduced-motion: reduce)'));

// Performance
test('Defer attribute on scripts', content.includes('defer'));
test('Performance marks', content.includes("performance.mark("));
test('Performance measure', content.includes("performance.measure("));

// Libraries
test('PDF.js library loaded', content.includes('pdf.js'));
test('PDF-Lib library loaded', content.includes('pdf-lib'));
test('Worker source configured', content.includes('GlobalWorkerOptions.workerSrc'));

// Color Theme
test('CSS custom properties defined', content.includes(':root {') && content.includes('--primary'));
test('Terminal colors defined', content.includes('--terminal-bg') && content.includes('--terminal-green'));

// Core Functionality Preserved
test('PDF processing logic intact', content.includes('pdfjsLib.getDocument'));
test('Canvas manipulation present', content.includes('getContext(\'2d\')'));
test('Image bitmap creation', content.includes('createImageBitmap'));
test('JPEG export', content.includes('toDataURL(\'image/jpeg\''));
test('PDF creation with PDF-Lib', content.includes('PDFLib.PDFDocument.create()'));

console.log(`\n${'='.repeat(50)}`);
console.log(`Tests Passed: ${passCount}`);
console.log(`Tests Failed: ${failCount}`);
console.log(`Total Tests: ${passCount + failCount}`);
console.log(`${'='.repeat(50)}`);

if (failCount === 0) {
    console.log('\n✓ All tests passed! Dual-interface implementation complete.');
    process.exit(0);
} else {
    console.log(`\n✗ ${failCount} test(s) failed. Review the implementation.`);
    process.exit(1);
}
