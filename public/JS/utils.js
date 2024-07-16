console.log('utils.js is connected');

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



// FOLLOW AND UNFOLLOW USER FUNCTIONS

let followButton_template = `<button id="unfollow_subBTN" class="follow_btn call_to_action_red">Unfollow</button>`;
let unfollowButtin_template = `<button id="follow_subBTN" class="follow_btn call_to_action_red">Follow</button>`;

const followUser = async (event) => {
    console.log("follow")
    event.preventDefault(); // Prevent form submission/refresh

    try {
        // Get CSRF token
        const csrfToken = document.getElementById("csrf").value;
        const username = document.querySelector(".username").innerHTML;

        // Make the fetch request to follow the user
        const response = await fetch(`/profile/u/${username}/follow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        });
        const result = await response.json();
        
        // Check if the response is successful
        if (result.status == "ok") {
            globalMessage("Follow", result.message, null);
            id_("followers_tick").innerHTML = result.numFollowers;

            // Change the button to unfollow
            id_("follow_subBTN").outerHTML = followButton_template;

            //listen for unfollow button
            if(id_("unfollow_subBTN")) id_("unfollow_subBTN").addEventListener("click", unfollowUser);

        } else {
            globalMessage("Follow", result.message, null);
        }
    } catch (error) {
        console.error("Error occurred while following the user:", error);
        globalMessage("Follow", "An error occurred while following the user. Please try again later.", null);
    }
};

// Assuming you have a follow button with class "follow_subBTN"
if(id_("follow_subBTN")) id_("follow_subBTN").addEventListener("click", followUser);


// unfollow user
const unfollowUser = async (event) => {
    console.log("unfollow")
    event.preventDefault(); // Prevent form submission/refresh

    try {
        // Get CSRF token
        const csrfToken = document.getElementById("csrf").value;
        const username = document.querySelector(".username").innerHTML;

        // Make the fetch request to follow the user
        const response = await fetch(`/profile/u/${username}/unfollow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        });
        const result = await response.json();
        
        // Check if the response is successful
        if (result.status == "ok") {
            globalMessage("Unfollow", result.message, null);
            id_("followers_tick").innerHTML = result.numFollowers;

            // Change the button to follow
            id_("unfollow_subBTN").outerHTML = unfollowButtin_template;
            //listen
            if(id_("follow_subBTN")) id_("follow_subBTN").addEventListener("click", followUser);
            
        } else {
            globalMessage("Unfollow", result.message, null);
        }
    } catch (error) {
        console.error("Error occurred while unfollowing the user:", error);
        globalMessage("Unfollow", "An error occurred while unfollowing the user. Please try again later.", null);
    }
};

// Assuming you have a follow button 
if(id_("unfollow_subBTN")) id_("unfollow_subBTN").addEventListener("click", unfollowUser);