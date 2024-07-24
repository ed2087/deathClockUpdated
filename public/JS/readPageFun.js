console.log("readPageFun.js");



const upvoteFetch = async () => {

    // csrf token
    const csrfToken = id_("csrf").value;
    // post id
    const postId = id_("postId").value;

    //add post post id and csrd to url
    const url = `/terrorTales/upvote?storyID=${postId}&token=${csrfToken}`;

    // fetch add post id and csrf token to url we are using crud operation so use get 
    const response = await fetch(url, {
        method: "GET",
    });

    // get data from response
    const data = await response.json();

    //check if status is ok
    if (data.status === "ok") {
        //update upvote count
        const upvoteCounter = queryAll_(".upvoteCounter");
        //loop through all .upvoteCounter
        for (let i = 0; i < upvoteCounter.length; i++) {
            //update .upvoteCounter
            upvoteCounter[i].innerHTML = data.message;
        }

        // disable upvote button
        id_("upVote").disabled = true;
        //alert user
        //title, message
        globalMessage("Upvote", "Thank you for voting!", null);
    }else{         
        globalMessage("Upvote", data.message, null);
        // disable upvote button
        id_("upVote").disabled = true;
    }

};



const reportFun = async () => {

    // csrf token
    const csrfToken = id_("csrf").value;
    // post id
    const postId = id_("postId").value;

    //prompt user for reason
    const reason = prompt("Please enter a reason for reporting this story");

    //check if reason is empty or cancel return
    if (reason === "" || reason === null) {
        return;
    }

    //add post post id and csrd to url
    const url = `/terrorTales/report?storyID=${postId}&token=${csrfToken}&reason=${reason}`;

    // fetch add post id and csrf token to url we are using crud operation so use get 
    const response = await fetch(url, {
        method: "GET",
    });

    // get data from response
    const data = await response.json();

    //check if status is ok
    if (data.status === "ok") {
       globalMessage("Report", data.message, null);
    }else{
        globalMessage("Report", data.message, null);
    }


};

const aTagMold = (url) => {
    const domain = extractDomain(url);
    return `<a href="${url}" target="_blank" style="color:#eb6612;">${domain}</a>`;
}

const extractDomain = (url) => {
    const match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
        return match[2];
    } else {
        return null;
    }
}

const processParagraphs = () => {
    const paragraphs = document.querySelectorAll('.sentence_p');

    paragraphs.forEach(paragraph => {
        const links = paragraph.querySelectorAll('a');

        let urls = findUrls(paragraph.innerHTML);

        if (urls.length > 0) {
            urls.forEach(url => {
                paragraph.innerHTML = paragraph.innerHTML.replace(url, aTagMold(url));
            });
        }
    });
};

const findUrls = (text) => {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
};

window.onload = processParagraphs;



document.addEventListener('DOMContentLoaded', async function() {


    // Get CSRF token and post ID
    const csrfToken = document.getElementById("csrf").value;
    const postId = document.getElementById("postId").value;

    const audioContainer = document.getElementById('audio_container');
    const loadingAnimation = document.getElementById('loading_animation');

    try {
        const response = await fetch(`/terrorTales/generate-audio/${postId}`, {
            method: 'GET',
            headers: {
                'CSRF-Token': csrfToken
            }
        });
        const data = await response.json();
        
        if (data.audioLink) {
            const audioElement = document.getElementById('story_audio');
            audioElement.src = data.audioLink;

            loadingAnimation.classList.add('hidden');
            audioContainer.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading audio:', error);
        loadingAnimation.textContent = 'Error loading audio';
    }

    const audioElement = document.getElementById('story_audio');
    const playButton = document.getElementById('play_audio');
    const pauseButton = document.getElementById('pause_audio');
    const stopButton = document.getElementById('stop_audio');
    const seekBar = document.getElementById('seek_bar');
    const volumeControl = document.getElementById('volume_control');

    playButton.addEventListener('click', function() {
        audioElement.play();
    });

    pauseButton.addEventListener('click', function() {
        audioElement.pause();
    });

    stopButton.addEventListener('click', function() {
        audioElement.pause();
        audioElement.currentTime = 0;
        seekBar.value = 0;
    });

    audioElement.addEventListener('timeupdate', function() {
        const value = (audioElement.currentTime / audioElement.duration) * 100;
        seekBar.value = value;
    });

    seekBar.addEventListener('input', function() {
        const time = (seekBar.value / 100) * audioElement.duration;
        audioElement.currentTime = time;
    });

    volumeControl.addEventListener('input', function() {
        audioElement.volume = volumeControl.value;
    });



    // add view count
    const storyReadTime = parseInt(id_("storyReadTime").value); 
    const slug = id_("storySlug").value;
    const userActive = id_("isUserActive").value; 

    if (isNaN(storyReadTime)) {
        console.error('Invalid story read time:', id_("storyReadTime").value);
        return;
    }

    // Add 1 minute to the read time and convert to milliseconds
    const readTime = storyReadTime * 60 * 1000 * 0.8; // Convert to milliseconds

    if(userActive !== "false"){

        setTimeout(() => {

            console.log('Timeout reached, sending request to add to read list');
            fetch(`/terrorTales/addToReadList/${slug}`, {
                method: 'GET',
                headers: {
                    'CSRF-Token': csrfToken,
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
                .then(data => {
                    console.log('Response received:', data); // Log response
                    if (data.status === 200) {
                        //readCount
                        id_("readCount").innerHTML = data.readCount;
                    } else {
                        console.log('Error:', data.message);
                    }
                }).catch(error => console.error('Fetch error:', error));
        }, readTime);

    };//end if

});








