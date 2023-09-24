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