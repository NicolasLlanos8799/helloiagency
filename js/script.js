// Updated script.js with form validation, email/phone validation, XSS prevention in carousel, and error handling for external dependencies

// Function to validate email
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

// Function to validate phone numbers
function validatePhone(phone) {
    const re = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    return re.test(String(phone));
}

// Function to prevent XSS in carousel
function sanitizeInput(input) {
    const element = document.createElement('div');
    element.innerText = input;
    return element.innerHTML;
}

// Error handling function for external dependencies
function handleExternalError(error) {
    console.error('External dependency error: ', error);
    alert('An error occurred while loading external resources. Please try again later.');
}

// Example usage of validation functions
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');

emailInput.addEventListener('blur', function() {
    if (!validateEmail(emailInput.value)) {
        alert('Invalid email format!');
    }
});

phoneInput.addEventListener('blur', function() {
    if (!validatePhone(phoneInput.value)) {
        alert('Invalid phone number!');
    }
});