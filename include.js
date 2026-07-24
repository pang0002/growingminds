// include.js
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Header not found');
            }
            return response.text();
        })
        .then(data => {
            document.querySelector('header').innerHTML = data;
        })
        .catch(error => console.error('Error loading header:', error));

    // Load footer
    fetch('footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Footer not found');
            }
            return response.text();
        })
        .then(data => {
            document.querySelector('footer').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
});