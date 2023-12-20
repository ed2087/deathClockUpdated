//ES6
console.log('master.js loaded');

const id_ = (id) => document.getElementById(id);
const class_ = (className) => document.getElementsByClassName(className);
const tag_ = (tag) => document.getElementsByTagName(tag);
const query_ = (query) => document.querySelector(query);
const queryAll_ = (query) => document.querySelectorAll(query);
const create_ = (element) => document.createElement(element);



const getCurrentYear = () => {
  const currentDate = new Date();
  const currentDate_ = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
    return currentDate_;
}



// GLOBAL HTML MOLDS

const loadingMold_dotts = `
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
`;

const loadingMold_grid = `
  <div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
`;


//fetch
const fetch_ = async (url, method, body) => {
    const response = await fetch(url, {
        method: method,
        body: body
    });
    const data = await response.json();
    return data;
};


//send json
const sendJson = async (url, method, body) => {
    const response = await fetch(url, {
        method: method,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
};





//////////////////// nav burger function /////////////////////////

// Initial menu state
let menuOpen = false;

// Animation styles
const slideRight = 'slide-right';
const slideLeft = 'slide-left';

// DOM elements
const nav = id_('navLargeScreens');
const burgerButton = id_('nav_small_burgerButton');
const icons = queryAll_('.icon');
const navLinks = queryAll_('.navLinks_');

const toggleMenu = (e) => {

  // check if linked clicked is #open_dropdown then return
  if (e.target.id === 'open_dropdown') return;

  nav.classList.toggle(slideRight, !menuOpen);
  nav.classList.toggle(slideLeft, menuOpen);
  menuOpen = !menuOpen;
 };
 
 burgerButton.addEventListener('click', toggleMenu);

//  close menu when click on navLinks
navLinks.forEach(navLink => {
  navLink.addEventListener('click', (e) => {
    if (menuOpen) {
      toggleMenu(e);
    }
  });
});
 
 window.addEventListener('resize', () => {
  if (window.innerWidth > 1300) {
     nav.classList.remove(slideRight, slideLeft);
  }
 });
 
 icons.forEach(icon => {
  icon.addEventListener('click', () => {
     icon.classList.toggle('open');
  });
 });
 
 window.addEventListener('scroll', (e) => {
  if (menuOpen) {
     toggleMenu(e);
     icons.forEach(icon => {
       icon.classList.remove('open');
     });
  }
 });


////////////////////// DISPLAY PASSWORD /////////////////////////

function showPassword_() {
  const passwordInputs = document.querySelectorAll('input[type="password"]');

  passwordInputs.forEach((input) => {
    input.type = (input.type === "password") ? "text" : "password";
  });

}

////////////////////// GLOBAL MESSAGE /////////////////////////


const globalMessageTemplate = (title,message,extra) => {


  const textArea = `
      <textarea name="reason" id="globalMessage__form_textarea" placeholder="Please enter a reason"></textarea>
  `;


  let extraContent = '';


  if (extra === 'textarea') extraContent = textArea;


  return `
    <div id="globalMessage">    
        
        <div id="globalMessage__content">
            <div id="globalMessage__title">${title}</div>
            <div id="globalMessage__message">${message}</div>

            ${extraContent}

            <div id="globalMessage__buttons">
                <button class="call_to_action_red" id="globalMessage__button">OK</button>
            </div>
        </div>

    </div>
  `; 

};



const globalMessage = (title,message) => {
  console.log('globalMessage()');
  
    const globalMessage = globalMessageTemplate(title,message);
  
    //insert globalMessage in body
    document.body.insertAdjacentHTML('beforeend', globalMessage);

    //select globalMessage
    const globalMessage_ = id_('globalMessage');

    //select button
    const globalMessageButton = id_('globalMessage__button');

    //add event listener to button
    globalMessageButton.addEventListener('click', () => {
      globalMessage_.remove();
    });
  
};




const globalTextareaTemplate = (title,message,url) => {

  const csrf = id_("csrf").value;

  return `
    <div id="globalMessage">    
        
        <div id="globalMessage__content">
            <div id="globalMessage__title">${title}</div>
            <div id="globalMessage__message">${message}</div>

            <textarea name="reason" id="globalMessage__form_textarea" placeholder="Please enter a reason"></textarea>

            <div id="globalMessage__buttons">
                <button class="call_to_action_red" id="globalMessage_Textarea_button">OK</button>
            </div>

        </div>

    </div>
  `; 

};



////////////////////// WELCOME /////////////////////////
console.log(
  '%cWelcome to HorrorHub.com',
  'font-size: 24px; color: #ff4500; font-weight: bold;'
);
console.log(
  '%c💀 Created by 404-notfound | Contact: help.terrorhub@gmail.com',
  'font-size: 16px; color: #fac536;'
);
console.log(
  '%c💀 Discover a world of spine-chilling horror content and supernatural thrills!',
  'font-size: 16px; color: #fac536;'
);
console.log(
  '%c💀 Explore haunted tales, eerie mysteries, and the darkest corners of the horror genre.',
  'font-size: 16px; color: #fac536;'
);
console.log(
  '%c💀 Dare to enter and embrace the fear! Enjoy your spooky journey with HorrorHub.',
  'font-size: 16px; color: #fac536;'
);