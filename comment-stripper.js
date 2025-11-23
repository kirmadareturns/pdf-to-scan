/**
 * Comment Stripper - State Machine-Based Parser Engine
 * 
 * This module provides browser-friendly and Node-friendly APIs for stripping
 * comments from HTML, CSS, and JavaScript code using character-by-character
 * state-machine parsers instead of regex replacements.
 * 
 * API:
 *   - Browser: window.CommentStripper.strip(code, mode)
 *   - Node: require('./comment-stripper.js').strip(code, mode)
 * 
 * Modes: 'html', 'css', 'javascript', 'auto'
 */

(function(global) {
    'use strict';

    /**
     * JavaScript Parser - State Machine
     * 
     * States:
     *   - NORMAL: Default code state
     *   - SINGLE_QUOTE: Inside single-quoted string
     *   - DOUBLE_QUOTE: Inside double-quoted string
     *   - TEMPLATE_LITERAL: Inside template literal (backtick)
     *   - TEMPLATE_EXPRESSION: Inside ${} within template literal
     *   - LINE_COMMENT: Inside // comment (to be stripped)
     *   - BLOCK_COMMENT: Inside /* comment (to be stripped)
     *   - REGEX_LITERAL: Inside /regex/ pattern
     *   - REGEX_CHAR_CLASS: Inside [class] within regex
     * 
     * Special handling:
     *   - Escape sequences: backslash escapes next character
     *   - Regex detection: uses previous token heuristics
     *   - Template expression nesting: tracks brace depth
     */
    function stripJavaScriptComments(code) {
        const STATE = {
            NORMAL: 'NORMAL',
            SINGLE_QUOTE: 'SINGLE_QUOTE',
            DOUBLE_QUOTE: 'DOUBLE_QUOTE',
            TEMPLATE_LITERAL: 'TEMPLATE_LITERAL',
            TEMPLATE_EXPRESSION: 'TEMPLATE_EXPRESSION',
            LINE_COMMENT: 'LINE_COMMENT',
            BLOCK_COMMENT: 'BLOCK_COMMENT',
            REGEX_LITERAL: 'REGEX_LITERAL',
            REGEX_CHAR_CLASS: 'REGEX_CHAR_CLASS'
        };

        let result = '';
        let state = STATE.NORMAL;
        let i = 0;
        let escaped = false;
        let templateBraceDepth = 0; // Track nested braces in template expressions
        let lastNonWhitespaceToken = ''; // For regex literal detection

        while (i < code.length) {
            const char = code[i];
            const nextChar = code[i + 1] || '';

            // Handle escape sequences in strings and template literals
            if (escaped) {
                result += char;
                escaped = false;
                i++;
                continue;
            }

            // State machine transitions
            switch (state) {
                case STATE.NORMAL:
                    // Check for line comment start
                    if (char === '/' && nextChar === '/') {
                        state = STATE.LINE_COMMENT;
                        i += 2;
                        continue;
                    }

                    // Check for block comment start
                    if (char === '/' && nextChar === '*') {
                        state = STATE.BLOCK_COMMENT;
                        i += 2;
                        continue;
                    }

                    // Check for regex literal (heuristic-based detection)
                    if (char === '/' && isRegexContext(lastNonWhitespaceToken)) {
                        state = STATE.REGEX_LITERAL;
                        result += char;
                        i++;
                        continue;
                    }

                    // Check for string starts
                    if (char === '"') {
                        state = STATE.DOUBLE_QUOTE;
                        result += char;
                        i++;
                        continue;
                    }

                    if (char === "'") {
                        state = STATE.SINGLE_QUOTE;
                        result += char;
                        i++;
                        continue;
                    }

                    // Check for template literal start
                    if (char === '`') {
                        state = STATE.TEMPLATE_LITERAL;
                        result += char;
                        i++;
                        continue;
                    }

                    // Track last non-whitespace token for regex detection
                    if (!/\s/.test(char)) {
                        if (/[a-zA-Z0-9_$]/.test(char)) {
                            // Continue building identifier
                            if (!/[a-zA-Z0-9_$]/.test(lastNonWhitespaceToken.slice(-1))) {
                                lastNonWhitespaceToken = char;
                            } else {
                                lastNonWhitespaceToken += char;
                            }
                        } else {
                            lastNonWhitespaceToken = char;
                        }
                    }

                    result += char;
                    i++;
                    break;

                case STATE.SINGLE_QUOTE:
                    if (char === '\\') {
                        escaped = true;
                        result += char;
                        i++;
                        continue;
                    }

                    if (char === "'") {
                        state = STATE.NORMAL;
                        lastNonWhitespaceToken = "'";
                    }

                    result += char;
                    i++;
                    break;

                case STATE.DOUBLE_QUOTE:
                    if (char === '\\') {
                        escaped = true;
                        result += char;
                        i++;
                        continue;
                    }

                    if (char === '"') {
                        state = STATE.NORMAL;
                        lastNonWhitespaceToken = '"';
                    }

                    result += char;
                    i++;
                    break;

                case STATE.TEMPLATE_LITERAL:
                    if (char === '\\') {
                        escaped = true;
                        result += char;
                        i++;
                        continue;
                    }

                    // Check for template expression start
                    if (char === '$' && nextChar === '{') {
                        state = STATE.TEMPLATE_EXPRESSION;
                        templateBraceDepth = 1;
                        result += char + nextChar;
                        i += 2;
                        continue;
                    }

                    // Check for template literal end
                    if (char === '`') {
                        state = STATE.NORMAL;
                        lastNonWhitespaceToken = '`';
                    }

                    result += char;
                    i++;
                    break;

                case STATE.TEMPLATE_EXPRESSION:
                    if (char === '\\') {
                        escaped = true;
                        result += char;
                        i++;
                        continue;
                    }

                    // Check for block comment in template expression
                    if (char === '/' && nextChar === '*') {
                        i += 2;
                        // Skip until */
                        while (i < code.length) {
                            if (code[i] === '*' && code[i + 1] === '/') {
                                i += 2;
                                break;
                            }
                            if (code[i] === '\n') {
                                result += code[i];
                            }
                            i++;
                        }
                        continue;
                    }

                    // Check for line comment in template expression
                    if (char === '/' && nextChar === '/') {
                        i += 2;
                        // Skip until newline
                        while (i < code.length && code[i] !== '\n') {
                            i++;
                        }
                        if (i < code.length && code[i] === '\n') {
                            result += code[i];
                            i++;
                        }
                        continue;
                    }

                    // Track nested braces
                    if (char === '{') {
                        templateBraceDepth++;
                        result += char;
                        i++;
                        continue;
                    }

                    if (char === '}') {
                        templateBraceDepth--;
                        result += char;
                        i++;
                        
                        // Return to template literal when braces are balanced
                        if (templateBraceDepth === 0) {
                            state = STATE.TEMPLATE_LITERAL;
                        }
                        continue;
                    }

                    // Handle nested strings in template expressions
                    if (char === '"') {
                        result += char;
                        i++;
                        // Mini state machine for nested strings
                        while (i < code.length) {
                            if (code[i] === '\\') {
                                result += code[i] + (code[i + 1] || '');
                                i += 2;
                                continue;
                            }
                            result += code[i];
                            if (code[i] === '"') {
                                i++;
                                break;
                            }
                            i++;
                        }
                        continue;
                    }

                    if (char === "'") {
                        result += char;
                        i++;
                        // Mini state machine for nested strings
                        while (i < code.length) {
                            if (code[i] === '\\') {
                                result += code[i] + (code[i + 1] || '');
                                i += 2;
                                continue;
                            }
                            result += char;
                            if (code[i] === "'") {
                                i++;
                                break;
                            }
                            i++;
                        }
                        continue;
                    }

                    // Handle nested template literals
                    if (char === '`') {
                        result += char;
                        i++;
                        let nestedDepth = 0;
                        while (i < code.length) {
                            if (code[i] === '\\') {
                                result += code[i] + (code[i + 1] || '');
                                i += 2;
                                continue;
                            }
                            if (code[i] === '$' && code[i + 1] === '{') {
                                nestedDepth++;
                                result += code[i] + code[i + 1];
                                i += 2;
                                continue;
                            }
                            if (code[i] === '}' && nestedDepth > 0) {
                                nestedDepth--;
                                result += code[i];
                                i++;
                                continue;
                            }
                            result += code[i];
                            if (code[i] === '`' && nestedDepth === 0) {
                                i++;
                                break;
                            }
                            i++;
                        }
                        continue;
                    }

                    result += char;
                    i++;
                    break;

                case STATE.LINE_COMMENT:
                    // Skip until end of line
                    if (char === '\n') {
                        state = STATE.NORMAL;
                        result += char; // Preserve newline
                        i++;
                    } else {
                        i++; // Skip comment character
                    }
                    break;

                case STATE.BLOCK_COMMENT:
                    // Skip until */
                    if (char === '*' && nextChar === '/') {
                        state = STATE.NORMAL;
                        i += 2;
                    } else {
                        // Preserve newlines within comments to maintain line numbers
                        if (char === '\n') {
                            result += char;
                        }
                        i++;
                    }
                    break;

                case STATE.REGEX_LITERAL:
                    if (char === '\\') {
                        escaped = true;
                        result += char;
                        i++;
                        continue;
                    }

                    // Check for character class start
                    if (char === '[') {
                        state = STATE.REGEX_CHAR_CLASS;
                        result += char;
                        i++;
                        continue;
                    }

                    // Check for regex end
                    if (char === '/') {
                        result += char;
                        i++;
                        // Include regex flags (g, i, m, s, u, y)
                        while (i < code.length && /[gimsuvy]/.test(code[i])) {
                            result += code[i];
                            i++;
                        }
                        state = STATE.NORMAL;
                        lastNonWhitespaceToken = '/';
                        continue;
                    }

                    result += char;
                    i++;
                    break;

                case STATE.REGEX_CHAR_CLASS:
                    if (char === '\\') {
                        escaped = true;
                        result += char;
                        i++;
                        continue;
                    }

                    if (char === ']') {
                        state = STATE.REGEX_LITERAL;
                    }

                    result += char;
                    i++;
                    break;
            }
        }

        return result;
    }

    /**
     * Helper function to determine if we're in a context where / starts a regex
     * rather than division or a comment.
     * 
     * Regex contexts include: after operators, keywords, punctuation like =, (, [, {, :, ;, !, &, |, ?, +, -, *, %, ^, ~, return, throw, etc.
     */
    function isRegexContext(lastToken) {
        // Keywords that are followed by regex
        const regexKeywords = ['return', 'throw', 'new', 'typeof', 'void', 'delete', 'in', 'of', 'instanceof'];
        
        if (regexKeywords.includes(lastToken)) {
            return true;
        }

        // Operators and punctuation that precede regex
        const regexPunctuation = ['=', '(', '[', '{', ':', ';', ',', '!', '&', '|', '?', '+', '-', '*', '%', '^', '~', '<', '>', ''];
        
        if (regexPunctuation.includes(lastToken)) {
            return true;
        }

        return false;
    }

    /**
     * CSS Parser - State Machine
     * 
     * States:
     *   - NORMAL: Default CSS state
     *   - SINGLE_QUOTE: Inside single-quoted string
     *   - DOUBLE_QUOTE: Inside double-quoted string
     *   - URL: Inside url(...) construct
     *   - COMMENT: Inside /* comment (to be stripped)
     * 
     * Special handling:
     *   - Escape sequences: backslash escapes next character
     *   - url() with quotes: url("...") or url('...')
     *   - url() without quotes: url(...)
     */
    function stripCSSComments(code) {
        const STATE = {
            NORMAL: 'NORMAL',
            SINGLE_QUOTE: 'SINGLE_QUOTE',
            DOUBLE_QUOTE: 'DOUBLE_QUOTE',
            URL: 'URL',
            COMMENT: 'COMMENT'
        };

        let result = '';
        let state = STATE.NORMAL;
        let i = 0;
        let escaped = false;

        while (i < code.length) {
            const char = code[i];
            const nextChar = code[i + 1] || '';

            // Handle escape sequences
            if (escaped) {
                result += char;
                escaped = false;
                i++;
                continue;
            }

            switch (state) {
                case STATE.NORMAL:
                    // Check for comment start
                    if (char === '/' && nextChar === '*') {
                        state = STATE.COMMENT;
                        i += 2;
                        continue;
                    }

                    // Check for string starts
                    if (char === '"') {
                        state = STATE.DOUBLE_QUOTE;
                        result += char;
                        i++;
                        continue;
                    }

                    if (char === "'") {
                        state = STATE.SINGLE_QUOTE;
                        result += char;
                        i++;
                        continue;
                    }

                    // Check for url( construct
                    if (char === 'u' && code.substr(i, 4) === 'url(') {
                        state = STATE.URL;
                        result += 'url(';
                        i += 4;
                        continue;
                    }

                    // Check for escape
                    if (char === '\\') {
                        escaped = true;
                        result += char;
                        i++;
                        continue;
                    }

                    result += char;
                    i++;
                    break;

                case STATE.SINGLE_QUOTE:
                    if (char === '\\') {
                        escaped = true;
                        result += char;
                        i++;
                        continue;
                    }

                    if (char === "'") {
                        state = STATE.NORMAL;
                    }

                    result += char;
                    i++;
                    break;

                case STATE.DOUBLE_QUOTE:
                    if (char === '\\') {
                        escaped = true;
                        result += char;
                        i++;
                        continue;
                    }

                    if (char === '"') {
                        state = STATE.NORMAL;
                    }

                    result += char;
                    i++;
                    break;

                case STATE.URL:
                    // url() can contain quoted or unquoted values
                    // Handle quoted values
                    if (char === '"') {
                        result += char;
                        i++;
                        // Process quoted string within url()
                        while (i < code.length) {
                            if (code[i] === '\\') {
                                result += code[i] + (code[i + 1] || '');
                                i += 2;
                                continue;
                            }
                            result += code[i];
                            if (code[i] === '"') {
                                i++;
                                break;
                            }
                            i++;
                        }
                        continue;
                    }

                    if (char === "'") {
                        result += char;
                        i++;
                        // Process quoted string within url()
                        while (i < code.length) {
                            if (code[i] === '\\') {
                                result += code[i] + (code[i + 1] || '');
                                i += 2;
                                continue;
                            }
                            result += code[i];
                            if (code[i] === "'") {
                                i++;
                                break;
                            }
                            i++;
                        }
                        continue;
                    }

                    // Check for url end
                    if (char === ')') {
                        state = STATE.NORMAL;
                    }

                    result += char;
                    i++;
                    break;

                case STATE.COMMENT:
                    // Skip until */
                    if (char === '*' && nextChar === '/') {
                        state = STATE.NORMAL;
                        i += 2;
                    } else {
                        // Preserve newlines to maintain line structure
                        if (char === '\n') {
                            result += char;
                        }
                        i++;
                    }
                    break;
            }
        }

        return result;
    }

    /**
     * HTML Parser - State Machine
     * 
     * States:
     *   - NORMAL: Default HTML state
     *   - COMMENT: Inside <!-- --> comment (to be stripped)
     *   - TAG_OPEN: Inside < tag >
     *   - SCRIPT: Inside <script> tag (delegate to JS parser)
     *   - STYLE: Inside <style> tag (delegate to CSS parser)
     *   - TAG_ATTR_SINGLE: Inside single-quoted attribute
     *   - TAG_ATTR_DOUBLE: Inside double-quoted attribute
     * 
     * Special handling:
     *   - Preserves original casing and whitespace
     *   - Detects <script> and <style> boundaries
     *   - Respects quoted tag attributes
     *   - Only removes true <!-- --> comments outside script/style
     */
    function stripHTMLComments(code) {
        const STATE = {
            NORMAL: 'NORMAL',
            COMMENT: 'COMMENT',
            TAG_OPEN: 'TAG_OPEN',
            SCRIPT: 'SCRIPT',
            STYLE: 'STYLE',
            TAG_ATTR_SINGLE: 'TAG_ATTR_SINGLE',
            TAG_ATTR_DOUBLE: 'TAG_ATTR_DOUBLE'
        };

        let result = '';
        let state = STATE.NORMAL;
        let i = 0;

        while (i < code.length) {
            const char = code[i];
            const peek4 = code.substr(i, 4);
            const peek3 = code.substr(i, 3);

            switch (state) {
                case STATE.NORMAL:
                    // Check for script tag
                    if (code.substr(i, 7).toLowerCase() === '<script') {
                        // Find the end of opening tag (handling quoted attributes)
                        let tagEnd = i + 7;
                        let inQuote = false;
                        let quoteChar = '';
                        
                        while (tagEnd < code.length) {
                            if ((code[tagEnd] === '"' || code[tagEnd] === "'") && code[tagEnd - 1] !== '\\') {
                                if (!inQuote) {
                                    inQuote = true;
                                    quoteChar = code[tagEnd];
                                } else if (code[tagEnd] === quoteChar) {
                                    inQuote = false;
                                }
                            }
                            if (code[tagEnd] === '>' && !inQuote) {
                                tagEnd++;
                                break;
                            }
                            tagEnd++;
                        }

                        // Find the closing </script>
                        let scriptEnd = code.toLowerCase().indexOf('</script>', tagEnd);
                        if (scriptEnd !== -1) {
                            // Extract and process the script content
                            let scriptContent = code.substring(tagEnd, scriptEnd);
                            let cleanScript = stripJavaScriptComments(scriptContent);
                            
                            // Append opening tag, cleaned script, and prepare for closing tag
                            result += code.substring(i, tagEnd) + cleanScript;
                            i = scriptEnd;
                            continue;
                        }
                    }

                    // Check for style tag
                    if (code.substr(i, 6).toLowerCase() === '<style') {
                        // Find the end of opening tag (handling quoted attributes)
                        let tagEnd = i + 6;
                        let inQuote = false;
                        let quoteChar = '';
                        
                        while (tagEnd < code.length) {
                            if ((code[tagEnd] === '"' || code[tagEnd] === "'") && code[tagEnd - 1] !== '\\') {
                                if (!inQuote) {
                                    inQuote = true;
                                    quoteChar = code[tagEnd];
                                } else if (code[tagEnd] === quoteChar) {
                                    inQuote = false;
                                }
                            }
                            if (code[tagEnd] === '>' && !inQuote) {
                                tagEnd++;
                                break;
                            }
                            tagEnd++;
                        }

                        // Find the closing </style>
                        let styleEnd = code.toLowerCase().indexOf('</style>', tagEnd);
                        if (styleEnd !== -1) {
                            // Extract and process the style content
                            let styleContent = code.substring(tagEnd, styleEnd);
                            let cleanStyle = stripCSSComments(styleContent);
                            
                            // Append opening tag, cleaned style, and prepare for closing tag
                            result += code.substring(i, tagEnd) + cleanStyle;
                            i = styleEnd;
                            continue;
                        }
                    }

                    // Check for comment start (but not inside tags)
                    if (peek4 === '<!--') {
                        // Make sure we're not inside a tag attribute
                        // Look backwards to see if we're in a tag
                        let lastOpenBracket = -1;
                        let lastCloseBracket = -1;
                        
                        // Simple heuristic: find last < and > before current position
                        for (let j = i - 1; j >= 0 && j >= i - 1000; j--) {
                            if (code[j] === '>' && lastCloseBracket === -1) {
                                lastCloseBracket = j;
                            }
                            if (code[j] === '<' && lastOpenBracket === -1) {
                                lastOpenBracket = j;
                                break;
                            }
                        }
                        
                        // If last < is after last >, we might be in a tag
                        if (lastOpenBracket !== -1 && (lastCloseBracket === -1 || lastOpenBracket > lastCloseBracket)) {
                            // Check if we're inside quoted attribute
                            let quotedSection = code.substring(lastOpenBracket, i);
                            let singleQuotes = (quotedSection.match(/'/g) || []).length;
                            let doubleQuotes = (quotedSection.match(/"/g) || []).length;
                            
                            // If odd number of quotes, we're inside an attribute
                            if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1) {
                                result += char;
                                i++;
                                continue;
                            }
                        }
                        
                        // It's a real comment, skip it
                        state = STATE.COMMENT;
                        i += 4;
                        continue;
                    }

                    result += char;
                    i++;
                    break;

                case STATE.COMMENT:
                    // Skip until -->
                    if (peek3 === '-->') {
                        state = STATE.NORMAL;
                        i += 3;
                    } else {
                        i++; // Skip comment character
                    }
                    break;
            }
        }

        return result;
    }

    /**
     * Auto-detect mode based on content
     * Scans for HTML tags, then applies appropriate parser
     */
    function stripCommentsAuto(code) {
        // Check if content contains HTML tags
        const hasHtmlTags = /<[a-zA-Z!][^>]*>/.test(code);
        const hasDoctype = /<!DOCTYPE/i.test(code);
        const hasScriptOrStyle = /<(script|style)[^>]*>/i.test(code);

        if (hasDoctype || hasScriptOrStyle) {
            // Definitely HTML
            return stripHTMLComments(code);
        }

        if (hasHtmlTags) {
            // Likely HTML
            return stripHTMLComments(code);
        }

        // Check for CSS-specific patterns
        const hasCssSelectors = /[.#][\w-]+\s*\{/.test(code);
        const hasMediaQuery = /@media/.test(code);
        const hasCssProperties = /[\w-]+\s*:\s*[^;]+;/.test(code);

        if (hasCssSelectors || hasMediaQuery || (hasCssProperties && !hasHtmlTags)) {
            // Likely CSS
            return stripCSSComments(code);
        }

        // Default to JavaScript for everything else
        return stripJavaScriptComments(code);
    }

    /**
     * Main API function
     * @param {string} code - The code to strip comments from
     * @param {string} mode - The parsing mode: 'html', 'css', 'javascript', or 'auto'
     * @returns {string} - The code with comments stripped
     */
    function strip(code, mode) {
        if (typeof code !== 'string') {
            throw new TypeError('Code must be a string');
        }

        mode = (mode || 'auto').toLowerCase();

        switch (mode) {
            case 'html':
                return stripHTMLComments(code);
            case 'css':
                return stripCSSComments(code);
            case 'javascript':
            case 'js':
                return stripJavaScriptComments(code);
            case 'auto':
                return stripCommentsAuto(code);
            default:
                throw new Error('Invalid mode. Use "html", "css", "javascript", or "auto"');
        }
    }

    // Export for different environments
    const CommentStripper = {
        strip: strip,
        stripHTML: stripHTMLComments,
        stripCSS: stripCSSComments,
        stripJavaScript: stripJavaScriptComments,
        stripAuto: stripCommentsAuto
    };

    // Browser environment
    if (typeof window !== 'undefined') {
        window.CommentStripper = CommentStripper;
    }

    // Node.js environment (CommonJS)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CommentStripper;
    }

    // AMD environment
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return CommentStripper;
        });
    }

})(typeof window !== 'undefined' ? window : global);
