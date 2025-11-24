# HTML CSS JS Merger Tool

## Overview
A simple, bulletproof tool for merging separate HTML, CSS, and JavaScript files into a single HTML document. Perfect for creating standalone web pages from modular code.

## Features

### Core Functionality
- **Two Input Methods**: Paste code directly OR upload files
- **Three File Types**: HTML, CSS, and JavaScript
- **Smart Merging**: Automatically creates proper HTML structure
- **File Statistics**: Real-time character count and file size for each input
- **Download**: Get your merged file as `merged.html`
- **Clear All**: Reset everything with one click

### User Experience
- **Tab Navigation**: Easy switching between HTML, CSS, and JS inputs
- **Live Preview**: See a preview of your merged content
- **Smart HTML Parsing**: Automatically extracts body content from full HTML documents
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: Full keyboard navigation and ARIA labels

## How to Use

### Method 1: Paste Code
1. Open `merge-html-css-js.html` in your browser
2. Click on the HTML tab (active by default)
3. Paste your HTML code in the textarea
4. Switch to CSS tab and paste your CSS code
5. Switch to JS tab and paste your JavaScript code
6. Click "Merge Files" button
7. Review the preview
8. Click "Download Merged HTML" to save the file

### Method 2: Upload Files
1. Open `merge-html-css-js.html` in your browser
2. Click "Upload HTML File" and select your .html file
3. Click "Upload CSS File" and select your .css file
4. Click "Upload JavaScript File" and select your .js file
5. Click "Merge Files" button
6. Review the preview
7. Click "Download Merged HTML" to save the file

### Method 3: Mix and Match
You can combine both methods! For example:
- Upload an HTML file
- Paste CSS code directly
- Upload a JavaScript file

## Output Structure

The tool creates a properly structured HTML document:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Merged Document</title>
    <style>
    /* Your CSS here */
    </style>
</head>
<body>
<!-- Your HTML here -->
    <script>
    // Your JavaScript here
    </script>
</body>
</html>
```

## Smart Features

### HTML Content Extraction
The tool intelligently handles different HTML input formats:

- **Full HTML Document**: Extracts only the body content
  ```html
  Input: <!DOCTYPE html><html><head>...</head><body><p>Content</p></body></html>
  Result: Only <p>Content</p> is placed in the body of the merged document
  ```

- **Body Tag Only**: Extracts content from body tags
  ```html
  Input: <body><p>Content</p></body>
  Result: Only <p>Content</p> is placed in the body
  ```

- **HTML Snippets**: Uses as-is
  ```html
  Input: <p>Content</p>
  Result: <p>Content</p> is placed directly in the body
  ```

### Optional Inputs
You don't need all three file types:
- HTML only → Creates document with just HTML content
- CSS only → Creates document with just styles
- JS only → Creates document with just scripts
- Any combination → Works perfectly!

## File Statistics

The tool displays real-time statistics for each input:
- **Character Count**: Total characters (formatted with commas)
- **File Size**: Displayed in appropriate units (B, KB, MB)
- **Merged Size**: Total size of the final merged file

## Keyboard Navigation

The tool is fully accessible via keyboard:
- **Tab**: Move between elements
- **Enter/Space**: Activate buttons
- **Arrow Keys**: Navigate within textareas
- **Tab Navigation**: Switch between HTML/CSS/JS tabs

## Technical Details

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Modern browsers: ✅ Full support

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox, custom properties
- **Vanilla JavaScript**: No dependencies
- **FileReader API**: For file uploads
- **Blob API**: For file downloads
- **Responsive Design**: Media queries for mobile support

### File APIs
- **Input**: Uses `<input type="file">` and FileReader
- **Output**: Uses Blob and URL.createObjectURL
- **Download**: Programmatic download with proper cleanup

## Testing

### Quick Test in Browser Console
```javascript
// 1. Open merge-html-css-js.html
// 2. Open browser console (F12)
// 3. Run this test:

document.getElementById('html-input').value = '<h1>Hello</h1>';
document.getElementById('css-input').value = 'h1 { color: blue; }';
document.getElementById('js-input').value = 'console.log("Loaded");';
mergeFiles();
console.log('Merge successful:', mergedContent.includes('<!DOCTYPE html>'));
```

### Test Files Included
- `test-sample.html` - Sample HTML with styled container and button
- `test-sample.css` - Sample CSS with gradient and animations
- `test-sample.js` - Sample JavaScript with event listeners and utilities

### Automated Tests
Run the validation script:
```bash
node validate-merge-tool.js
```

Run integration tests:
```bash
node test-merge-integration.js
```

## Use Cases

1. **Single-Page Applications**: Combine modular code into one file
2. **Email Templates**: Create self-contained HTML emails
3. **Code Sharing**: Share complete examples in a single file
4. **Archiving**: Preserve web pages as single files
5. **Offline Use**: Create standalone HTML files that work without server
6. **Learning**: See how HTML, CSS, and JS work together
7. **Prototyping**: Quickly combine prototypes into shareable files

## Best Practices

### HTML Input
- Use semantic HTML tags
- Avoid duplicate DOCTYPE or html tags (they'll be extracted)
- Include only body content if you have a full document

### CSS Input
- Don't include `<style>` tags (they'll be added automatically)
- Use relative units for better responsive design
- Test your CSS works in the merged document

### JavaScript Input
- Don't include `<script>` tags (they'll be added automatically)
- Ensure code doesn't depend on external libraries (unless you include them)
- Use DOMContentLoaded for initialization code
- Test in browser console before merging

## Limitations

- No external file linking (all code must be inline)
- No external library imports (must be CDN or inline)
- Large files may take a moment to process
- Preview truncates at 1000 characters (full content in download)

## Troubleshooting

### Issue: "Please add some content" alert
**Solution**: Make sure at least one textarea has content before clicking Merge.

### Issue: Download button doesn't appear
**Solution**: Click "Merge Files" first to generate the merged content.

### Issue: File upload doesn't work
**Solution**: Make sure you're selecting the correct file type (.html, .css, or .js).

### Issue: Merged file doesn't look right
**Solution**: Check your CSS and JavaScript syntax. Open browser console to see errors.

### Issue: Clear All doesn't work
**Solution**: You need to confirm the action in the dialog that appears.

## Source Code

The tool is a single HTML file with embedded CSS and JavaScript:
- **Lines**: 716
- **Size**: ~23 KB
- **Dependencies**: None (pure vanilla JS)
- **Location**: `/merge-html-css-js.html`

## License

This tool is part of the pdf-to-scan repository.

## Support

For issues or questions:
1. Check the browser console for errors
2. Review the test plan: `MERGE_TOOL_TEST_PLAN.md`
3. Run validation: `node validate-merge-tool.js`
4. Check test results: `TEST_RESULTS.md`

## Version

**Version**: 1.0.0  
**Created**: 2024  
**Status**: Production Ready ✅
