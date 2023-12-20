// Function to clean and validate the username format
const cleanAndValidateUsername = (username) => {
    // Remove spaces and special characters
    const cleanedUsername = username.replace(/[\s\W]/g, '');
   
    // Only allow alphanumeric characters
    const validUsername = cleanedUsername.replace(/[^a-zA-Z0-9]/g, '');
   
    // Truncate the username to the first 20 characters
    const truncatedUsername = validUsername.slice(0, 15);   

    // Update the input field with the truncated username
    id_("userName").value = truncatedUsername;

    return truncatedUsername;
    
};



// Function to fetch the username check
const fetchUsernameCheck = async (username) => { 
    try {
        const response = await fetch(`/user/userName?userName=${username}`);
        const data = await response.json();

        // Handle successful request
        handleResponse(data);
    } catch (error) {
        // Handle request error
        handleError();
    }
};

// Function to handle the response data
const handleResponse = (data) => {
    if (data.status !== true) {
        enableRegisterButton(data.message);
    } else {
        disableRegisterButton(data.message);
    }
};

// Function to handle the error response
const handleError = () => {
    id_("userName").style.color = "lightgreen";
    id_("message_alert").style.color = "red";
    id_("message_alert").innerHTML = "Error checking username";
};

// Function to enable the register button
const enableRegisterButton = (message) => {
    id_("message_alert").style.color = "lightgreen";
    id_("message_alert").innerHTML = message;
    id_("register_button").disabled = false;
};

// Function to disable the register button
const disableRegisterButton = (message) => {
    id_("message_alert").style.color = "red";
    id_("message_alert").innerHTML = message;
    id_("userName").style.color = "red";
    id_("register_button").disabled = true;
};

// Listen for #userName input
let timeout;
query_(".message").display = "none";
id_("userName").addEventListener("input", (e) => {
    const username = e.target.value;

    cleanAndValidateUsername(username);

    clearTimeout(timeout);

    timeout = setTimeout(() => {
        fetchUsernameCheck(username);
    }, 1000);
});
