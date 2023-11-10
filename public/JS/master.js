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

//true = open menu / false = close menu
let menuOpen = false; 

//animation styles
const slideRight = 'slide-right';
const slideLeft = 'slide-left';


// Toggle menu
const toggleMenu = () => {

  const nav = document.getElementById('navLargeScreens');

  if (menuOpen) {
    nav.classList.remove(slideRight); 
    nav.classList.add(slideLeft);
    menuOpen = false;
  } else {
    nav.classList.remove(slideLeft);
    nav.classList.add(slideRight);
    menuOpen = true;
  }

}

// Close menu if scroll when open
window.addEventListener('scroll', () => {
  if (menuOpen) {
    toggleMenu();
  }
});

// Toggle menu on burger click
document.getElementById('nav_small_burgerButton').addEventListener('click', toggleMenu);

// if screen is bigger than 768px, remove animation classes
window.addEventListener('resize', () => {
    if (window.innerWidth > 1300) {
        nav.classList.remove(slideRight);
        nav.classList.remove(slideLeft);
    }
});


const icons = document.querySelectorAll('.icon');
icons.forEach (icon => {  
    icon.addEventListener('click', (event) => {
        icon.classList.toggle("open");        
    });
});