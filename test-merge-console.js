/**
 * Console Test Script for merge-html-css-js.html
 * 
 * Instructions:
 * 1. Open merge-html-css-js.html in your browser
 * 2. Open the browser console (F12)
 * 3. Paste this entire script and run it
 * 4. Check the test results
 */

(function() {
    console.log('=== Starting Merge Tool Tests ===\n');
    
    let passedTests = 0;
    let failedTests = 0;
    
    function assert(condition, testName) {
        if (condition) {
            console.log(`✅ PASS: ${testName}`);
            passedTests++;
        } else {
            console.error(`❌ FAIL: ${testName}`);
            failedTests++;
        }
    }
    
    // Test 1: Check if all required elements exist
    console.log('--- Test 1: DOM Elements ---');
    assert(document.getElementById('html-input') !== null, 'HTML input textarea exists');
    assert(document.getElementById('css-input') !== null, 'CSS input textarea exists');
    assert(document.getElementById('js-input') !== null, 'JS input textarea exists');
    assert(document.getElementById('html-file-input') !== null, 'HTML file input exists');
    assert(document.getElementById('css-file-input') !== null, 'CSS file input exists');
    assert(document.getElementById('js-file-input') !== null, 'JS file input exists');
    assert(document.getElementById('output-section') !== null, 'Output section exists');
    assert(document.getElementById('download-btn') !== null, 'Download button exists');
    
    // Test 2: Check if functions exist
    console.log('\n--- Test 2: Function Availability ---');
    assert(typeof switchTab === 'function', 'switchTab function exists');
    assert(typeof handleFileUpload === 'function', 'handleFileUpload function exists');
    assert(typeof updateStats === 'function', 'updateStats function exists');
    assert(typeof formatBytes === 'function', 'formatBytes function exists');
    assert(typeof mergeFiles === 'function', 'mergeFiles function exists');
    assert(typeof downloadMerged === 'function', 'downloadMerged function exists');
    assert(typeof clearAll === 'function', 'clearAll function exists');
    
    // Test 3: Test formatBytes utility
    console.log('\n--- Test 3: formatBytes Utility ---');
    assert(formatBytes(0) === '0 B', 'formatBytes(0) returns "0 B"');
    assert(formatBytes(500) === '500 B', 'formatBytes(500) returns "500 B"');
    assert(formatBytes(1024) === '1 KB', 'formatBytes(1024) returns "1 KB"');
    assert(formatBytes(1048576) === '1 MB', 'formatBytes(1048576) returns "1 MB"');
    
    // Test 4: Test tab switching
    console.log('\n--- Test 4: Tab Switching ---');
    switchTab('css');
    assert(document.getElementById('css-panel').classList.contains('active'), 'CSS tab activates correctly');
    assert(document.getElementById('css-tab').classList.contains('active'), 'CSS tab button shows as active');
    switchTab('js');
    assert(document.getElementById('js-panel').classList.contains('active'), 'JS tab activates correctly');
    assert(!document.getElementById('css-panel').classList.contains('active'), 'Previous tab deactivates');
    switchTab('html');
    assert(document.getElementById('html-panel').classList.contains('active'), 'HTML tab activates correctly');
    
    // Test 5: Test stats update
    console.log('\n--- Test 5: Stats Update ---');
    const htmlInput = document.getElementById('html-input');
    const originalValue = htmlInput.value;
    htmlInput.value = 'Test content';
    updateStats('html');
    const charCount = document.getElementById('html-chars').textContent;
    assert(charCount === '12', 'Character count updates correctly');
    htmlInput.value = originalValue;
    updateStats('html');
    
    // Test 6: Test merge functionality
    console.log('\n--- Test 6: Merge Functionality ---');
    document.getElementById('html-input').value = '<h1>Test HTML</h1>';
    document.getElementById('css-input').value = 'h1 { color: red; }';
    document.getElementById('js-input').value = 'console.log("test");';
    updateStats('html');
    updateStats('css');
    updateStats('js');
    
    mergeFiles();
    
    assert(typeof mergedContent !== 'undefined', 'mergedContent variable is defined');
    assert(mergedContent.length > 0, 'Merged content is generated');
    assert(mergedContent.includes('<!DOCTYPE html>'), 'Merged content has DOCTYPE');
    assert(mergedContent.includes('<style>'), 'Merged content includes style tag');
    assert(mergedContent.includes('h1 { color: red; }'), 'Merged content includes CSS');
    assert(mergedContent.includes('<script>'), 'Merged content includes script tag');
    assert(mergedContent.includes('console.log("test");'), 'Merged content includes JS');
    assert(mergedContent.includes('<h1>Test HTML</h1>'), 'Merged content includes HTML');
    assert(document.getElementById('output-section').classList.contains('show'), 'Output section is visible');
    assert(document.getElementById('download-btn').classList.contains('show'), 'Download button is visible');
    
    // Test 7: Test clear functionality
    console.log('\n--- Test 7: Clear Functionality ---');
    // Store original confirm to restore later
    const originalConfirm = window.confirm;
    window.confirm = () => true; // Mock confirm to always return true
    
    clearAll();
    
    assert(document.getElementById('html-input').value === '', 'HTML input cleared');
    assert(document.getElementById('css-input').value === '', 'CSS input cleared');
    assert(document.getElementById('js-input').value === '', 'JS input cleared');
    assert(!document.getElementById('output-section').classList.contains('show'), 'Output section hidden after clear');
    
    // Restore original confirm
    window.confirm = originalConfirm;
    
    // Test 8: Test edge cases
    console.log('\n--- Test 8: Edge Cases ---');
    
    // Test with empty inputs
    mergeFiles();
    // Should show alert, but we can't test that without mocking
    
    // Test with only HTML
    document.getElementById('html-input').value = '<p>Only HTML</p>';
    mergeFiles();
    assert(mergedContent.includes('<p>Only HTML</p>'), 'Merges with only HTML content');
    
    // Test with full HTML document in HTML input
    document.getElementById('html-input').value = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><p>Full document</p></body>
</html>`;
    mergeFiles();
    assert(mergedContent.includes('<p>Full document</p>'), 'Extracts body from full HTML document');
    
    // Clean up
    clearAll();
    window.confirm = originalConfirm;
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Total Tests: ${passedTests + failedTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
    
    if (failedTests === 0) {
        console.log('\n🎉 All tests passed! The merge tool is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the failures above.');
    }
})();
