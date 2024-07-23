
console.log("submission.js loaded");

const allowedDomains = [
    "imgur.com",
    "tumblr.com",
    "flickr.com",
    "pinterest.com",
    "photobucket.com"
];

const allowedFormats = [".jpg", ".png", ".jpeg", ".gif"];


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


//check when storySubmit_form buttin is sumbitted it can only be submitted by clicking the button not any other way
id_("storySubmit_form").addEventListener("click", (e) => {

    e.preventDefault();
    sendData(e);

});



const alertUserCharacters = (id, maxCharacters) => {
    let text = id_(id).value;
    let characterCount = text.length;

    if (characterCount > maxCharacters) {
        text = text.slice(0, maxCharacters);
        id_(id).value = text; // Update value after truncating

        id_(id).style.color = "red";
        id_("storySubmit_form").disabled = true;
    } else {
        id_(id).style.color = "black";
        id_("storySubmit_form").disabled = false;
    }
};

// Function to handle character count for a textarea
const handleCharacterCount = (elementId, maxCharacters) => {
    const textarea = id_(elementId);

    const handleInput = () => {
        alertUserCharacters(elementId, maxCharacters);
    };

    textarea.addEventListener("keyup", handleInput);
    textarea.addEventListener("change", handleInput);
    textarea.addEventListener("input", handleInput);
};

// Listen to #storySummary textarea and count characters
handleCharacterCount("storySummary", 400);

// Listen to #storyTitle textarea and count characters
handleCharacterCount("storyTitle", 50);

// Listen to #storyText textarea and count characters 20602 characters or 3000 words
handleCharacterCount("storyText", 20602);



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



// check book title if it exists in database
const checkBookTitle = async () => {    


        let bookTitle = id_("storyTitle").value;


        //if bookTitle is empty return
        if(bookTitle === "") return;


        //dont allow any type of special characters in title only letters and numbers
        let regex = /^[a-zA-Z0-9’' -]*$/;
        if (!regex.test(bookTitle)) {

            id_("storyTitle").style.color = "red";
            //disable submit button
            id_("storySubmit_form").disabled = true;

            //alert user
            globalMessage("Error","Only letters and numbers are allowed in the title");
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
                globalMessage("Book title already exists","Please choose another title");
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




const validateImageUrl = () => {
    const url = document.getElementById("backgroundUrl").value.trim();
    
    if (url === "") {
        return;
    }

    // Check if the URL belongs to one of the allowed domains
    const isValidDomain = allowedDomains.some(domain => url.includes(domain));

    // Check if the URL ends with one of the allowed formats
    const isValidFormat = allowedFormats.some(format => url.endsWith(format));

    if (isValidDomain && isValidFormat) {
        document.getElementById("backgroundUrl").style.color = "green";
        document.getElementById("storySubmit_form").disabled = false;
    } else {
        document.getElementById("backgroundUrl").style.color = "red";
        document.getElementById("storySubmit_form").disabled = true;
    }
};

// Listen to #backgroundUrl textarea and count characters but wait until the user stops typing
document.getElementById("backgroundUrl").addEventListener("keyup", validateImageUrl);
document.getElementById("backgroundUrl").addEventListener("input", validateImageUrl);
document.getElementById("backgroundUrl").addEventListener("change", validateImageUrl);






document.addEventListener('DOMContentLoaded', () => {
    const tagsInput = id_('tagsInput');
    const tagsInputFake = id_('tagsInput_fake');
    const tagsContainer = id_('tagsContainer');

    const extraTagsInput = id_('extraTagsInput');
    const extraTagsInputFake = id_('extraTagsInput_fake');
    const extraTagsContainer = id_('extraTagsContainer');

    const createTagBox = (tag, container, input) => {
        const tagBox = create_('div');
        tagBox.className = 'tag-box';
        tagBox.textContent = tag;

        const removeBtn = create_('span');
        removeBtn.textContent = '×';
        removeBtn.className = 'remove-tag';
        removeBtn.onclick = () => {
            container.removeChild(tagBox);
            updateHiddenInput(container, input);
        };

        tagBox.appendChild(removeBtn);
        return tagBox;
    };

    const updateHiddenInput = (container, input) => {
        const tags = [];
        container.querySelectorAll('.tag-box').forEach(tagBox => {
            tags.push(tagBox.textContent.slice(0, -1)); // Remove the '×' character
        });
        input.value = tags.join(',');
    };

    const addTag = (inputFake, container, input,event) => {
        const tag = inputFake.value.trim().replace(/,$/, ''); // Remove comma at the end if present
        if (tag) {
            const tagBox = createTagBox(tag, container, input);
            container.appendChild(tagBox);
            inputFake.value = '';
            updateHiddenInput(container, input);
            inputFake.focus();
        }
    };

    const handleKeyPress = (event, inputFake, container, input) => {
        if ((event.key === ',' || event.key === 'Enter') && event.target === inputFake) {            
            event.preventDefault();
            addTag(inputFake, container, input);
        }
    };

    tagsInputFake.addEventListener('keyup', (event) => handleKeyPress(event, tagsInputFake, tagsContainer, tagsInput));
    tagsInputFake.addEventListener('blur', () => addTag(tagsInputFake, tagsContainer, tagsInput));

    extraTagsInputFake.addEventListener('keyup', (event) => handleKeyPress(event, extraTagsInputFake, extraTagsContainer, extraTagsInput));
    extraTagsInputFake.addEventListener('blur', () => addTag(extraTagsInputFake, extraTagsContainer, extraTagsInput));
});
