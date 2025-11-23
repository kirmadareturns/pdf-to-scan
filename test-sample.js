// Test JavaScript file for merge tool
console.log('Test JavaScript loaded successfully!');

// Add event listener for DOM load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM is ready');
    
    // Add click handler to all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Button clicked:', e.target.textContent);
        });
    });
    
    // Log page title
    console.log('Page title:', document.title);
    
    // Test animation
    setTimeout(() => {
        console.log('Delayed message after 2 seconds');
    }, 2000);
});

// Simple utility function
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

console.log('Current date:', formatDate(new Date()));
