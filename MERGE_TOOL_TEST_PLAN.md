# Merge HTML CSS JS Tool - Test Plan

## File Location
`/home/engine/project/merge-html-css-js.html`

## Manual Testing Checklist

### ✅ Visual/UI Tests

1. **Page Load**
   - [ ] Page loads without errors
   - [ ] No console errors on load
   - [ ] All elements visible
   - [ ] Proper styling applied

2. **Tab Navigation**
   - [ ] HTML tab is active by default
   - [ ] Clicking CSS tab switches view
   - [ ] Clicking JS tab switches view
   - [ ] Only one tab active at a time
   - [ ] Tab content panels show/hide correctly
   - [ ] Active tab has red underline

3. **Input Areas**
   - [ ] Each tab has a textarea
   - [ ] Textareas accept input
   - [ ] Placeholders visible when empty
   - [ ] File upload buttons present on all tabs
   - [ ] Textareas are properly styled

### ✅ Functional Tests

4. **Statistics Display**
   - [ ] Character count shows "0" on load
   - [ ] Size shows "0 B" on load
   - [ ] Stats update when typing in HTML textarea
   - [ ] Stats update when typing in CSS textarea
   - [ ] Stats update when typing in JS textarea
   - [ ] Character count formatted with commas (e.g., "1,234")
   - [ ] Size shows proper units (B, KB, MB)

5. **File Upload - HTML**
   - [ ] Click "Upload HTML File" opens file picker
   - [ ] Select test-sample.html
   - [ ] File name displays next to button
   - [ ] Content loads into textarea
   - [ ] Stats update automatically

6. **File Upload - CSS**
   - [ ] Click "Upload CSS File" opens file picker
   - [ ] Select test-sample.css
   - [ ] File name displays next to button
   - [ ] Content loads into textarea
   - [ ] Stats update automatically

7. **File Upload - JavaScript**
   - [ ] Click "Upload JavaScript File" opens file picker
   - [ ] Select test-sample.js
   - [ ] File name displays next to button
   - [ ] Content loads into textarea
   - [ ] Stats update automatically

8. **Merge Functionality**
   - [ ] Click "Merge Files" with empty inputs shows alert
   - [ ] Add content to HTML textarea
   - [ ] Click "Merge Files" button
   - [ ] Output section appears
   - [ ] Download button becomes visible
   - [ ] Preview shows merged content
   - [ ] Merged size displays correctly
   - [ ] Page scrolls to output section

9. **Merge Content Validation**
   - [ ] Merged content includes `<!DOCTYPE html>`
   - [ ] Merged content includes proper `<html>` structure
   - [ ] Merged content includes `<head>` with meta tags
   - [ ] CSS wrapped in `<style>` tags inside `<head>`
   - [ ] HTML content in `<body>`
   - [ ] JS wrapped in `<script>` tags before `</body>`

10. **Download Functionality**
    - [ ] Click "Download Merged HTML" button
    - [ ] File downloads as "merged.html"
    - [ ] Downloaded file opens in browser
    - [ ] Downloaded file is valid HTML
    - [ ] Downloaded file shows all merged content

11. **Clear All Functionality**
    - [ ] Click "Clear All" shows confirmation dialog
    - [ ] Click "Cancel" in dialog keeps content
    - [ ] Click "OK" in dialog clears all textareas
    - [ ] All file inputs cleared
    - [ ] All file name displays cleared
    - [ ] All stats reset to zero
    - [ ] Output section hidden
    - [ ] Download button hidden
    - [ ] Switches back to HTML tab

### ✅ Edge Cases

12. **HTML with Full Document Structure**
    - [ ] Paste full HTML document with DOCTYPE, html, head, body
    - [ ] Merge extracts body content only
    - [ ] Result has proper structure without nested html/body tags

13. **HTML with Only Body Tag**
    - [ ] Paste HTML with `<body>` tags
    - [ ] Merge extracts content from body
    - [ ] Result has proper structure

14. **HTML Snippets**
    - [ ] Paste HTML without any wrapper tags
    - [ ] Merge uses content as-is in body
    - [ ] Result has proper structure

15. **Merge with Only CSS**
    - [ ] Clear all inputs
    - [ ] Add only CSS content
    - [ ] Merge creates valid HTML with style tag
    - [ ] No body content or empty body

16. **Merge with Only JS**
    - [ ] Clear all inputs
    - [ ] Add only JavaScript content
    - [ ] Merge creates valid HTML with script tag
    - [ ] Empty or minimal body content

17. **Large Files**
    - [ ] Add 10,000+ characters to HTML
    - [ ] Stats update correctly
    - [ ] Merge completes successfully
    - [ ] Preview truncates with "..." indicator
    - [ ] Download works with full content

### ✅ Accessibility Tests

18. **Keyboard Navigation**
    - [ ] Tab key moves through all interactive elements
    - [ ] Tab buttons receive focus
    - [ ] Upload buttons receive focus
    - [ ] Textareas receive focus
    - [ ] Action buttons receive focus
    - [ ] Focus outline visible on all elements

19. **ARIA Attributes**
    - [ ] Tab buttons have `role="tab"`
    - [ ] Tab buttons have `aria-selected`
    - [ ] Tab panels have `role="tabpanel"`
    - [ ] Tab panels have `aria-labelledby`
    - [ ] Textareas have `aria-label`
    - [ ] Buttons have `aria-label`

20. **Semantic HTML**
    - [ ] Proper heading hierarchy (h1)
    - [ ] Buttons use `<button>` elements
    - [ ] Inputs use proper `<input>` types
    - [ ] Textareas use `<textarea>` elements
    - [ ] Labels associated with inputs

### ✅ Responsive Design

21. **Desktop View (1200px+)**
    - [ ] Container centered with max-width
    - [ ] Tabs display horizontally
    - [ ] All elements properly sized
    - [ ] No horizontal scroll

22. **Tablet View (768px - 1199px)**
    - [ ] Layout adjusts properly
    - [ ] Content remains readable
    - [ ] Buttons accessible

23. **Mobile View (< 768px)**
    - [ ] Tabs stack vertically or wrap
    - [ ] Buttons stack vertically
    - [ ] Stats stack vertically
    - [ ] Textareas full width
    - [ ] No content overflow

### ✅ Browser Console Tests

24. **Run Console Test Script**
    - [ ] Open browser console (F12)
    - [ ] Copy content of test-merge-console.js
    - [ ] Paste and run in console
    - [ ] All tests should pass
    - [ ] No JavaScript errors

### ✅ Cross-Browser Testing

25. **Chrome/Chromium**
    - [ ] All features work
    - [ ] No console errors
    - [ ] Proper styling

26. **Firefox**
    - [ ] All features work
    - [ ] No console errors
    - [ ] Proper styling

27. **Safari** (if available)
    - [ ] All features work
    - [ ] No console errors
    - [ ] Proper styling

28. **Edge** (if available)
    - [ ] All features work
    - [ ] No console errors
    - [ ] Proper styling

## Automated Console Testing

Run the following in the browser console after opening `merge-html-css-js.html`:

```javascript
// Quick smoke test
console.log('=== Quick Smoke Test ===');
console.log('switchTab exists:', typeof switchTab === 'function');
console.log('mergeFiles exists:', typeof mergeFiles === 'function');
console.log('clearAll exists:', typeof clearAll === 'function');
console.log('downloadMerged exists:', typeof downloadMerged === 'function');

// Test merge with sample data
document.getElementById('html-input').value = '<h1>Test</h1>';
document.getElementById('css-input').value = 'h1 { color: blue; }';
document.getElementById('js-input').value = 'console.log("Hi");';
mergeFiles();
console.log('Merged content length:', mergedContent.length);
console.log('Has DOCTYPE:', mergedContent.includes('<!DOCTYPE'));
console.log('Has style tag:', mergedContent.includes('<style>'));
console.log('Has script tag:', mergedContent.includes('<script>'));
console.log('✅ Smoke test complete!');
```

## Test Files Provided

1. **test-sample.html** - Sample HTML for upload testing
2. **test-sample.css** - Sample CSS for upload testing
3. **test-sample.js** - Sample JavaScript for upload testing
4. **test-merge-console.js** - Comprehensive console test suite

## Expected Results

- ✅ No console errors on any operation
- ✅ All features work as described
- ✅ Merged files are valid HTML
- ✅ Downloads work correctly
- ✅ UI is responsive and accessible
- ✅ All edge cases handled gracefully

## Bug Reporting

If any test fails, note:
1. Which test failed
2. What was the expected behavior
3. What actually happened
4. Browser and version
5. Any console errors
