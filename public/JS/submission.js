
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


const alertUserText = (id, Textlength) =>{

    let text = id_(id).value;
    let textLength = text.length;

    if(textLength > Textlength){
        id_(id).style.color = "red";
        id_("storySubmit_form").disabled = true;
    }else{
        id_(id).style.color = "black";
        id_("storySubmit_form").disabled = false;
    }

};

// listen to #storySummary textarea and count characters
id_("storySummary").addEventListener("keyup", () => {
    alertUserText("storySummary", 400);
});


//storyTitle
id_("storyTitle").addEventListener("keyup", () => {
    alertUserText("storyTitle", 80);
});



// check if #website is a valid url

async function isUrlSecured(url) {
    try {
        // Use the URL constructor to validate the URL
        new URL(url);
        // Check if the URL starts with "https://"
        const securedRegex = /^https:\/\//;
        return securedRegex.test(url);
    } catch (error) {
        // If an error is caught, the URL is invalid
        return false;
    }
}

function validateUrl() {
    let url = id_("website").value;

    // wait till user stops typing the check if url is valid
    setTimeout(async () => {
        if (await isUrlSecured(url)) {
            id_("website").style.color = "green";
        } else {
            id_("website").style.color = "red";
        }
    }, 1000);
}

id_("website").addEventListener("keyup", validateUrl);
id_("website").addEventListener("change", validateUrl);



// Get the terms div and show/hide link by their IDs


// Function to toggle visibility of terms
let isTermsVisible = false; // Global variable to track the visibility state of terms

function toggleTerms(event) {
    // Prevent form submission when the button is clicked
    event.preventDefault();

    let termsDiv = id_('termsAndConditions');
    let showTermsLink = id_('showTermsLink');

    // Toggle the visibility state
    isTermsVisible = !isTermsVisible;

    // Update the display property based on the visibility state
    termsDiv.style.display = isTermsVisible ? 'block' : 'none';

    // Toggle the text and color of the button
    showTermsLink.textContent = isTermsVisible ? 'Hide Terms and Conditions' : 'Show Terms and Conditions';
    showTermsLink.style.color = isTermsVisible ? '' : 'red';

    // Set focus on the appropriate element
    if (isTermsVisible) {
        termsDiv.focus();
    } else {
        showTermsLink.focus();
    }
}


// get current date
id_("serviceDate").innerHTML = getCurrentYear();




// check book title if it exists in database
const checkBookTitle = async () => {    


        let bookTitle = id_("storyTitle").value;


        //if bookTitle is empty return
        if(bookTitle === "") return;


        //dont allow any type of special characters in title only letters and numbers
        let regex = /^[a-zA-Z0-9 ]*$/;
        if (!regex.test(bookTitle)) {

            id_("storyTitle").style.color = "red";
            //disable submit button
            id_("storySubmit_form").disabled = true;

            //alert user
            alert("Only letters and numbers are allowed in the title");

            return;
        }else{
            id_("storyTitle").style.color = "green";
            id_("storySubmit_form").disabled = false;
        }


        let url = `/terrorTales/checkBookTitle/${bookTitle}`;
    
        const csrf = id_("csrf").value;
    
        try {
    
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "csrf-token": csrf
                }
            });

            const data = await response.json();
    
            if (data.status === 200) {
                id_("storyTitle").style.color = "green";
                //enable submit button
                id_("storySubmit_form").disabled = false;                
            }
            
            if (data.status === 400) {
                id_("storyTitle").style.color = "red";
                //disable submit button
                id_("storySubmit_form").disabled = true;
                //alert user
                alert("Book title already exists");
            }
    
        } catch (error) {
            console.log(error);
        }
    
};


// listen to #bookTitle textarea and count characters but wait till user stops typing
let timer = null;
id_("storyTitle").addEventListener("keyup", () => {
    clearTimeout(timer);
    timer = setTimeout(checkBookTitle, 1000);
});

