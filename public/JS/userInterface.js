// Helper function to get elements by ID
const id = (id) => document.getElementById(id);

// Helper function to get elements by class
const query = (query) => document.querySelector(query);

// Fetch function to check if a username is available
const fetchUsernameCheck = async (username) => {
    // Validate username format
    const validUsername = /^[a-zA-Z0-9]+$/.test(username);

    if (!validUsername) {
        // Handle invalid username format
        id("userName").style.color = "red";
        query(".message").innerHTML = "Invalid username format";
        return;
    } else {
        query(".message").innerHTML = "";
        id("userName").style.color = "lightgreen";
    }

    // Check if username is empty
    if (username === "") return;

    try {
        // Check username using a GET request
        const response = await fetch(`/user/userName?userName=${username}`);
        const data = await response.json();

        if (data.status !== true) {
            id("userName").style.color = "lightgreen";
            return;
        }

        // Display message and set color
        console.log(data.message);
        query(".message").innerHTML = data.message;
        id("userName").style.color = "red"; // Set color to green for a good format
    } catch (error) {
        console.error(error);
        // Handle errors appropriately
        id("userName").style.color = "lightgreen";
        query(".message").innerHTML = "Error checking username";
    }
};

// Listen for #userName input
let timeout;
id("userName").addEventListener("input", async (e) => {
    const username = e.target.value;

    // Wait for the user to finish typing using a setTimeout
    clearTimeout(timeout);

    timeout = setTimeout(async () => {
        fetchUsernameCheck(username);
    }, 1000);
});