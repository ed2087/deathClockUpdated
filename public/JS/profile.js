console.log('profile.js is connected');

// master.js

const storyCardTemplate = (story,csrfToken) => {

    let isOwner = id_("isOwner").value;
    console.log('isOwner:', isOwner);

    let adminButtons =`
        <div id="admin_btn_Wrap">
            <form class="admin_form" id="changeStoryPermisionForm" action="/terrorTales/editStory/${story.slug}" method="GET">
                <button class="admin_btn_edit" type="submit">Edit Story</button>
            </form>        

            <form class="admin_form" id="deleteStoryForm" action="/terrorTales/deleteStory" method="POST">
                <input type="hidden" name="slug" value="${story.slug}">
                <input type="hidden" name="_csrf" value="${csrfToken}">
                <button class="admin_btn_delete" type="submit" onclick="return confirm('Are you sure you want to delete this story?');">Delete Story</button>
            </form>
        </div>
    `;

    if(isOwner == "false") adminButtons = '';

    return `
    
    <div class="story">
        <a href="/terrorTales/horrorStory/${story.slug}" class="story_link">
            <div class="story_header">
                <img src="${story.backgroundUrl || '../../IMAGES/backgrounds/riper_writting2.webp'}" alt="${story.storyTitle}">
            </div>
        
            <div class="story_title">
                <h3>${story.storyTitle}</h3>
            </div>
        </a>

        <div class="info_wrap_second">

            <div class="upvoteCount">
                <img src="../../IMAGES/Icons/upArrow1.webp" alt="pen" />
                ${story.upvoteCount}
            </div> 

            <div class="upvoteCount">
                <img src="../../IMAGES/Icons/view.webp" alt="pen" />
                ${story.readCount}
            </div> 

            <div class="upvoteCount">
                <img src="../../IMAGES/Icons/chat.webp" alt="pen" />
                ${story.commentCount}
            </div> 

            <div class="upvoteCount">
                <img src="../../IMAGES/Icons/globe.webp" alt="languages" />
                ${story.language}
            </div>

        </div>
        <a href="/terrorTales/horrorStory/${story.slug}" class="story_link">
            <div class="story_description">
                <p>${story.storySummary}</p>
            </div>  
        </a>
        <!-- owner buttons -delete and update  -->                     
        ${adminButtons}
    </div>
`
};

const loadingMold = () => {
    let mold = `
            <div class="loading">
                <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
            </div>
        `;

    //add 20 mold to the page
    for (let i = 0; i < 19; i++) {
        mold += `
            <div class="loading">
                <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
            </div>
        `;
    }

    return mold;

};

// remove all loading
const removeLoading = () => {
    queryAll_('.loading').forEach(loading => {
        loading.remove();
    });
};



n = false;

// Animation styles
const slideRight_ = 'slide_right_Settings';
const slideLeft_ = 'slide_left_Settings';

// When profile_settings_btn is clicked open the profile settings if not already open
const profile_settings_btn = queryAll_('.profile_settings_btn');
const settings_container = document.querySelector('.settings_container');

if (settings_container) {
    profile_settings_btn.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('profile_settings_btn clicked');
            if (!n) {
                // Check if the settings container is already open
                settings_container.classList.remove(slideLeft_);
                settings_container.classList.add(slideRight_);
                n = true;
            } else {
                settings_container.classList.remove(slideRight_);
                settings_container.classList.add(slideLeft_);
                n = false;
            }
        });
    });

    // Close the settings container if the user scrolls outside of it
    // window.addEventListener('scroll', () => {
    //     if (n) {
    //         settings_container.classList.remove(slideRight_);
    //         settings_container.classList.add(slideLeft_);
    //         n = false;
    //     }
    // });
}



// profile.js

document.addEventListener('DOMContentLoaded', () => {

    let skip = 0;
    const searchInput = document.getElementById('searchInput');

    let searchTerm = '';

    const debounce = (func, delay) => {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    };

    const loadMoreStories = async () => { 

        id_('stories_grid').insertAdjacentHTML('beforeend', loadingMold()); // Show loading animation
        const csrfToken = id_("csrf").value;
        const username = document.querySelector(".username").innerHTML;

        const response = await fetch(`/profile/u/${username}/loadMoreStories?skip=${skip}&q=${searchTerm}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'CSRF-Token': csrfToken
            }
        });
        
        const data = await response.json();
        removeLoading();

        if (data.stories && data.stories.length > 0) {
            data.stories.forEach(story => {
                id_('stories_grid').insertAdjacentHTML('beforeend', storyCardTemplate(story));
            });
            skip += data.stories.length;
            if (!data.hasMore) {
                id_('loadMoreStories').disabled = true;
                id_('loadMoreStories').textContent = 'No more stories';
            }
        } else {            
            id_('loadMoreStories').disabled = true;
            id_('loadMoreStories').textContent = 'No more stories';
        }

    };//end loadMoreStories

    if (id_('loadMoreStories')) {
        id_('loadMoreStories').addEventListener('click', loadMoreStories);
    }

    // Search stories
    const searchStories = async (insetINput) => {

        skip = 0;
        searchTerm = searchInput.value || insetINput;
        //if searchTerm not a string or empty string
        if (typeof searchTerm !== 'string') searchTerm = '';    

        console.log('searchTerm:', searchTerm);
        id_('stories_grid').innerHTML = ''; // Clear existing stories
        id_('stories_grid').insertAdjacentHTML('beforeend', loadingMold()); // Show loading animation
        const csrfToken = id_("csrf").value;
        const username = document.querySelector(".username").innerHTML;

        const response = await fetch(`/profile/u/${username}/search?q=${searchTerm}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'CSRF-Token': csrfToken
            }
        });

        const data = await response.json();
        removeLoading();
        
        if (data.stories && data.stories.length > 0) {
            //wipe the stories grid
            id_('stories_grid').innerHTML = '';
            data.stories.forEach(story => {
                id_('stories_grid').innerHTML += storyCardTemplate(story,csrfToken)
            });
            id_('loadMoreStories').disabled = data.stories.length < 10;
            id_('loadMoreStories').textContent = data.stories.length < 10 ? 'No more stories' : 'Load More';
        } else {
            id_('stories_grid').innerHTML = '<p>No stories found</p>';
            id_('loadMoreStories').disabled = true;
            id_('loadMoreStories').textContent = 'No more stories';
        }
    };//end searchStories

    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchStories, 600));
    }

    searchStories('');




    // validation
    const urlPatterns = {
        redditUrl: /^https:\/\/(www\.)?reddit\.com\/user\/[A-Za-z0-9_]+\/?$/,
        instagramUrl: /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?(\?next=%2F)?$/,
        twitterUrl: /^https:\/\/(x|twitter)\.com\/[A-Za-z0-9_]+\/?$/,
        tumblrUrl: /^https:\/\/(www\.)?tumblr\.com\/[A-Za-z0-9_-]+\/?$/,
        facebookUrl: /^https:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.]+\/?$/,
        tiktokUrl: /^https:\/\/(www\.)?tiktok\.com\/@?[A-Za-z0-9_.-]+\/?$/,
        linkedinUrl: /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/,
        youtubeUrl: /^https:\/\/(www\.)?youtube\.com\/(channel\/|c\/|@)[A-Za-z0-9_-]+\/?$/,
        websiteUrl: /^https:\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,6}(\/.*)?$/
    };


    function validateUrls() {
        let allValid = true;

        Object.keys(urlPatterns).forEach(id => {
            const element = document.getElementById(id);
            element.value = element.value.trim(); // Trim whitespace
            const pattern = urlPatterns[id];
            const isValid = pattern.test(element.value);
            element.style.border = isValid ? '1px solid green' : '1px solid red';
            element.style.color = isValid ? 'green' : 'red';
            if (element.value.trim() !== "" && !isValid) {
                allValid = false;
            }
        });

        const saveButton = document.getElementById('saveButton');
        saveButton.disabled = !allValid;
    }

    function detectPaste(event) {
        let isPaste = (event.type === 'paste');
        const element = event.target;
        element.dataset.pasted = isPaste;
        validateUrls();
    }

    Object.keys(urlPatterns).forEach(id => {
        const element = document.getElementById(id);
        element.addEventListener('input', validateUrls);
        element.addEventListener('paste', detectPaste);
        element.addEventListener('input', detectPaste);
    });


});










