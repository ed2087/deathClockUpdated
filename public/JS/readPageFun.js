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
        id_("upvoteCounter").innerHTML = data.message;
    }else{
        alert(data.message);
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
       alert(data.message);
    }else{
        alert(data.message);
    }


};







