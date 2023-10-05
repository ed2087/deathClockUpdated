
console.log("submission.js loaded");


const sendData = async (e) => {

    e.preventDefault();    
  
    const form = document.querySelector('#submission_form');

    // Get all form elements
    const elements = form.querySelectorAll('input, textarea, select, checkbox, radio');

    // Create an object to store the form data
    const formData = {};

    // Loop through all form elements and get their values
    elements.forEach(element => {
        formData[element.name] = element.value;
    });

    // Send the form data to the server fetch_
    let url = `/terrorTales/submission`;
    let method = "POST";
    let body = formData;
    console.log(url, method, body);
    try {

        const response = await fetch(url, {
            method: method,
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log(data);

        if (data.status === 200) {
            window.location.href = "/terrorTales";
        } else {
            alert(data.message);
        }
        
    } catch (error) {
        console.log(error);
    }

};

