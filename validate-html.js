#!/usr/bin/env node

const fs = require('fs');

console.log('Validating pdf-compressor.html...\n');

const html = fs.readFileSync('pdf-compressor.html', 'utf8');

const errors = [];
const warnings = [];

// Check basic HTML structure
if (!html.includes('<!DOCTYPE html>')) {
    errors.push('Missing DOCTYPE declaration');
}

if (!html.includes('<html lang="en">')) {
    errors.push('Missing or invalid <html> tag with lang attribute');
}

if (!html.includes('</html>')) {
    errors.push('Missing closing </html> tag');
}

// Check head section
if (!html.includes('<head>')) {
    errors.push('Missing <head> tag');
}

if (!html.includes('</head>')) {
    errors.push('Missing </head> tag');
}

if (!html.includes('<meta charset="UTF-8">')) {
    errors.push('Missing charset meta tag');
}

if (!html.includes('viewport')) {
    errors.push('Missing viewport meta tag');
}

// Check body section
if (!html.includes('<body>')) {
    errors.push('Missing <body> tag');
}

if (!html.includes('</body>')) {
    errors.push('Missing </body> tag');
}

// Check for semantic HTML
if (!html.includes('<header>')) {
    warnings.push('Missing <header> tag (recommended)');
}

if (!html.includes('<main>')) {
    warnings.push('Missing <main> tag (recommended)');
}

// Check for required scripts
if (!html.includes('qpdf-wasm')) {
    errors.push('Missing qpdf-wasm script');
}

if (!html.includes('jszip')) {
    errors.push('Missing JSZip script');
}

// Check for balanced tags
const openTags = (html.match(/<div/g) || []).length;
const closeTags = (html.match(/<\/div>/g) || []).length;
if (openTags !== closeTags) {
    errors.push(`Unbalanced <div> tags: ${openTags} open, ${closeTags} close`);
}

// Check file size
const sizeKB = (html.length / 1024).toFixed(1);
console.log(`File size: ${sizeKB} KB`);
console.log(`Lines: ${html.split('\n').length}`);
console.log();

// Report results
if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ HTML is valid! No errors or warnings.\n');
    process.exit(0);
} else {
    if (errors.length > 0) {
        console.log('❌ ERRORS:');
        errors.forEach(err => console.log(`  - ${err}`));
        console.log();
    }
    
    if (warnings.length > 0) {
        console.log('⚠️  WARNINGS:');
        warnings.forEach(warn => console.log(`  - ${warn}`));
        console.log();
    }
    
    if (errors.length > 0) {
        process.exit(1);
    } else {
        console.log('✅ HTML is valid (with warnings)\n');
        process.exit(0);
    }
}
