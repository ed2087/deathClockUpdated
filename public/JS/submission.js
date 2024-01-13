console.log("submission.js loaded");const sendData=async e=>{e.preventDefault();const t=document.querySelector("#submission_form").querySelectorAll("input, textarea, select, checkbox, radio"),r={};t.forEach((e=>{r[e.name]=e.value}));const i=document.querySelectorAll('input[name="socialMedia"]'),s=[];i.forEach((e=>{s.push(e.value)})),r.socialMedia=s;const o=document.querySelectorAll('input[name="categories"]:checked'),l=[];o.forEach((e=>{l.push(e.value)})),r.categories=l;document.querySelectorAll('input[type="radio"]').forEach((e=>{e.checked&&(r[e.name]=e.value)}));document.querySelectorAll("select").forEach((e=>{r[e.name]=e.value}));document.querySelectorAll("textarea").forEach((e=>{r[e.name]=e.value}));let a=r;try{const e=await fetch("/terrorTales/submission",{method:"POST",body:JSON.stringify(a),headers:{"Content-Type":"application/json"}}),t=await e.json();200===t.status?window.location.href="/terrorTales":alert(t.message)}catch(e){console.log(e)}},alertUserText=(e,t)=>{let r=id_(e).value;r.length>t?(r=r.slice(0,t),id_(e).value=r,id_(e).style.color="red",id_("storySubmit_form").disabled=!0):(id_(e).style.color="black",id_("storySubmit_form").disabled=!1)},handleCharacterCount=(e,t)=>{id_(e).addEventListener("input",(()=>{alertUserText(e,t)}))};async function isUrlSecured(e){try{new URL(e);return/^https:\/\//.test(e)}catch(e){return!1}}function validateUrl(){let e=id_("website").value;setTimeout((async()=>{await isUrlSecured(e)?id_("website").style.color="green":id_("website").style.color="red"}),1e3)}handleCharacterCount("storySummary",400),handleCharacterCount("storyTitle",80),handleCharacterCount("storyText",1e4),id_("website").addEventListener("keyup",validateUrl),id_("website").addEventListener("change",validateUrl);let isTermsVisible=!1;function toggleTerms(e){e.preventDefault();let t=id_("termsAndConditions"),r=id_("showTermsLink");isTermsVisible=!isTermsVisible,t.style.display=isTermsVisible?"block":"none",r.textContent=isTermsVisible?"Hide Terms and Conditions":"Show Terms and Conditions",r.style.color=isTermsVisible?"":"red",isTermsVisible?t.focus():r.focus()}id_("serviceDate").innerHTML=getCurrentYear();const checkBookTitle=async()=>{let e=id_("storyTitle").value;if(""===e)return;if(!/^[a-zA-Z0-9 ]*$/.test(e))return id_("storyTitle").style.color="red",id_("storySubmit_form").disabled=!0,void alert("Only letters and numbers are allowed in the title");id_("storyTitle").style.color="green",id_("storySubmit_form").disabled=!1;let t=`/terrorTales/checkBookTitle/${e}`;const r=id_("csrf").value;try{const e=await fetch(t,{method:"GET",headers:{"csrf-token":r}}),i=await e.json();200===i.status&&(id_("storyTitle").style.color="green",id_("storySubmit_form").disabled=!1),400===i.status&&(id_("storyTitle").style.color="red",id_("storySubmit_form").disabled=!0,alert("Book title already exists"))}catch(e){console.log(e)}};let timer=null;id_("storyTitle").addEventListener("keyup",(()=>{clearTimeout(timer),timer=setTimeout(checkBookTitle,1e3)}));
