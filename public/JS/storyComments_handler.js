document.addEventListener('DOMContentLoaded', function () {

    const commentForm = id_('commentForm');
    const commentText = id_('commentText');
    const commentsContainer = id_('comments');
    const storyId = id_('storyId_cooments').value; // Replace with your storyId
    const csrfToken = id_('csrf_comments').value;
    const UserID = id_('userId_cooments').value;
  
    //other global variables
    let alloWToFocuonEle = false;

    // Render comment
    const renderComment = (comment, ele) => {
      const formattedDate = new Date(comment.createdAt);
      const shortDate = formattedDate.toLocaleDateString();
      const shortTime = formattedDate.toLocaleTimeString();
      
      ele.innerHTML += `
        <div class="comment_wrap" id="comment_W${comment._id}">

          <div class="inner_commentWrap">

                <div class="comment_header">
                  <p><span class="message_specialCH">@</span>${comment.userName} <span class="message_specialCH">·</span> ${shortDate} <span class="message_specialCH">·</span> ${shortTime}</p>
                </div>

                <div class="comment_text">${comment.commentText}</div>

                <div class="comment_buttonWrap">
                  ${UserID !== "" ?
                      `<button class="reply" data-id="${comment._id}" id="replyBTN_${comment._id}">Reply</button>` :
                  ''}
                  ${comment.userId === UserID ?
                    `<button class="delete" data-id="${comment._id}" id="deleteBTN_${comment._id}">Delete</button>` :
                    ''}
                </div>

                <div class="reply_formOutter_wrap" id="replyForm_${comment._id}"></div>

          </div>

          <div class="replies" id="replies_${comment._id}"></div>

        </div>
      `;


        //scroll to view the comment smoothly
        if(alloWToFocuonEle !== false){
            const comment_W = id_('comment_W' + comment._id);
            comment_W.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }


      // Listen for reply button clicks
        const replyButtons = document.querySelectorAll('.reply');
        replyButtons.forEach(button => {
            button.addEventListener('click', createReplyForm);
        });


        // Listen for delete button clicks
        const deleteButtons = document.querySelectorAll('.delete');
        deleteButtons.forEach(button => {
          button.addEventListener('click', deleteCommentOrReply);
        });

    };
  
    // create a reply form
    const createReplyForm = (e) => {
      const parentId = e.target.getAttribute('data-id');

      // if the user is not logged in, the form will not be displayed
    if (UserID === undefined) {
        alert("Please login to reply to a comment");
        return;
    }

      const form = `
        <form class="reply_form" data-parentId="${parentId}" id="replyForm_${parentId}">
          <textarea name="replyText" id="replyText_W${parentId}" placeholder="Reply To Comment" required></textarea>
          <button type="submit" style="color:green;">Reply</button>
        </form>
      `;



      // append to the replies container using the parentId
      const repliesContainer = id_('replyForm_' + parentId);
      // console.log(repliesContainer, "repliesContainer");
      repliesContainer.innerHTML += form;
      // display none the reply button using the parentId
      id_('replyBTN_' + parentId).style.display = 'none';

      const replyForm = id_('replyForm_' + parentId);
      replyForm.addEventListener('submit', handleReply);

      //focus on the reply text area
        const replyText_W = id_('replyText_W' + parentId);
        replyText_W.focus();
      
    };
  

    //handle reply form submission
    const handleReply = async (e) => {

      e.preventDefault();
      const replyText = e.target.replyText.value;
      const parentId = e.target.getAttribute('data-parentId');
      
      try {
        const response = await fetch(`/storyReplyMessage/${storyId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken
          },
          body: JSON.stringify({
            userId: UserID,
            replyText: replyText,
            parentCommentId: parentId
          })
        });
  
        if (!response.ok) {
          alert("Please login to reply to a comment");
          console.log(response, "response");
        }
  
        const data = await response.json();

        // console.log(data, "reply data");
        renderComment(data, id_('replies_' + parentId));
        //display the reply button
        id_('replyBTN_' + parentId).style.display = 'block';

        //remove the form
        e.target.remove();
        
        // Listen for reply button clicks
        const replyButtons = document.querySelectorAll('.reply');
        replyButtons.forEach(button => {
          button.addEventListener('click', createReplyForm);
        });

      } catch (error) {
        console.error('Error adding reply:', error.message);
      }
    };
  

    // Handle top-level comment submission
    const handleTopComment = async (e) => {
      e.preventDefault();
      const comment = commentText.value;
  
      try {
        const response = await fetch(`/StoryTopLevelMessage/${storyId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken
          },
          body: JSON.stringify({
            userId: UserID,
            commentText: comment,
            csrf: csrfToken
          })
        });
  
        if (!response.ok) {
          throw new Error(`Failed to add top-level comment. Status: ${response.status}`);
        }
  
        const data = await response.json();
       
        commentText.value = '';
        renderComment(data, commentsContainer);


      } catch (error) {
        console.error('Error adding top-level comment:', error.message);
      }
    };



    // Delete comment or reply
    const deleteCommentOrReply = async (e) => {
        const messageId = e.target.getAttribute('data-id');

        try {
            const response = await fetch(`/storyMessage/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({
                    userId: UserID
                })
            });

            if (!response.ok) {
                alert("Error deleting comment or reply");
                console.log(response, "response");
            }

            // Remove the deleted comment or reply from the DOM
            const commentWrapper = id_('comment_W' + messageId);
            commentWrapper.remove();
        } catch (error) {
            console.error('Error deleting comment or reply:', error.message);
        }
    };
  

    // Listen for delete button clicks
    //check if .delete button is available
    if(document.querySelectorAll('.delete') !== null){
      const deleteButtons = document.querySelectorAll('.delete');
      deleteButtons.forEach(button => {
          button.addEventListener('click', deleteCommentOrReply);
      });
    }  

    // Fetch all comments and replies
    const fetchComments = async () => {
      try {
        const response = await fetch(`/storyComments/${storyId}`);
        if (!response.ok) {
          console.error(`Failed to fetch comments. Status: ${response.status}`);
          alert("Failed to fetch comments. Please try again later.");
        }
        const data = await response.json();
       
        // Render top-level comments
        let replyArray = [];
        data.forEach(comment => {
          if (comment.parentCommentId === null) {
            renderComment(comment, commentsContainer);
          } else {
            replyArray.push(comment);
          }
        });
        // Render replies
        replyArray.forEach(reply => {
          const parent = id_('replies_' + reply.parentCommentId);
          renderComment(reply, parent);
        });
        // Listen for reply button clicks
        const replyButtons = document.querySelectorAll('.reply');
        replyButtons.forEach(button => {
          button.addEventListener('click', createReplyForm);
        });

        //scroll to view the comment smoothly
        alloWToFocuonEle = true;

      } catch (error) {
        console.error('Error fetching comments:', error.message);
      }
    }; 


  
    // Listen for form submission and fetch comments on page load   
    if (UserID !== "") commentForm.addEventListener('submit', handleTopComment);    
    fetchComments();

  
  });// End of DOMContentLoaded
  