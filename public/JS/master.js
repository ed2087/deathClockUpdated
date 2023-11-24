//ES6
console.log('master.js loaded');

const id_ = (id) => document.getElementById(id);
const class_ = (className) => document.getElementsByClassName(className);
const tag_ = (tag) => document.getElementsByTagName(tag);
const query_ = (query) => document.querySelector(query);
const queryAll_ = (query) => document.querySelectorAll(query);
const create_ = (element) => document.createElement(element);



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

const toggleMenu = () => {
  nav.classList.toggle(slideRight, !menuOpen);
  nav.classList.toggle(slideLeft, menuOpen);
  menuOpen = !menuOpen;
 };
 
 burgerButton.addEventListener('click', toggleMenu);

//  close menu when click on navLinks
navLinks.forEach(navLink => {
  navLink.addEventListener('click', () => {
    if (menuOpen) {
      toggleMenu();
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
 
 window.addEventListener('scroll', () => {
  if (menuOpen) {
     toggleMenu();
     icons.forEach(icon => {
       icon.classList.remove('open');
     });
  }
 });


////////////////////// DISPLAY PASSWORD /////////////////////////

function showPassword_() {
  var x = document.getElementsByName("password")[0];
  x.type = x.type === "password" ? "text" : "password";
};

