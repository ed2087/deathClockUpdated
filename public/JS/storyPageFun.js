console.log('storyPageFun.js loaded');

let page = 1;
let limit = 8;
let query = '';
let language = 'English';
let totalStories_available = 0;
let timer;



/////////////////////////////////////////////////
// admin Functions
/////////////////////////////////////////////////


const deleteStory = async (slug) => {
    try {
        // Confirm deletion with the user
        const shouldDelete = confirm('Are you sure you want to delete this story?');
        
        if (!shouldDelete) return;

        // Send a POST request to delete the story
        const url = `/terrorTales/deleteStory/${slug}`;
        await fetch(url, {
            method: 'POST',
        });

        // Redirect to another page or handle UI updates as needed
    } catch (error) {
        console.error('An error occurred while deleting the story:', error.message);
        // Handle the error, maybe show a user-friendly message
    }
};







/////////////////////////////////////////////////
// Template Functions
/////////////////////////////////////////////////

const CommonStoryTemplates = (data,UserRole) => {    
   
    const { createdAt, comments, extraTags, categories } = data;
    const date = new Date(createdAt);
    const formattedDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
    const commentsCount = comments.length;

    const renderStoryTag = (tag) => `<span class="storyTag"><span class="story_hashtag">#</span>${tag}</span>`;
    const extraTags_categories = [...extraTags, ...categories].map(renderStoryTag).join('');


    const csrfToken =  id_('csrf').value;

    let adminButtons = '';
    
    //if admin allow edit, delete, suspend story
    if (UserRole === 'admin') {
        adminButtons = `
            <div class="story_buttons_wrap">
                <form id="deleteStoryForm" action="/terrorTales/deleteStory" method="POST">
                    <input type="hidden" name="slug" value="${data.slug}">
                    <input type="hidden" name="_csrf" value="${csrfToken}">
                    <button type="submit" onclick="return confirm('Are you sure you want to delete this story?');">Delete Story</button>
                </form>
                <form id="changeStoryPermisionForm" action="/terrorTales/changeStoryPermision" method="POST">
                    <input type="hidden" name="slug" value="${data.slug}">
                    <input type="hidden" name="_csrf" value="${csrfToken}">
                    <button type="submit" onclick="return confirm('Are you sure you want to suspend this story?');">Suspend Story</button>
                </form>
            </div>
        `;
    }

    //if moderator only allow suspend or edit story
    if(UserRole === 'moderator'){
        adminButtons = `
            <div class="story_buttons_wrap">
                <form id="changeStoryPermisionForm" action="/terrorTales/changeStoryPermision" method="POST">
                    <input type="hidden" name="slug" value="${data.slug}">
                    <input type="hidden" name="_csrf" value="${csrfToken}">
                    <button type="submit" onclick="return confirm('Are you sure you want to suspend this story?');">Suspend Story</button>
                </form>
            </div>
        `;
    }

    return `

            <div class="story_wrap">

                <div class="story_inner_wrap story_innerTitle_wrap">
                    <h2 class="storyTitle">${data.storyTitle}</h2>
                </div>

                <div class="story_inner_wrap story_innerInfo_wrap">

                    <div class="story_info_wrap">

                        <div class="info_wrap_first">
                            <div class="readingTime">
                                <img src="../../IMAGES/Icons/clock.webp" alt="pen" />
                                ${data.readingTime} min read
                            </div>
                            <div class="legalName">
                                <img src="../../IMAGES/Icons/signature.webp" alt="pen" />
                                Written By &nbsp; <span class="userName_Sign">@</span>${data.creditingName}
                            </div>
                        </div>

                        <div class="info_wrap_second">

                            <div class="upvoteCount">
                                <img src="../../IMAGES/Icons/upArrow1.webp" alt="pen" />
                                ${data.upvoteCount}
                            </div> 

                            <div class="upvoteCount">
                                <img src="../../IMAGES/Icons/view.webp" alt="pen" />
                                ${data.readCount}
                            </div> 

                            <div class="upvoteCount">
                                <img src="../../IMAGES/Icons/chat.webp" alt="pen" />
                                ${commentsCount}
                            </div> 
                        </div>
                        
                    </div>

                    <h3 class="storySummary">${data.storySummary}</h3>

                    <div class="storyTags_wrap">
                        ${extraTags_categories}
                    </div>
                    
                    ${adminButtons}                    
                    
                    <a class="read_story_button" href="/terrorTales/horrorStory/${data.slug}">Read Story</a>

                </div>

        </div>

    `;
};



//create a loading animation like the mold on  CommonStoryTemplates




const loadingAnimationTemplate = () => {

    return `

            <div class="loading_story_wrap">

                <div class="loadingAnimation loading_story_innerTitle_wrap"></div>

                <div class="loading_story_innerInfo_wrap">

                    <div class="loading_story_info_wrap">

                        <div class="loading_info_wrap_first">
                            <div class="loadingAnimation loading_readingTime"></div>
                            <div class="loadingAnimation loading_legalName"></div>
                        </div>

                        <div class="loading_info_wrap_second">

                            <div class="loadingAnimation loading_upvoteCount"></div> 

                            <div class="loadingAnimation loading_upvoteCount"></div> 

                            <div class="loadingAnimation loading_upvoteCount"></div> 

                        </div>
                        
                    </div>

                    <h3 class="loadingAnimation loading_storySummary"></h3>

                    <div class="loading_storyTags_wrap">
                        <span class="loadingAnimation loading_storyTag"></span>
                        <span class="loadingAnimation loading_storyTag"></span>
                        <span class="loadingAnimation loading_storyTag"></span>
                    </div>

                </div>

        </div>

    `; 

};


const loadLoadinHTML = () => {
    id_('storyListWrap').innerHTML = '';
    for (let i = 0; i < 8; i++) {
        id_('storyListWrap').innerHTML += loadingAnimationTemplate();
    }
};



/////////////////////////////////////////////////
// Fetch Data from Server
/////////////////////////////////////////////////


let allowOnce = true;

const query_fetch = async () => {

    //loading animation
    loadLoadinHTML();

    const searchInput = id_("search").value;
    const languageSelect = id_("language").value;

    const queryObject = {
        query: searchInput || '',
        language: languageSelect || language,
        page,
        limit,
    };

    const urlParams = new URLSearchParams(queryObject);

    const url = `/terrorTales/query?${urlParams.toString()}`;

    const data = await fetch_(url, 'GET', null);
    //console.log(data);

    if (data.status === 200) {


        //allowOnce
        if (allowOnce) {

            id_('language').innerHTML = '<option value="English">English</option>';
            //add languagesArray to language select
            data.languagesArray.forEach((language) => {
                //if language is english then dont add it to language select
                if (language === 'English') return;
                id_('language').innerHTML += `<option value="${language}">${language}</option>`;
            });
            
            allowOnce = false;

        }
        

        if (page === 1) {
            id_('storyListWrap').innerHTML = '';           

        }

        const storyListWrap = id_('storyListWrap');
        if (data.stories.length === 0) {
            storyListWrap.innerHTML = `
                <div class="noData">No data found</div>
            `;
        } else {
            
            data.stories.forEach((data_) => {
                storyListWrap.innerHTML += CommonStoryTemplates(data_, data.UserRole);
                totalStories_available++;
            });
        }

        //if data.totalStories is greater then totalStories_available then dont add load more button
        if (data.totalStories <= totalStories_available) {
            //display load more button #loadMore
            id_('loadMore').style.display = 'none';
        }else
        {
            id_('loadMore').style.display = 'block';
        }

    } else {
        console.log('error');
    }
};

const debounceQueryFetch = (event) => {

    // add loading animation
    id_('storyListWrap').innerHTML = '';
    for (let i = 0; i < 8; i++) {
        id_('storyListWrap').innerHTML += loadingAnimationTemplate();
    }

    clearTimeout(timer);
    timer = setTimeout(() => {
        page = 1;
        totalStories_available = 0;
        query_fetch(event.target.value);
    }, 1000);
};

id_("search").addEventListener('keyup', debounceQueryFetch);

queryAll_('.selectQueryData').forEach((query) => {
    query.addEventListener('change', (event) => {
        page = 1;
        totalStories_available = 0;
        query_fetch(event.target.value);
    });
});

/////////////////////////////////////////////////
// Fetch Data Pagination
/////////////////////////////////////////////////

const loadMoreStories = async () => {
    page++;
    query_fetch(query, language, page, limit);
};

id_('loadMore').addEventListener('click', loadMoreStories);

// Get all the stories initially
query_fetch();
