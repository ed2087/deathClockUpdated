console.log('Enhanced storyPageFun.js v3.0 loaded - Ultimate Search System');

/**
 * Enhanced Story Page Functionality with Ultimate Search System
 * Modern ES6+ JavaScript with improved error handling, loading states, and user experience
 */
class TerrorHubStoryManager {
    constructor() {
        this.currentPage = 1;
        this.limit = 18;
        this.query = '';
        this.language = 'all';
        this.ranking = 'default';
        this.searchType = 'comprehensive';
        this.totalStoriesAvailable = 0;
        this.isLoading = false;
        this.debounceTimer = null;
        this.allowLanguageInit = true;
        this.userRole = null;
        this.useUltimateSearch = true; // Flag to switch between search systems
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialStories();
        this.initializeSearchTypeSelector();
        console.log('TerrorHub Story Manager v3.0 initialized successfully');
    }

    setupEventListeners() {
        // Search input with debounced search
        const searchInput = this.getElement('search');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => this.handleSearchInput(e));
            searchInput.addEventListener('keydown', (e) => this.preventEnterSubmit(e));
        }

        // Language and ranking filters
        const languageSelect = this.getElement('language');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => this.handleFilterChange(e));
        }

        // Load more button
        const loadMoreBtn = this.getElement('loadMore');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreStories());
        }

        // Add ranking filter if it exists
        const rankingSelect = this.getElement('ranking');
        if (rankingSelect) {
            rankingSelect.addEventListener('change', (e) => this.handleFilterChange(e));
        }

        // Search type selector
        const searchTypeSelect = this.getElement('searchType');
        if (searchTypeSelect) {
            searchTypeSelect.addEventListener('change', (e) => this.handleSearchTypeChange(e));
        }

        // Category filters
        this.setupCategoryFilters();
    }

    initializeSearchTypeSelector() {
        // Add search type selector to the form if it doesn't exist
        const formWrap = this.getElement('formWrap_');
        if (formWrap && !this.getElement('searchType')) {
            const searchTypeHTML = `
                <div class="inputWrap" id="searchTypeWrap">
                    <select class="selectQueryData" id="searchType" name="searchType">
                        <option value="comprehensive">Smart Search</option>
                        <option value="quick">Quick Search</option>
                        <option value="author">Author Search</option>
                        <option value="content">Content Only</option>
                    </select>
                </div>
            `;
            
            // Insert after language selector
            const languageWrap = this.getElement('languageWrap');
            if (languageWrap) {
                languageWrap.insertAdjacentHTML('afterend', searchTypeHTML);
            }
        }
    }

    setupCategoryFilters() {
        // This will be called after categories are loaded
        const categoryFilters = this.getAllElements('.category-filter');
        categoryFilters.forEach(filter => {
            filter.addEventListener('change', () => this.handleCategoryFilter());
        });
    }

    getElement(id) {
        return document.getElementById(id);
    }

    getAllElements(selector) {
        return document.querySelectorAll(selector);
    }

    handleSearchInput(event) {
        this.clearLoadingTemplates();
        this.showLoadingAnimation();
        
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.resetPagination();
            this.query = event.target.value.trim();
            this.fetchStories();
        }, 800); // Reduced debounce time for better UX
    }

    handleFilterChange(event) {
        this.resetPagination();
        this.clearStoryList();
        this.showLoadingAnimation();
        
        // Update the appropriate filter
        if (event.target.id === 'language') {
            this.language = event.target.value;
        } else if (event.target.id === 'ranking') {
            this.ranking = event.target.value;
        }
        
        this.fetchStories();
    }

    handleSearchTypeChange(event) {
        this.searchType = event.target.value;
        this.resetPagination();
        this.clearStoryList();
        this.showLoadingAnimation();
        this.fetchStories();
    }

    handleCategoryFilter() {
        this.resetPagination();
        this.clearStoryList();
        this.showLoadingAnimation();
        this.fetchStories();
    }

    preventEnterSubmit(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    }

    resetPagination() {
        this.currentPage = 1;
        this.totalStoriesAvailable = 0;
    }

    clearStoryList() {
        const storyListWrap = this.getElement('storyListWrap');
        if (storyListWrap) {
            storyListWrap.innerHTML = '';
        }
    }

    showLoadingAnimation() {
        const storyListWrap = this.getElement('storyListWrap');
        if (!storyListWrap) return;

        // Add loading templates
        for (let i = 0; i < 8; i++) {
            storyListWrap.innerHTML += this.createLoadingTemplate();
        }
    }

    clearLoadingTemplates() {
        this.getAllElements('.loadingHTMLTemplates').forEach(template => {
            template.remove();
        });
    }

    createLoadingTemplate() {
        return `
            <div class="loading_story_wrap loadingHTMLTemplates">
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
    }

    // Main search method with fallback support
    async fetchStories() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            // Try ultimate search first, fallback to legacy if needed
            if (this.useUltimateSearch) {
                await this.fetchStoriesUltimate();
            } else {
                await this.fetchStoriesLegacy();
            }
        } catch (error) {
            console.error('Error in fetchStories:', error);
            if (this.useUltimateSearch) {
                console.log('Ultimate search failed, falling back to legacy...');
                this.useUltimateSearch = false;
                await this.fetchStoriesLegacy();
            } else {
                this.showErrorMessage('Failed to load stories. Please try again.');
            }
        } finally {
            this.isLoading = false;
        }
    }

    // Enhanced Ultimate Search Method
    async fetchStoriesUltimate() {
        try {
            const searchInput = this.getElement('search');
            const languageSelect = this.getElement('language');
            const rankingSelect = this.getElement('ranking');
            const searchTypeSelect = this.getElement('searchType');
            
            // Collect category filters
            const categoryFilters = this.getSelectedCategories();
            
            const queryParams = new URLSearchParams({
                query: searchInput?.value.trim() || '',
                searchType: searchTypeSelect?.value || this.searchType,
                language: languageSelect?.value || 'all',
                sort: this.mapRankingToSort(rankingSelect?.value || 'default'),
                page: this.currentPage,
                limit: this.limit
            });

            // Add category filters if any
            if (categoryFilters.length > 0) {
                queryParams.append('categories', categoryFilters.join(','));
            }

            const url = `/terrorTales/ultimateSearch?${queryParams.toString()}`;
            console.log('🔍 Fetching from Ultimate Search:', url);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Ultimate Search HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('🎯 Ultimate Search Response:', data);

            this.handleApiResponse(data);

        } catch (error) {
            console.error('Ultimate search error:', error);
            throw error; // Re-throw to trigger fallback
        }
    }

    // Legacy Search Method (Fallback)
    async fetchStoriesLegacy() {
        try {
            const searchInput = this.getElement('search');
            const languageSelect = this.getElement('language');
            const rankingSelect = this.getElement('ranking');
            
            const queryParams = new URLSearchParams({
                query: searchInput?.value.trim() || '',
                language: languageSelect?.value || 'all',
                ranking: rankingSelect?.value || 'default',
                page: this.currentPage,
                limit: this.limit
            });

            const url = `/terrorTales/query?${queryParams.toString()}`;
            console.log('📡 Fetching from Legacy Search:', url);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Legacy Search HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 Legacy Search Response:', data);

            this.handleApiResponse(data);

        } catch (error) {
            console.error('Legacy search error:', error);
            throw error;
        }
    }

    // Get selected category filters
    getSelectedCategories() {
        const categoryFilters = this.getAllElements('.category-filter:checked');
        return Array.from(categoryFilters).map(filter => filter.value);
    }

    // Map old ranking to new sort options
    mapRankingToSort(ranking) {
        const sortMap = {
            'default': 'relevance',
            'newest': 'newest',
            'oldest': 'newest', // No oldest in new system, use newest
            'popular': 'popular',
            'upvotes': 'popular',
            'comments': 'popular',
            'reading-time': 'most_read',
            'trending': 'trending'
        };
        return sortMap[ranking] || 'relevance';
    }

    handleApiResponse(response) {
        // Handle both ultimate search and legacy API responses
        const data = response.data || response;
        
        if (response.status === 200 && data) {
            const {
                stories = [],
                totalStories = 0,
                languagesArray = [],
                userRole = null,
                searchMeta = null,
                popularAuthors = [],
                trendingTags = []
            } = data;

            console.log('📈 Processing data:', { 
                storiesCount: stories.length, 
                totalStories, 
                languagesArray: languagesArray.length,
                searchType: searchMeta?.searchType || 'legacy',
                processingTime: searchMeta?.processingTime || 'N/A'
            });

            // Initialize language dropdown once
            if (this.allowLanguageInit && languagesArray.length > 0) {
                this.populateLanguageDropdown(languagesArray);
                this.allowLanguageInit = false;
            }

            // Clear loading animations for page 1
            if (this.currentPage === 1) {
                this.clearLoadingTemplates();
            }

            // Store user role for admin features
            this.userRole = userRole;

            // Handle stories display
            if (stories.length === 0 && this.currentPage === 1) {
                this.showNoResultsMessage(searchMeta);
            } else {
                this.displayStories(stories);
                this.updateLoadMoreButton(totalStories);
            }

            // Update language selection
            this.updateLanguageSelection();

            // Show search insights if available debug only
            // if (searchMeta) {
            //     this.showSearchInsights(searchMeta);
            // }

        } else {
            console.error('❌ Invalid response format:', response);
            this.showErrorMessage('Invalid response from server');
        }
    }

    populateLanguageDropdown(languages) {
        const languageSelect = this.getElement('language');
        if (!languageSelect) return;

        const currentValue = languageSelect.value;
        languageSelect.innerHTML = '<option value="all">All Languages</option>';

        // Clean and add languages
        const uniqueLanguages = [...new Set(languages.filter(lang => lang && lang.trim()))];
        
        uniqueLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = this.formatLanguageName(lang);
            languageSelect.appendChild(option);
        });

        // Restore selected value
        languageSelect.value = currentValue;
    }

    formatLanguageName(lang) {
        const languageMap = {
            'en': 'English',
            'es': 'Español',
            'pt': 'Português', 
            'fr': 'Français',
            'de': 'Deutsch',
            'English': 'English',
            'Spanish': 'Español'
        };
        return languageMap[lang] || lang;
    }

    displayStories(stories) {
        const storyListWrap = this.getElement('storyListWrap');
        if (!storyListWrap) return;

        stories.forEach(story => {
            if (story && story._id) {
                storyListWrap.innerHTML += this.createStoryTemplate(story);
                this.totalStoriesAvailable++;
            }
        });

        this.clearLoadingTemplates();
    }

    createStoryTemplate(story) {
        const { createdAt, comments = [], extraTags = [], categories = [], tags = [] } = story;
        const date = new Date(createdAt);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        const commentsCount = Array.isArray(comments) ? comments.length : 0;

        // Enhanced tag display - combine all tag sources
        const allTags = [...new Set([...extraTags, ...categories, ...tags])];
        const tagsHtml = allTags.slice(0, 6).map(tag => 
            `<span class="storyTag"><span class="story_hashtag">#</span>${this.formatTag(tag)}</span>`
        ).join('');

        // Add more tags indicator if needed
        const moreTagsIndicator = allTags.length > 6 ? 
            `<span class="storyTag more-tags">+${allTags.length - 6} more</span>` : '';

        // Admin buttons based on user role
        const adminButtons = this.createAdminButtons(story);

        // Enhanced story info with new metrics
        const enhancedInfo = this.createEnhancedStoryInfo(story);

        return `
            <div class="story_wrap" data-story-id="${story._id}">
                <a class="story_inner_wrap story_innerTitle_wrap" href="/terrorTales/horrorStory/${story.slug}">
                    <h2 class="storyTitle">${story.storyTitle}</h2>
                    ${story.searchHighlights?.title ? `<div class="search-highlight">${story.searchHighlights.title}</div>` : ''}
                </a>

                <div class="story_inner_wrap story_innerInfo_wrap">
                    ${enhancedInfo}

                    <h3 class="storySummary">${story.storySummary}</h3>
                    ${story.searchHighlights?.summary ? `<div class="search-highlight">${story.searchHighlights.summary}</div>` : ''}
                    ${story.searchHighlights?.snippet ? `<div class="search-snippet">${story.searchHighlights.snippet}</div>` : ''}

                    <div class="storyTags_wrap">
                        ${tagsHtml}
                        ${moreTagsIndicator}
                    </div>
                    
                    ${adminButtons}
                    
                    <a class="read_story_button" href="/terrorTales/horrorStory/${story.slug}">Read Story</a>
                </div>
            </div>
        `;
    }
//story.relevanceScore
    createEnhancedStoryInfo(story) {
        const { authorInfo } = story;
        
        return `
            <div class="story_info_wrap">
                <div class="info_wrap_first">
                    <div class="readingTime">
                        <img src="../../IMAGES/Icons/clock.webp" alt="clock" />
                        ${story.readingTime || 0} min read
                    </div>
                    <div class="legalName">
                        <img src="../../IMAGES/Icons/signature.webp" alt="author" />
                        <a class="navLinks_ author-link" href="/profile/u/${story.creditingName}">                
                            ${story.creditingName}
                            ${authorInfo?.role === 'admin' ? ' 👑' : ''}
                            ${authorInfo?.role === 'moderator' ? ' 🛡️' : ''}
                        </a>
                    </div>
                </div>

                <div class="info_wrap_second">
                    <div class="upvoteCount" title="Upvotes">
                        <img src="../../IMAGES/Icons/upArrow1.webp" alt="upvotes" />
                        ${this.formatNumber(story.upvoteCount || 0)}
                    </div> 
                    <div class="upvoteCount" title="Views">
                        <img src="../../IMAGES/Icons/view.webp" alt="views" />
                        ${this.formatNumber(story.viewCount || 0)}
                    </div> 
                    <div class="upvoteCount" title="Comments">
                        <img src="../../IMAGES/Icons/chat.webp" alt="comments" />
                        ${this.formatNumber(Array.isArray(story.comments) ? story.comments.length : 0)}
                    </div> 
                    <div class="upvoteCount" title="Reads">
                        <img src="../../IMAGES/Icons/reading.webp" alt="reads" />
                        ${this.formatNumber(story.readCount || 0)}
                    </div> 
                    <div class="upvoteCount" title="Language">
                        <img src="../../IMAGES/Icons/globe.webp" alt="language" />
                        ${this.formatLanguageName(story.language || 'English')}
                    </div>
                    ${story.relevanceScore ? `
                    <div class="upvoteCount relevance-score" title="Search Relevance">
                        <span class="relevance-icon">⭐</span>
                        ${Math.round(story.relevanceScore)}%
                    </div>` : ''}
                </div>
            </div>
        `;
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    formatTag(tag) {
        // Clean and format tags for display
        return tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    createAdminButtons(story) {
        const userId = this.getElement('id_user')?.value;
        const csrfToken = this.getElement('csrf')?.value;

        if (!csrfToken) return '';

        let adminButtons = '';

        // Admin can edit, delete, and suspend
        if (this.userRole === 'admin') {
            adminButtons = `
                <div class="story_buttons_wrap admin-buttons">             
                    <button type="button" onclick="window.open('/terrorTales/editStory/${story.slug}', '_blank')" class="btn-edit">
                        ✏️ Edit
                    </button>
                    <button type="button" onclick="this.deleteStoryConfirm('${story.slug}')" class="btn-delete">
                        🗑️ Delete
                    </button>
                    <button type="button" onclick="this.suspendStoryConfirm('${story.slug}')" class="btn-suspend">
                        ⏸️ Suspend
                    </button>
                </div>
            `;
        }
        // Moderator can edit and suspend
        else if (this.userRole === 'moderator') {
            adminButtons = `
                <div class="story_buttons_wrap moderator-buttons">
                    <button type="button" onclick="window.open('/terrorTales/editStory/${story.slug}', '_blank')" class="btn-edit">
                        ✏️ Edit
                    </button>
                    <button type="button" onclick="this.suspendStoryConfirm('${story.slug}')" class="btn-suspend">
                        ⏸️ Suspend
                    </button>
                </div>
            `;
        }
        // Story owner can edit and delete
        else if (this.userRole === 'writter' && userId === story.owner) {
            adminButtons = `
                <div class="story_buttons_wrap owner-buttons">
                    <button type="button" onclick="window.open('/terrorTales/editStory/${story.slug}', '_blank')" class="btn-edit">
                        ✏️ Edit
                    </button>
                    <button type="button" onclick="this.deleteStoryConfirm('${story.slug}')" class="btn-delete">
                        🗑️ Delete
                    </button>
                </div>
            `;
        }

        return adminButtons;
    }

    // Enhanced admin action methods
    deleteStoryConfirm(slug) {
        if (confirm('⚠️ Are you sure you want to permanently delete this story? This action cannot be undone.')) {
            this.submitForm('/terrorTales/deleteStory', { slug });
        }
    }

    suspendStoryConfirm(slug) {
        const reason = prompt('Please enter a reason for suspending this story:');
        if (reason && reason.trim()) {
            this.submitForm('/terrorTales/changeStoryPermision', { slug, reason: reason.trim() });
        }
    }

    submitForm(action, data) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = action;
        
        // Add CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_csrf';
        csrfInput.value = this.getElement('csrf')?.value || '';
        form.appendChild(csrfInput);
        
        // Add data fields
        Object.entries(data).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
    }

    updateLoadMoreButton(totalStories) {
        const loadMoreBtn = this.getElement('loadMore');
        if (!loadMoreBtn) return;

        if (totalStories <= this.totalStoriesAvailable) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
            const remaining = totalStories - this.totalStoriesAvailable;
            loadMoreBtn.innerHTML = `
                <span>Load More Stories</span>
                <small>(${remaining} remaining)</small>
            `;
        }
    }

    updateLanguageSelection() {
        const languageSelect = this.getElement('language');
        if (!languageSelect) return;

        // Update selected language
        this.getAllElements('#language option').forEach(option => {
            if (option.value === this.language) {
                option.setAttribute('selected', 'selected');
            } else {
                option.removeAttribute('selected');
            }
        });
    }

    showSearchInsights(searchMeta) {
        if (!searchMeta || !searchMeta.suggestions) return;

        const storyListWrap = this.getElement('storyListWrap');
        if (!storyListWrap) return;

        // Add search insights at the top
        const insightsHTML = `
            <div class="search-insights">
                <div class="search-stats">
                    <span>Found ${searchMeta.totalResults || 0} stories</span>
                    <span>Search type: ${searchMeta.searchType || 'standard'}</span>
                    ${searchMeta.processingTime ? `<span>in ${Date.now() - searchMeta.processingTime}ms</span>` : ''}
                </div>
                ${searchMeta.suggestions && searchMeta.suggestions.length > 0 ? `
                <div class="search-suggestions">
                    <span>Related searches:</span>
                    ${searchMeta.suggestions.map(s => 
                        `<button class="suggestion-tag" onclick="document.getElementById('search').value='${s.suggestion}'; window.terrorHubStoryManager.handleSearchInput({target: document.getElementById('search')})">${s.suggestion}</button>`
                    ).join('')}
                </div>` : ''}
            </div>
        `;

        storyListWrap.insertAdjacentHTML('afterbegin', insightsHTML);
    }

    showNoResultsMessage(searchMeta = null) {
        const storyListWrap = this.getElement('storyListWrap');
        if (!storyListWrap) return;

        const searchTerm = this.getElement('search')?.value || '';
        const searchType = this.getElement('searchType')?.value || 'comprehensive';
        
        let message = '';
        let suggestions = '';

        if (searchTerm) {
            message = `No stories found for "${searchTerm}" using ${searchType} search in ${this.language === 'all' ? 'any language' : this.formatLanguageName(this.language)}.`;
            suggestions = `
                <div class="no-results-suggestions">
                    <h4>Try these suggestions:</h4>
                    <ul>
                        <li>Check your spelling</li>
                        <li>Try different search terms</li>
                        <li>Use broader keywords</li>
                        <li>Change search type to "Quick Search"</li>
                        <li>Search in "All Languages"</li>
                    </ul>
                </div>
            `;
        } else {
            message = 'No stories available at the moment.';
        }

        storyListWrap.innerHTML = `
            <div class="noData">
                <div class="no-results-icon">🔍</div>
                <h3>No Stories Found</h3>
                <p>${message}</p>
                ${suggestions}
                <div class="no-results-actions">
                    <a href="/terrorTales/submission" class="btn-submit-story">📝 Submit Your Story</a>
                    <button onclick="location.reload()" class="btn-refresh">🔄 Refresh Page</button>
                </div>
            </div>
        `;
    }

    showErrorMessage(message) {
        const storyListWrap = this.getElement('storyListWrap');
        if (!storyListWrap) return;

        storyListWrap.innerHTML = `
            <div class="error-message">
                <div class="error-icon">⚠️</div>
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                <div class="error-actions">
                    <button onclick="location.reload()" class="btn-retry">🔄 Try Again</button>
                    <button onclick="window.terrorHubStoryManager.switchToLegacySearch()" class="btn-fallback">📡 Use Basic Search</button>
                </div>
            </div>
        `;
    }

    switchToLegacySearch() {
        this.useUltimateSearch = false;
        this.clearStoryList();
        this.showLoadingAnimation();
        this.fetchStories();
    }

    async loadMoreStories() {
        if (this.isLoading) return;

        this.currentPage++;
        await this.fetchStories();
    }

    async loadInitialStories() {
        await this.fetchStories();
    }

    // Public API methods
    search(query) {
        const searchInput = this.getElement('search');
        if (searchInput) {
            searchInput.value = query;
            this.handleSearchInput({ target: searchInput });
        }
    }

    setLanguage(language) {
        const languageSelect = this.getElement('language');
        if (languageSelect) {
            languageSelect.value = language;
            this.handleFilterChange({ target: languageSelect });
        }
    }

    setSearchType(searchType) {
        const searchTypeSelect = this.getElement('searchType');
        if (searchTypeSelect) {
            searchTypeSelect.value = searchType;
            this.handleSearchTypeChange({ target: searchTypeSelect });
        }
    }
}

// Initialize the enhanced story manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.terrorHubStoryManager = new TerrorHubStoryManager();
    
    // Expose public API
    window.TerrorHub = {
        search: (query) => window.terrorHubStoryManager.search(query),
        setLanguage: (lang) => window.terrorHubStoryManager.setLanguage(lang),
        setSearchType: (type) => window.terrorHubStoryManager.setSearchType(type),
        refresh: () => window.terrorHubStoryManager.loadInitialStories()
    };
});

// Legacy compatibility function
function deleteStory(slug) {
    if (window.terrorHubStoryManager) {
        window.terrorHubStoryManager.deleteStoryConfirm(slug);
    } else {
        // Fallback
        if (confirm('Are you sure you want to delete this story?')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/terrorTales/deleteStory';
            
            const slugInput = document.createElement('input');
slugInput.type = 'hidden';
           slugInput.name = 'slug';
           slugInput.value = slug;
           
           const csrfInput = document.createElement('input');
           csrfInput.type = 'hidden';
           csrfInput.name = '_csrf';
           csrfInput.value = document.getElementById('csrf')?.value || '';
           
           form.appendChild(slugInput);
           form.appendChild(csrfInput);
           document.body.appendChild(form);
           form.submit();
       }
   }
}

// Enhanced keyboard shortcuts
document.addEventListener('keydown', (event) => {
   // Ctrl/Cmd + K for quick search focus
   if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
       event.preventDefault();
       const searchInput = document.getElementById('search');
       if (searchInput) {
           searchInput.focus();
           searchInput.select();
       }
   }
   
   // Escape to clear search
   if (event.key === 'Escape') {
       const searchInput = document.getElementById('search');
       if (searchInput && searchInput === document.activeElement) {
           searchInput.value = '';
           if (window.terrorHubStoryManager) {
               window.terrorHubStoryManager.handleSearchInput({ target: searchInput });
           }
       }
   }
});

// Performance monitoring
const performanceMonitor = {
   startTime: Date.now(),
   measurements: {},
   
   mark(name) {
       this.measurements[name] = Date.now();
   },
   
   measure(name, startMark) {
       const endTime = Date.now();
       const startTime = this.measurements[startMark] || this.startTime;
       const duration = endTime - startTime;
       console.log(`⏱️ ${name}: ${duration}ms`);
       return duration;
   }
};

// Enhanced error reporting
window.addEventListener('error', (event) => {
   console.error('🚨 JavaScript Error:', {
       message: event.message,
       filename: event.filename,
       lineno: event.lineno,
       colno: event.colno,
       error: event.error
   });
});

// Service worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
   window.addEventListener('load', () => {
       navigator.serviceWorker.register('/sw.js')
           .then(registration => {
               console.log('📱 SW registered: ', registration);
           })
           .catch(registrationError => {
               console.log('❌ SW registration failed: ', registrationError);
           });
   });
}

// Export for testing and external use
if (typeof module !== 'undefined' && module.exports) {
   module.exports = { 
       TerrorHubStoryManager,
       performanceMonitor 
   };
}

// Utility functions for external use
window.TerrorHubUtils = {
   formatNumber: (num) => {
       if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
       if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
       return num.toString();
   },
   
   formatLanguage: (lang) => {
       const languageMap = {
           'en': 'English',
           'es': 'Español',
           'pt': 'Português', 
           'fr': 'Français',
           'de': 'Deutsch',
           'English': 'English',
           'Spanish': 'Español'
       };
       return languageMap[lang] || lang;
   },
   
   debounce: (func, wait) => {
       let timeout;
       return function executedFunction(...args) {
           const later = () => {
               clearTimeout(timeout);
               func(...args);
           };
           clearTimeout(timeout);
           timeout = setTimeout(later, wait);
       };
   },
   
   throttle: (func, limit) => {
       let inThrottle;
       return function() {
           const args = arguments;
           const context = this;
           if (!inThrottle) {
               func.apply(context, args);
               inThrottle = true;
               setTimeout(() => inThrottle = false, limit);
           }
       };
   }
};

// Analytics integration (placeholder)
window.TerrorHubAnalytics = {
   trackSearch: (query, results) => {
       // Implement analytics tracking
       console.log('📊 Search tracked:', { query, resultsCount: results });
   },
   
   trackStoryView: (storyId, storyTitle) => {
       // Implement story view tracking
       console.log('👁️ Story view tracked:', { storyId, storyTitle });
   },
   
   trackUserAction: (action, details) => {
       // Implement user action tracking
       console.log('🎯 User action tracked:', { action, details });
   }
};

// Accessibility enhancements
document.addEventListener('DOMContentLoaded', () => {
   // Add ARIA labels dynamically
   const searchInput = document.getElementById('search');
   if (searchInput) {
       searchInput.setAttribute('aria-label', 'Search for horror stories by title, author, or keywords');
       searchInput.setAttribute('role', 'searchbox');
   }
   
   // Add focus indicators for keyboard navigation
   const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
   focusableElements.forEach(element => {
       element.addEventListener('focus', () => {
           element.classList.add('keyboard-focus');
       });
       
       element.addEventListener('blur', () => {
           element.classList.remove('keyboard-focus');
       });
   });
   
   // Announce search results to screen readers
   const announceResults = (count) => {
       const announcement = document.createElement('div');
       announcement.setAttribute('aria-live', 'polite');
       announcement.setAttribute('aria-atomic', 'true');
       announcement.className = 'sr-only';
       announcement.textContent = `Found ${count} stories`;
       document.body.appendChild(announcement);
       
       setTimeout(() => {
           document.body.removeChild(announcement);
       }, 1000);
   };
   
   // Override the display stories method to include accessibility
   if (window.terrorHubStoryManager) {
       const originalDisplayStories = window.terrorHubStoryManager.displayStories;
       window.terrorHubStoryManager.displayStories = function(stories) {
           originalDisplayStories.call(this, stories);
           announceResults(stories.length);
       };
   }
});

console.log('🎉 Enhanced TerrorHub Story Manager v3.0 fully loaded with Ultimate Search, accessibility, and performance monitoring!');