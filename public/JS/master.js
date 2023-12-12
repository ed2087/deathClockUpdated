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


