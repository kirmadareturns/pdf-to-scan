# Comment Stripper - State Machine Parser Engine

A robust, state-machine-based comment stripping library for HTML, CSS, and JavaScript that works in both browser and Node.js environments.

## Features

- **State Machine Parsers**: Character-by-character parsing with explicit state tracking (no regex replacements for comment detection)
- **Smart Context Detection**: Preserves comment-like syntax in strings, template literals, regex patterns, and URLs
- **Multi-Language Support**: HTML, CSS, JavaScript with auto-detection
- **Universal Compatibility**: Works in browsers (via `window.CommentStripper`) and Node.js (via CommonJS `require`)
- **Edge Case Handling**: Properly handles:
  - Template literals with nested `${}` expressions
  - Regex literals with character classes `[...]`
  - CSS `url(...)` constructs  
  - HTML tag attributes with quoted values
  - Escape sequences in all contexts
  - Multi-line comments while preserving line count

## Installation

### Browser

```html
<script src="comment-stripper.js"></script>
<script>
  const cleaned = window.CommentStripper.strip(code, 'javascript');
</script>
```

### Node.js

```javascript
const CommentStripper = require('./comment-stripper.js');
const cleaned = CommentStripper.strip(code, 'auto');
```

## API

### Main Function

```javascript
CommentStripper.strip(code, mode)
```

**Parameters:**
- `code` (string): The source code to process
- `mode` (string): Parser mode - `'html'`, `'css'`, `'javascript'` (or `'js'`), or `'auto'`

**Returns:** String with comments removed

**Example:**

```javascript
const jsCode = `
const x = 5; // This is a comment
const url = "https://example.com"; // URLs are preserved
`;

const cleaned = CommentStripper.strip(jsCode, 'javascript');
// Result:
// const x = 5;
// const url = "https://example.com";
```

### Individual Parsers

```javascript
CommentStripper.stripHTML(code)       // HTML only
CommentStripper.stripCSS(code)        // CSS only
CommentStripper.stripJavaScript(code) // JavaScript only
CommentStripper.stripAuto(code)       // Auto-detect
```

## Parser Details

### JavaScript Parser

**State Machine States:**
- `NORMAL`: Default code state
- `SINGLE_QUOTE`: Inside `'...'` string
- `DOUBLE_QUOTE`: Inside `"..."` string
- `TEMPLATE_LITERAL`: Inside `` `...` `` template
- `TEMPLATE_EXPRESSION`: Inside `${...}` within template
- `LINE_COMMENT`: Inside `//` comment (stripped)
- `BLOCK_COMMENT`: Inside `/* */` comment (stripped)
- `REGEX_LITERAL`: Inside `/pattern/` regex
- `REGEX_CHAR_CLASS`: Inside `[...]` within regex

**Features:**
- Heuristic-based regex detection (after keywords like `return`, `throw`, operators like `=`, `(`, etc.)
- Nested template literal support
- Proper escape sequence handling (`\"`, `\'`, `` \` ``, `\/`, etc.)
- Comment removal within template expressions
- Regex flag preservation (`/pattern/gimsuvy`)

**Example:**

```javascript
const code = `
const regex = /https?:\\/\\//gi; // URL regex
const str = "// not a comment";
const tpl = \`Value: \${x /* comment */ + 5}\`;
`;

CommentStripper.stripJavaScript(code);
// Preserves regex, string content, removes actual comments
```

### CSS Parser

**State Machine States:**
- `NORMAL`: Default CSS state
- `SINGLE_QUOTE`: Inside `'...'` string
- `DOUBLE_QUOTE`: Inside `"..."` string
- `URL`: Inside `url(...)` construct
- `COMMENT`: Inside `/* */` comment (stripped)

**Features:**
- Handles `url("...")`, `url('...')`, and `url(...)` (unquoted)
- Preserves comment-like content in strings and URLs
- Escape sequence support
- Line structure preservation (newlines maintained)

**Example:**

```javascript
const css = `
body {
  background: url("https://example.com/bg.png"); /* comment */
  content: "/* not a comment */";
}
`;

CommentStripper.stripCSS(css);
// Removes comment, preserves URL and string content
```

### HTML Parser

**State Machine States:**
- `NORMAL`: Default HTML state
- `COMMENT`: Inside `<!-- -->` comment (stripped)
- `TAG_OPEN`: Inside `< tag >`
- `SCRIPT`: Inside `<script>` tag (delegates to JS parser)
- `STYLE`: Inside `<style>` tag (delegates to CSS parser)

**Features:**
- Delegates embedded CSS/JS to respective parsers
- Preserves original casing and whitespace
- Handles quoted attributes properly
- Detects comments inside tag attributes and preserves them
- Respects `<script>` and `<style>` tag boundaries

**Example:**

```javascript
const html = `
<!DOCTYPE html>
<html>
  <head>
    <!-- Header comment -->
    <style>
      /* CSS comment */
      body { color: red; }
    </style>
    <script>
      // JS comment
      alert("Hello");
    </script>
  </head>
  <body>
    <div title="<!-- not removed -->">Content</div>
  </body>
</html>
`;

CommentStripper.stripHTML(html);
// Removes HTML/CSS/JS comments, preserves attribute content
```

### Auto Mode

Automatically detects the code type based on content:

1. **HTML Detection**: Presence of `<!DOCTYPE>`, `<script>`, `<style>`, or HTML tags
2. **CSS Detection**: CSS selectors (`.class`, `#id`), `@media`, or CSS properties
3. **JavaScript Default**: Everything else defaults to JavaScript

## Testing

Run the comprehensive test suite:

```bash
node test-comment-stripper.js
```

The test suite covers:
- String literals with comment-like content
- Template literals with nested expressions
- Regex literals with character classes
- Complex regex patterns with groups and lookaheads
- CSS `url()` constructs
- HTML tag attributes with quoted values
- Escape sequences
- Edge cases (empty strings, unclosed comments, etc.)

## Implementation Notes

### Why State Machines?

State machines provide:
- **Predictability**: Clear, documented state transitions
- **Correctness**: Context-aware parsing without regex edge cases
- **Maintainability**: Easy to understand and modify
- **Performance**: Single-pass parsing

### Line Preservation

Multi-line comments preserve newlines to maintain:
- Line numbers for debugging
- Code structure consistency
- Source map compatibility

Example:
```javascript
// Input:
const x = 5;
/*
 * Multi-line
 * comment
 */
const y = 10;

// Output (preserves 4 lines):
const x = 5;




const y = 10;
```

### Regex Detection Heuristics

The JavaScript parser uses token-based heuristics to distinguish `/` as:
- **Regex start**: After `return`, `throw`, `new`, `(`, `[`, `{`, `=`, `:`, `;`, `,`, etc.
- **Division operator**: After identifiers, numbers, `)`, `]`, strings, etc.

This handles most real-world cases correctly.

## Browser Compatibility

- Modern browsers (ES5+)
- IE11+ (with polyfills for template literals if needed)
- Node.js 6+

## License

This module is part of the PDF Tools project.

## Contributing

When modifying parsers:
1. Update state machine documentation
2. Add test cases for new edge cases
3. Ensure all tests pass
4. Maintain single-pass parsing principle
5. Preserve backward compatibility

## Changelog

### Version 1.0.0
- Initial release
- State machine parsers for HTML, CSS, JavaScript
- Auto-detection mode
- Comprehensive test suite
- Browser and Node.js support
