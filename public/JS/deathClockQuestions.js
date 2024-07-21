console.log('deathClock_questions.js loaded');

// Soft validation function
const softValidateForm = () => {
    const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'red';
        } else {
            input.style.borderColor = '';
        }
    });
    return isValid;
};

// Fetch function
const sendFormData = async (url, method, data, csrfToken) => {
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken
        },
        body: JSON.stringify(data)
    });
    return response.json();
};

// Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();

    //disable submit_btn and change text to "Submitting..."
    id_("submit_btn").disabled = true;
    id_("submit_btn").textContent = 'Submitting...';

    if (!softValidateForm()) {
        alert('Please fill out all required fields.');
        return;
    }

    const formData = new FormData(e.target);
    const jsonData = Object.fromEntries(formData.entries());
    const csrfToken = document.getElementById('csrf').value;

    try {
        const data = await sendFormData('/submitDeathclockForm', 'POST', { jsonData, csrfToken }, csrfToken);
        if (data.status === 'success') {
            const userShortId = data.userShortId;
            window.location.href = '/deathClock/results/' + userShortId;
        }else if(data.status === "other"){
            globalMessage("Limit exceeded", data.message);
            id_("submit_btn").disabled = true;
            id_("submit_btn").textContent = 'Submit';        
        }else {
            // title message
            globalMessage("Oops!", "An error occurred. Please try again later.");
            id_("submit_btn").disabled = true;
            id_("submit_btn").textContent = 'Submit';
        }
    } catch (error) {
        console.error('Error:', error);
        globalMessage("Oops!", "An error occurred. Please try again later.");
    }
};

document.getElementById('healthForm').addEventListener('submit', handleSubmit);




