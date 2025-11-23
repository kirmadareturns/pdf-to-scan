#!/usr/bin/env node

/**
 * Comment Stripper - Usage Examples
 * 
 * This file demonstrates how to use the comment-stripper module
 * in various scenarios.
 */

const CommentStripper = require('./comment-stripper.js');

console.log('=== Comment Stripper Usage Examples ===\n');

// Example 1: JavaScript with comments
console.log('1. JavaScript Code:');
const jsCode = `
const API_URL = "https://api.example.com"; // API endpoint
const regex = /\\/\\//; // Regex with slashes

function greet(name) {
    /* This function greets the user
       with a personalized message */
    const message = \`Hello, \${name}!\`;
    return message;
}

// Initialize the app
greet("World");
`;

const cleanedJS = CommentStripper.strip(jsCode, 'javascript');
console.log('Input:', jsCode);
console.log('Output:', cleanedJS);
console.log('---\n');

// Example 2: CSS with comments
console.log('2. CSS Code:');
const cssCode = `
/* Main styles */
body {
    background: url("https://example.com/bg.png");
    color: #333; /* Dark text */
}

/* Responsive design */
@media (max-width: 768px) {
    body {
        font-size: 14px; /* Smaller on mobile */
    }
}
`;

const cleanedCSS = CommentStripper.strip(cssCode, 'css');
console.log('Input:', cssCode);
console.log('Output:', cleanedCSS);
console.log('---\n');

// Example 3: HTML with embedded scripts and styles
console.log('3. HTML Document:');
const htmlCode = `
<!DOCTYPE html>
<html>
<head>
    <!-- Meta tags -->
    <title>My Page</title>
    <style>
        /* CSS comment */
        body { margin: 0; }
    </style>
    <script>
        // JS comment
        console.log("Hello");
    </script>
</head>
<body>
    <div title="<!-- Not removed -->">Content</div>
    <!-- Footer comment -->
</body>
</html>
`;

const cleanedHTML = CommentStripper.strip(htmlCode, 'html');
console.log('Input:', htmlCode);
console.log('Output:', cleanedHTML);
console.log('---\n');

// Example 4: Auto-detection
console.log('4. Auto-Detection:');
const unknownCode = `const x = 5; // comment`;
const cleanedAuto = CommentStripper.strip(unknownCode, 'auto');
console.log('Input:', unknownCode);
console.log('Output:', cleanedAuto);
console.log('Detected as: JavaScript\n');
console.log('---\n');

// Example 5: Tricky cases
console.log('5. Tricky Edge Cases:');

// Template literals with nested expressions
const trickCase1 = `const tpl = \`Price: \${price /* tax */ * 1.1}\`;`;
console.log('Template with comment in expression:');
console.log('Input: ', trickCase1);
console.log('Output:', CommentStripper.stripJavaScript(trickCase1));

// Regex with character class
const trickCase2 = `const regex = /[/\\]]/; // char class`;
console.log('\nRegex with character class:');
console.log('Input: ', trickCase2);
console.log('Output:', CommentStripper.stripJavaScript(trickCase2));

// CSS url with comment-like content
const trickCase3 = `background: url("//cdn.example.com/image.png"); /* comment */`;
console.log('\nCSS url() with // in URL:');
console.log('Input: ', trickCase3);
console.log('Output:', CommentStripper.stripCSS(trickCase3));

console.log('\n=== All Examples Completed ===');
