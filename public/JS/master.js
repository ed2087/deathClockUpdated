function showPassword_(){const e=document.querySelectorAll('input[type="password"]');e.forEach(e=>{e.type="password"===e.type?"text":"password"})}function handleScroll(){const e=window.scrollY||document.documentElement.scrollTop;largerNavImgWrap.style.display=0===e?"block":"none"}console.log("master.js loaded");const id_=e=>document.getElementById(e),class_=e=>document.getElementsByClassName(e),tag_=e=>document.getElementsByTagName(e),query_=e=>document.querySelector(e),queryAll_=e=>document.querySelectorAll(e),create_=e=>document.createElement(e),getCurrentYear=()=>{const e=new Date,n=`${e.getFullYear()}-${e.getMonth()+1}-${e.getDate()}`;return n},loadingMold_dotts='\n    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>\n',loadingMold_grid='\n  <div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>\n',fetch_=async(e,n,o)=>{const t=await fetch(e,{method:n,body:o}),a=await t.json();return a},sendJson=async(e,n,o)=>{const t=await fetch(e,{method:n,body:JSON.stringify(o),headers:{"Content-Type":"application/json"}}),a=await t.json();return a};let menuOpen=!1;const slideRight="slide-right",slideLeft="slide-left",nav=id_("navLargeScreens"),burgerButton=id_("nav_small_burgerButton"),icons=queryAll_(".icon"),navLinks=queryAll_(".navLinks_"),toggleMenu=e=>{"open_dropdown"!==e.target.id&&(nav.classList.toggle(slideRight,!menuOpen),nav.classList.toggle(slideLeft,menuOpen),menuOpen=!menuOpen)};burgerButton.addEventListener("click",toggleMenu),navLinks.forEach(e=>{e.addEventListener("click",e=>{menuOpen&&toggleMenu(e)})}),window.addEventListener("resize",()=>{window.innerWidth>1300&&nav.classList.remove(slideRight,slideLeft)}),icons.forEach(e=>{e.addEventListener("click",()=>{e.classList.toggle("open")})}),window.addEventListener("scroll",e=>{menuOpen&&(toggleMenu(e),icons.forEach(e=>{e.classList.remove("open")}))});const globalMessageTemplate=(e,n,o)=>{const t='\n      <textarea name="reason" id="globalMessage__form_textarea" placeholder="Please enter a reason"></textarea>\n  ';let a="";return"textarea"===o&&(a=t),`\n    <div id="globalMessage">    \n        \n        <div id="globalMessage__content">\n            <div id="globalMessage__title">${e}</div>\n            <div id="globalMessage__message">${n}</div>\n\n            ${a}\n\n            <div id="globalMessage__buttons">\n                <button class="call_to_action_red" id="globalMessage__button">OK</button>\n            </div>\n        </div>\n\n    </div>\n  `},globalMessage=(e,n)=>{console.log("globalMessage()");const o=globalMessageTemplate(e,n);document.body.insertAdjacentHTML("beforeend",o);const t=id_("globalMessage"),a=id_("globalMessage__button");a.addEventListener("click",()=>{t.remove()})},globalTextareaTemplate=(e,n,o)=>{id_("csrf").value;return`\n    <div id="globalMessage">    \n        \n        <div id="globalMessage__content">\n            <div id="globalMessage__title">${e}</div>\n            <div id="globalMessage__message">${n}</div>\n\n            <textarea name="reason" id="globalMessage__form_textarea" placeholder="Please enter a reason"></textarea>\n\n            <div id="globalMessage__buttons">\n                <button class="call_to_action_red" id="globalMessage_Textarea_button">OK</button>\n            </div>\n\n        </div>\n\n    </div>\n  `},largerNavImgWrap=id_("largerNav_img_wrap");window.addEventListener("scroll",handleScroll),console.log("%cWelcome to HorrorHub.com","font-size: 24px; color: #ff4500; font-weight: bold;"),console.log("%c💀 Created by 404-notfound | Contact: help.terrorhub@gmail.com","font-size: 16px; color: #fac536;"),console.log("%c💀 Discover a world of spine-chilling horror content and supernatural thrills!","font-size: 16px; color: #fac536;"),console.log("%c💀 Explore haunted tales, eerie mysteries, and the darkest corners of the horror genre.","font-size: 16px; color: #fac536;"),console.log("%c💀 Dare to enter and embrace the fear! Enjoy your spooky journey with HorrorHub.","font-size: 16px; color: #fac536;");