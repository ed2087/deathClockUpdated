
console.log("submission.js loaded");


const sendData = async (e) => {

    e.preventDefault();    
  
    const form = document.querySelector('#submission_form');

    console.log(form);   

    // Get all form elements
    const elements = form.querySelectorAll('input, textarea, select, checkbox, radio');

    // Create an object to store the form data
    const formData = {};

    // Loop through all form elements and get their values
    elements.forEach(element => {
        formData[element.name] = element.value;
    });

    //get all by name socialMedia inputs and store in array
    const socialMedia = document.querySelectorAll('input[name="socialMedia"]');
    const socialMediaArray = [];
    socialMedia.forEach(socialMedia => {
        socialMediaArray.push(socialMedia.value);
    });
    
    //add socialMedia array to formData
    formData['socialMedia'] = socialMediaArray;

    //get all answers from checkboxesby name categories and store in array
    const checkboxes = document.querySelectorAll('input[name="categories"]:checked');
    const categories = [];
    checkboxes.forEach(checkbox => {
        categories.push(checkbox.value);
    });

    //add categories array to formData
    formData['categories'] = categories;

    //get all answers from radio buttons
    const radios = document.querySelectorAll('input[type="radio"]');
    //loop through radios and get values
    radios.forEach(radio => {
        if(radio.checked){
            formData[radio.name] = radio.value;
        }
    });

    //get all answers from select
    const selects = document.querySelectorAll('select');
    //loop through selects and get values
    selects.forEach(select => {
        formData[select.name] = select.value;
    });

    //get all answers from textareas
    const textareas = document.querySelectorAll('textarea');
    //loop through textareas and get values
    textareas.forEach(textarea => {
        formData[textarea.name] = textarea.value;
    });

    // Send the form data to the server fetch_
    let url = `/terrorTales/submission`;
    let method = "POST";
    let body = formData;
    
    try {

        const response = await fetch(url, {
            method: method,
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();       
        

        if (data.status === 200) {
            window.location.href = "/terrorTales";
        } else {
            alert(data.message);
        }
        
    } catch (error) {
        console.log(error);
    }

};

