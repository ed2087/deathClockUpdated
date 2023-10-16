console.log('storyPageFun.js loaded');

let page = 1;
let limit = 8;
let query = '';
let language = 'English';
let totalStories_available = 0;
let timer;

/////////////////////////////////////////////////
// Template Functions
/////////////////////////////////////////////////

const CommonStoryTemplates = (data) => {
    return `
        <div class="story">
            <h1 class="storyTitle">${data.storyTitle}</h1>
            <h3 class="storySummary">${data.storySummary}</h3>
            <div class="tags">${data.tags}</div>
            <div class="extraTags">${data.extraTags}</div>
            <div class="categories">${data.categories}</div>
            <div class="legalName">${data.legalName}</div>
            <div class="upvoteCount">${data.upvoteCount}</div>
            <div class="createdAt">${data.createdAt}</div>
            <a href="#">Not Avalable</a>
        </div>
    `;
};

/////////////////////////////////////////////////
// Fetch Data from Server
/////////////////////////////////////////////////

const query_fetch = async () => {
    const searchInput = id_("search").value;
    const languageSelect = id_("language").value;
    const rankingSelect = id_("rankingWrap").value;

    const queryObject = {
        query: searchInput || '',
        language: languageSelect || language,
        ranking: rankingSelect || '',
        page,
        limit,
    };

    const urlParams = new URLSearchParams(queryObject);

    const url = `/terrorTales/query?${urlParams.toString()}`;

    const data = await fetch_(url, 'GET', null);

    if (data.status === 200) {

        

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
                storyListWrap.innerHTML += CommonStoryTemplates(data_);
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
    query_fetch(query, language, ranking, page, limit);
};

id_('loadMore').addEventListener('click', loadMoreStories);

// Get all the stories initially
query_fetch();
