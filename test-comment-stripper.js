#!/usr/bin/env node

/**
 * Test Suite for Comment Stripper
 * 
 * Tests the state machine parsers with tricky edge cases:
 * - Strings with comment-like content
 * - Template literals with nested expressions
 * - Regex literals with character classes
 * - Mixed HTML/CSS/JS content
 * - url() constructs in CSS
 * - Quoted attributes in HTML tags
 */

const CommentStripper = require('./comment-stripper.js');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`✓ ${testName}`);
        testsPassed++;
    } else {
        console.error(`✗ ${testName}`);
        testsFailed++;
    }
}

function assertEqual(actual, expected, testName) {
    if (actual === expected) {
        console.log(`✓ ${testName}`);
        testsPassed++;
    } else {
        console.error(`✗ ${testName}`);
        console.error(`  Expected: ${JSON.stringify(expected)}`);
        console.error(`  Actual:   ${JSON.stringify(actual)}`);
        testsFailed++;
    }
}

console.log('=== Testing JavaScript Parser ===\n');

// Test 1: Basic line comments
{
    const input = `const x = 5; // This is a comment
const y = 10;`;
    const expected = `const x = 5; 
const y = 10;`;
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Remove line comments');
}

// Test 2: Basic block comments
{
    const input = `const x = 5; /* block comment */ const y = 10;`;
    const expected = `const x = 5;  const y = 10;`;
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Remove block comments');
}

// Test 3: Comments inside strings should be preserved
{
    const input = `const str = "// not a comment";
const str2 = '/* also not a comment */';`;
    const expected = `const str = "// not a comment";
const str2 = '/* also not a comment */';`;
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Preserve comment markers in strings');
}

// Test 4: Template literals with comment-like content
{
    const input = 'const tpl = `This is // not a comment`;';
    const expected = 'const tpl = `This is // not a comment`;';
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Preserve comment markers in template literals');
}

// Test 5: Template literals with nested expressions
{
    const input = 'const tpl = `Value: ${x + 5 /* comment */} end`;';
    const expected = 'const tpl = `Value: ${x + 5 } end`;';
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Handle nested expressions in template literals');
}

// Test 6: Regex literals
{
    const input = 'const regex = /\\/\\/ not a comment/;';
    const expected = 'const regex = /\\/\\/ not a comment/;';
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Preserve regex literals with slashes');
}

// Test 7: Regex with character class
{
    const input = 'const regex = /[/\\]]/; // real comment\n';
    const expected = 'const regex = /[/\\]]/; \n';
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Handle regex character classes');
}

// Test 8: Division vs regex context
{
    const input = `const x = 10 / 2; // division
const regex = /test/; // regex
`;
    const expected = `const x = 10 / 2; 
const regex = /test/; 
`;
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Distinguish division from regex');
}

// Test 9: URLs with //
{
    const input = 'const url = "https://example.com";';
    const expected = 'const url = "https://example.com";';
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Preserve URLs in strings');
}

// Test 10: Escaped quotes in strings
{
    const input = 'const str = "He said \\"// comment\\" but it\'s not";';
    const expected = 'const str = "He said \\"// comment\\" but it\'s not";';
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Handle escaped quotes in strings');
}

// Test 11: Multi-line block comment
{
    const input = `const x = 5;
/*
 * Multi-line
 * comment
 */
const y = 10;`;
    const expected = `const x = 5;




const y = 10;`;
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Remove multi-line block comments (preserves line count)');
}

// Test 12: Regex after return
{
    const input = 'return /test/g;';
    const expected = 'return /test/g;';
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Detect regex after return keyword');
}

// Test 13: Complex template literal with nested template
{
    const input = 'const outer = `Outer ${`Inner ${x}`} End`;';
    const expected = 'const outer = `Outer ${`Inner ${x}`} End`;';
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'JS: Handle nested template literals');
}

console.log('\n=== Testing CSS Parser ===\n');

// Test 14: Basic CSS comments
{
    const input = `body { /* comment */ color: red; }`;
    const expected = `body {  color: red; }`;
    const result = CommentStripper.stripCSS(input);
    assertEqual(result, expected, 'CSS: Remove block comments');
}

// Test 15: Comments in strings should be preserved
{
    const input = `content: "/* not a comment */";`;
    const expected = `content: "/* not a comment */";`;
    const result = CommentStripper.stripCSS(input);
    assertEqual(result, expected, 'CSS: Preserve comment markers in strings');
}

// Test 16: url() constructs
{
    const input = `background: url("https://example.com/image.png"); /* comment */`;
    const expected = `background: url("https://example.com/image.png"); `;
    const result = CommentStripper.stripCSS(input);
    assertEqual(result, expected, 'CSS: Handle url() with quoted string');
}

// Test 17: url() without quotes
{
    const input = `background: url(image.png); /* comment */`;
    const expected = `background: url(image.png); `;
    const result = CommentStripper.stripCSS(input);
    assertEqual(result, expected, 'CSS: Handle url() without quotes');
}

// Test 18: Escaped characters in CSS
{
    const input = `content: "\\/* not a comment";`;
    const expected = `content: "\\/* not a comment";`;
    const result = CommentStripper.stripCSS(input);
    assertEqual(result, expected, 'CSS: Handle escaped characters');
}

// Test 19: Multi-line CSS comment
{
    const input = `.class {
    /* Multi-line
       comment */
    color: blue;
}`;
    const expected = `.class {
    

    color: blue;
}`;
    const result = CommentStripper.stripCSS(input);
    assertEqual(result, expected, 'CSS: Remove multi-line comments (preserves line count)');
}

console.log('\n=== Testing HTML Parser ===\n');

// Test 20: Basic HTML comments
{
    const input = `<div>Content</div><!-- comment --><p>More</p>`;
    const expected = `<div>Content</div><p>More</p>`;
    const result = CommentStripper.stripHTML(input);
    assertEqual(result, expected, 'HTML: Remove HTML comments');
}

// Test 21: HTML with inline script
{
    const input = `<script>
const x = 5; // comment
alert(x);
</script>`;
    const expected = `<script>
const x = 5; 
alert(x);
</script>`;
    const result = CommentStripper.stripHTML(input);
    assertEqual(result, expected, 'HTML: Process inline scripts');
}

// Test 22: HTML with inline style
{
    const input = `<style>
body { color: red; /* comment */ }
</style>`;
    const expected = `<style>
body { color: red;  }
</style>`;
    const result = CommentStripper.stripHTML(input);
    assertEqual(result, expected, 'HTML: Process inline styles');
}

// Test 23: Script tag with attributes
{
    const input = `<script type="text/javascript" src="test.js">
// comment
const x = 5;
</script>`;
    const expected = `<script type="text/javascript" src="test.js">

const x = 5;
</script>`;
    const result = CommentStripper.stripHTML(input);
    assertEqual(result, expected, 'HTML: Handle script tags with attributes');
}

// Test 24: Style tag with media query
{
    const input = `<style media="screen">
@media (max-width: 600px) {
    body { font-size: 14px; } /* comment */
}
</style>`;
    const expected = `<style media="screen">
@media (max-width: 600px) {
    body { font-size: 14px; } 
}
</style>`;
    const result = CommentStripper.stripHTML(input);
    assertEqual(result, expected, 'HTML: Handle style tags with attributes');
}

// Test 25: Preserve case and whitespace
{
    const input = `<DIV>Content</DIV>  <!-- Comment -->  <P>Text</P>`;
    const expected = `<DIV>Content</DIV>    <P>Text</P>`;
    const result = CommentStripper.stripHTML(input);
    assertEqual(result, expected, 'HTML: Preserve original casing and whitespace');
}

// Test 26: Mixed content
{
    const input = `<!DOCTYPE html>
<html>
<head>
    <!-- Header comment -->
    <style>
        /* CSS comment */
        body { color: red; }
    </style>
    <script>
        // JS comment
        const x = 5;
    </script>
</head>
<body>
    <div>Content</div>
    <!-- Body comment -->
</body>
</html>`;
    const expected = `<!DOCTYPE html>
<html>
<head>
    
    <style>
        
        body { color: red; }
    </style>
    <script>
        
        const x = 5;
    </script>
</head>
<body>
    <div>Content</div>
    
</body>
</html>`;
    const result = CommentStripper.stripHTML(input);
    assertEqual(result, expected, 'HTML: Handle full HTML document with mixed content');
}

console.log('\n=== Testing Auto-Detection ===\n');

// Test 27: Auto-detect HTML
{
    const input = `<html><!-- comment --><body></body></html>`;
    const expected = `<html><body></body></html>`;
    const result = CommentStripper.strip(input, 'auto');
    assertEqual(result, expected, 'Auto: Detect HTML content');
}

// Test 28: Auto-detect CSS
{
    const input = `body { color: red; /* comment */ }`;
    const expected = `body { color: red;  }`;
    const result = CommentStripper.strip(input, 'auto');
    assertEqual(result, expected, 'Auto: Detect CSS content');
}

// Test 29: Auto-detect JavaScript
{
    const input = `const x = 5; // comment\n`;
    const expected = `const x = 5; \n`;
    const result = CommentStripper.strip(input, 'auto');
    assertEqual(result, expected, 'Auto: Detect JavaScript content');
}

console.log('\n=== Edge Cases ===\n');

// Test 30: Empty string
{
    const input = '';
    const expected = '';
    const result = CommentStripper.strip(input, 'auto');
    assertEqual(result, expected, 'Edge: Handle empty string');
}

// Test 31: Only comments
{
    const input = '// Just a comment\n/* Another comment */';
    const expected = '\n';
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'Edge: Handle code with only comments');
}

// Test 32: Unclosed comment (should handle gracefully)
{
    const input = 'const x = 5; /* unclosed comment';
    const result = CommentStripper.stripJavaScript(input);
    assert(result.includes('const x = 5;'), 'Edge: Handle unclosed comments gracefully');
}

// Test 33: Comment-like content in attributes
{
    const input = '<div title="<!-- not a comment -->">Content</div>';
    const expected = '<div title="<!-- not a comment -->">Content</div>';
    const result = CommentStripper.stripHTML(input);
    assertEqual(result, expected, 'Edge: Preserve comment-like content in attributes');
}

// Test 34: Complex regex with groups and lookaheads
{
    const input = 'const regex = /(?:https?:\\/\\/)?[a-z]+/gi; // URL pattern\n';
    const expected = 'const regex = /(?:https?:\\/\\/)?[a-z]+/gi; \n';
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'Edge: Handle complex regex patterns');
}

// Test 35: Tagged template literals
{
    const input = 'const str = html`<div>${content}</div>`; // tagged template\n';
    const expected = 'const str = html`<div>${content}</div>`; \n';
    const result = CommentStripper.stripJavaScript(input);
    assertEqual(result, expected, 'Edge: Handle tagged template literals');
}

console.log('\n=== Summary ===\n');
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);

if (testsFailed > 0) {
    process.exit(1);
} else {
    console.log('\n✓ All tests passed!');
    process.exit(0);
}
