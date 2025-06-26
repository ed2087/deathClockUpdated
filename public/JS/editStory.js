console.log('Enhanced edit story.js loaded');

// Enhanced edit story system
class EnhancedEditForm {
    constructor() {
        this.selectedTags = [];
        this.isLoading = false;
        this.debounceTimer = null;
        
        this.init();
    }

    init() {
        this.loadExistingTags();
        this.setupEventListeners();
        this.setupCollapsibleSections();
        this.setupCharacterCounters();
        this.setupSmartTagSystem();
        this.setupFormValidation();
        this.setupUrlValidation();
        console.log('Enhanced edit form initialized successfully');
    }

    loadExistingTags() {
        try {
            // Load existing tags from hidden input (more reliable)
            const tagsInput = document.querySelector('input[name="existingTags"]');
            if (tagsInput && tagsInput.value) {
                const tagString = tagsInput.value.trim();
                if (tagString) {
                    this.selectedTags = tagString.split(',')
                        .map(tag => tag.trim().toLowerCase())
                        .filter(tag => tag);
                    this.renderSelectedTags();
                    console.log('Loaded existing tags:', this.selectedTags);
                }
            }
        } catch (error) {
            console.error('Error loading existing tags:', error);
            this.selectedTags = [];
        }
    }

    setupEventListeners() {
        // Form submission
        const form = id_('edit_form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmission(e));
        }

        // Real-time validation and character counting
        const storyTitle = id_('storyTitle');
        if (storyTitle) {
            storyTitle.addEventListener('input', () => this.updateCharCount('storyTitle', 100));
        }

        const storySummary = id_('storySummary');
        if (storySummary) {
            storySummary.addEventListener('input', () => this.updateCharCount('storySummary', 800));
        }

        const storyText = id_('storyText');
        if (storyText) {
            storyText.addEventListener('input', () => this.updateCharCount('storyText', 40000));
        }

        // Category validation
        const primaryGenre = id_('primaryGenre');
        if (primaryGenre) {
            primaryGenre.addEventListener('change', () => this.validateForm());
        }

        const format = id_('format');
        if (format) {
            format.addEventListener('change', () => this.validateForm());
        }

        const theme = id_('theme');
        if (theme) {
            theme.addEventListener('change', () => this.validateForm());
        }
    }

    setupCollapsibleSections() {
        const optionalToggle = id_('optional_toggle');
        const optionalContent = id_('optional_content');
        const toggleIcon = optionalToggle?.querySelector('.toggle_icon');

        if (optionalToggle && optionalContent) {
            optionalToggle.addEventListener('click', () => {
                optionalContent.classList.toggle('collapsed');
                toggleIcon?.classList.toggle('rotated');
                
                // Save preference
                localStorage.setItem('editOptionalSectionCollapsed', optionalContent.classList.contains('collapsed'));
            });

            // Restore previous state or show expanded by default for editing
            const wasCollapsed = localStorage.getItem('editOptionalSectionCollapsed') === 'true';
            if (wasCollapsed) {
                optionalContent.classList.add('collapsed');
                toggleIcon?.classList.add('rotated');
            }
        }
    }

    setupCharacterCounters() {
        this.updateCharCount('storyTitle', 100);
        this.updateCharCount('storySummary', 800);
        this.updateCharCount('storyText', 40000);
    }

    updateCharCount(fieldId, maxChars) {
        const field = id_(fieldId);
        const counter = id_(fieldId + '_count');
        
        if (field && counter) {
            const currentLength = field.value.length;
            counter.textContent = currentLength;
            
            const counterParent = counter.parentElement;
            counterParent.classList.remove('warning', 'danger');
            
            if (currentLength > maxChars * 0.9) {
                counterParent.classList.add('warning');
            }
            if (currentLength > maxChars) {
                counterParent.classList.add('danger');
            }
        }
    }

    setupSmartTagSystem() {
        const tagsInput = id_('tagsInput');
        const suggestionsContainer = id_('tag_suggestions');
        
        if (tagsInput && suggestionsContainer) {
            tagsInput.addEventListener('input', (e) => {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.handleTagInput(e.target.value.trim());
                }, 300);
            });

            tagsInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const value = e.target.value.trim().replace(/,$/, '');
                    if (value) {
                        this.addTag(value);
                        e.target.value = '';
                        this.hideSuggestions();
                    }
                }

                if (e.key === 'Backspace' && e.target.value === '' && this.selectedTags.length > 0) {
                    this.removeTag(this.selectedTags[this.selectedTags.length - 1]);
                }
            });

            document.addEventListener('click', (e) => {
                if (!tagsInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                    this.hideSuggestions();
                }
            });

            tagsInput.addEventListener('focus', () => {
                if (tagsInput.value.trim().length >= 2) {
                    this.handleTagInput(tagsInput.value.trim());
                }
            });
        }
    }

    async handleTagInput(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        try {
            const response = await fetch(`/terrorTales/api/tags/search?q=${encodeURIComponent(query)}&limit=6`);
            const data = await response.json();
            
            if (data.status === 'success' && Array.isArray(data.data)) {
                const suggestions = data.data
                    .filter(tag => !this.selectedTags.includes(tag.name.toLowerCase()))
                    .slice(0, 5);
                this.showSuggestions(suggestions);
            } else {
                // Fallback to local suggestions
                this.showFallbackSuggestions(query);
            }
        } catch (error) {
            console.error('Error fetching tag suggestions:', error);
            this.showFallbackSuggestions(query);
        }
    }

    showFallbackSuggestions(query) {
        const fallbackTags = [
            'atmospheric', 'suspense', 'psychological', 'supernatural', 'haunted',
            'ghost', 'demon', 'witch', 'forest', 'cemetery', 'abandoned',
            'nightmare', 'curse', 'ritual', 'possession', 'paranormal',
            'creepy', 'eerie', 'disturbing', 'chilling', 'terrifying',
            'monster', 'creature', 'entity', 'spirit', 'apparition'
        ];

        const suggestions = fallbackTags
            .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
            .filter(tag => !this.selectedTags.includes(tag))
            .slice(0, 5)
            .map(tag => ({ name: tag, usageCount: Math.floor(Math.random() * 20) + 1 }));

        this.showSuggestions(suggestions);
    }

    showSuggestions(suggestions) {
        const container = id_('tag_suggestions');
        if (!container || !suggestions || suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        container.innerHTML = suggestions.map(tag => {
            const displayName = typeof tag === 'string' ? tag : tag.name;
            const usageCount = typeof tag === 'object' ? tag.usageCount : '';
            const usageText = usageCount ? ` (${usageCount})` : '';
            
            return `<div class="suggestion_item" onclick="editForm.addTag('${displayName}')">
                ${displayName}<span class="usage_count">${usageText}</span>
            </div>`;
        }).join('');

        container.style.display = 'block';
    }

    hideSuggestions() {
        const container = id_('tag_suggestions');
        if (container) {
            container.style.display = 'none';
        }
    }

    addTag(tag) {
        const cleanTag = tag.toLowerCase().trim();
        
        if (this.selectedTags.includes(cleanTag) || this.selectedTags.length >= 8) {
            if (this.selectedTags.length >= 8) {
                globalMessage("Tag Limit", "You can add a maximum of 8 tags per story.");
            }
            return;
        }

        this.selectedTags.push(cleanTag);
        this.renderSelectedTags();
        
        const tagsInput = id_('tagsInput');
        if (tagsInput) {
            tagsInput.value = '';
            tagsInput.focus();
        }
        
        this.hideSuggestions();
    }

    removeTag(tag) {
        this.selectedTags = this.selectedTags.filter(t => t !== tag);
        this.renderSelectedTags();
    }

    renderSelectedTags() {
        const container = id_('selected_tags');
        if (!container) return;

        container.innerHTML = this.selectedTags.map(tag => 
            `<div class="tag_pill">
                ${tag}
                <span class="tag_remove" onclick="editForm.removeTag('${tag}')" title="Remove tag">×</span>
            </div>`
        ).join('');
    }

    setupUrlValidation() {
        const backgroundUrl = id_('backgroundUrl');
        if (backgroundUrl) {
            backgroundUrl.addEventListener('blur', () => this.validateBackgroundUrl());
            backgroundUrl.addEventListener('input', () => this.validateBackgroundUrl());
        }

        const youtubeVideo = id_('youtubeVideo');
        if (youtubeVideo) {
            youtubeVideo.addEventListener('blur', () => this.validateYouTubeUrl());
            youtubeVideo.addEventListener('input', () => this.validateYouTubeUrl());
        }

        // Social media URL validation
        const socialMediaFields = ['facebook', 'twitter', 'instagram', 'youtube'];
        socialMediaFields.forEach(platform => {
            const field = document.querySelector(`[name="${platform}"]`);
            if (field) {
                field.addEventListener('blur', () => this.validateSocialMediaUrl(field));
                field.addEventListener('input', () => this.validateSocialMediaUrl(field));
            }
        });
    }

    validateBackgroundUrl() {
        const field = id_('backgroundUrl');
        if (!field) return true;

        const url = field.value.trim();
        if (!url) {
            field.style.borderColor = '';
            return true;
        }

        const allowedDomains = ['imgur.com', 'tumblr.com', 'flickr.com', 'pinterest.com', 'photobucket.com'];
        const allowedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

        const isValidDomain = allowedDomains.some(domain => url.toLowerCase().includes(domain));
        const isValidFormat = allowedFormats.some(format => url.toLowerCase().endsWith(format));

        if (!this.isValidUrl(url)) {
            field.style.borderColor = '#ff6b6b';
            return false;
        }

        if (!isValidDomain || !isValidFormat) {
            field.style.borderColor = '#ffc107';
            return false;
        }

        field.style.borderColor = '#4CAF50';
        return true;
    }

    validateSocialMediaUrl(field) {
        if (!field) return true;

        const url = field.value.trim();
        if (!url) {
            field.style.borderColor = '';
            return true;
        }

        if (this.isValidUrl(url)) {
            field.style.borderColor = '#4CAF50';
            return true;
        } else {
            field.style.borderColor = '#ff6b6b';
            return false;
        }
    }

    validateYouTubeUrl() {
        const field = id_('youtubeVideo');
        if (!field) return true;

        const url = field.value.trim();
        if (!url) {
            field.style.borderColor = '';
            return true;
        }

        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)/i;
        
        if (youtubeRegex.test(url)) {
            field.style.borderColor = '#4CAF50';
            return true;
        } else {
            field.style.borderColor = '#ffc107';
            return false;
        }
    }

    isValidUrl(string) {
        try {
            const url = string.startsWith('http') ? string : 'https://' + string;
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    setupFormValidation() {
        const form = id_('edit_form');
        
        if (form) {
            const allInputs = form.querySelectorAll('input, textarea, select');
            allInputs.forEach(input => {
                input.addEventListener('input', () => this.validateForm());
                input.addEventListener('change', () => this.validateForm());
            });
        }
        
        this.validateForm();
    }

    validateForm() {
        const submitButton = id_('storyUpdate_form');
        if (!submitButton) return;

        const requiredFields = [
            { id: 'legalName', min: 2, max: 100 },
            { id: 'storyTitle', min: 5, max: 100 },
            { id: 'storySummary', min: 20, max: 800 },
            { id: 'storyText', min: 100, max: 40000 },
            { id: 'primaryGenre', min: 1 }
        ];

        let isValid = true;
        let errorMessage = '';

        for (const field of requiredFields) {
            const element = id_(field.id);
            if (!element) continue;

            const value = element.value.trim();
            
            if (!value) {
                isValid = false;
                errorMessage = `${field.id.replace(/([A-Z])/g, ' $1')} is required`;
                break;
            }

            if (field.min && value.length < field.min) {
                isValid = false;
                errorMessage = `${field.id.replace(/([A-Z])/g, ' $1')} must be at least ${field.min} characters`;
                break;
            }

            if (field.max && value.length > field.max) {
                isValid = false;
                errorMessage = `${field.id.replace(/([A-Z])/g, ' $1')} must be ${field.max} characters or less`;
                break;
            }
        }

        // Update button state
        submitButton.disabled = !isValid;
        
        // Update button text based on validation
        const submitText = submitButton.querySelector('.submit_text');
        if (submitText) {
            if (!isValid && errorMessage) {
                submitText.textContent = errorMessage;
                submitButton.title = errorMessage;
            } else {
                submitText.textContent = 'Update Your Story';
                submitButton.title = '';
            }
        }

        return isValid;
    }

async handleSubmission(e) {
    e.preventDefault();
    
    if (this.isLoading) return;
    
    if (!this.validateForm()) {
        globalMessage("Form Incomplete", "Please complete all required fields before updating.");
        return;
    }
    
    this.isLoading = true;
    this.showLoadingState();

    try {
        const formData = this.collectFormData();
        console.log('Submitting update data:', formData);

        const response = await fetch('/terrorTales/editStory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('Response received:', response.status, response.statusText);
        console.log('Response headers:', response.headers);

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);

        if (!contentType || !contentType.includes('application/json')) {
            console.error('Response is not JSON:', contentType);
            const text = await response.text();
            console.error('Response text:', text);
            this.hideLoadingState();
            globalMessage("Server Error", "Server returned an invalid response. Please try again.");
            return;
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok && data.status === 200) {
            globalMessage("Success! 🎉", data.message || "Your story has been updated successfully!");
            
            // Redirect after showing success message
            setTimeout(() => {
                window.location.href = data.redirectUrl || `/terrorTales/horrorStory/${data.slug}`;
            }, 2000);
        } else {
            this.hideLoadingState();
            globalMessage("Update Issue", data.message || "There was a problem updating your story.");
        }

    } catch (error) {
        console.error('Update error:', error);
        this.hideLoadingState();
        globalMessage("Connection Problem", "We couldn't connect to our servers. Please try again.");
    }
}

collectFormData() {
    const form = id_('edit_form');
    const formData = {};

    // Get CSRF token
    const csrfInput = form.querySelector('input[name="_csrf"]');
    if (csrfInput) {
        formData._csrf = csrfInput.value;
    }

    // Get the story ID from hidden input
    const storyIdInput = form.querySelector('input[name="storyId"]');
    if (storyIdInput) {
        formData.storyId = storyIdInput.value;
    }

    // Collect basic form fields
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
        if (field.name && field.type !== 'checkbox' && field.type !== 'hidden') {
            formData[field.name] = field.value.trim();
        }
    });

    // Social media (maintain order, empty strings for blanks)
    const socialMedia = [];
    const socialFields = ['facebook', 'twitter', 'instagram', 'youtube'];
    socialFields.forEach(platform => {
        const field = form.querySelector(`[name="${platform}"]`);
        socialMedia.push(field && field.value.trim() ? field.value.trim() : '');
    });
    formData.socialMedia = socialMedia;

    // Enhanced categorization
    formData.primaryGenre = id_('primaryGenre')?.value || '';
    formData.format = id_('format')?.value || '';
    formData.theme = id_('theme')?.value || '';

    // Background URL
    formData.backgroundUrl = id_('backgroundUrl')?.value.trim() || '';

    // YouTube video
    formData.youtubeVideo = id_('youtubeVideo')?.value.trim() || '';

    // Tags
    formData.tags = this.selectedTags.join(',');

    console.log('Collected form data:', formData);
    return formData;
}

   validateSubmissionData(formData) {
       // Check required fields
       const requiredFields = [
           { field: 'legalName', name: 'Legal Name', min: 2, max: 100 },
           { field: 'storyTitle', name: 'Story Title', min: 5, max: 100 },
           { field: 'storySummary', name: 'Story Summary', min: 20, max: 800 },
           { field: 'storyText', name: 'Story Text', min: 100, max: 40000 },
           { field: 'primaryGenre', name: 'Primary Genre', min: 1 }
       ];
       
       for (const { field, name, min, max } of requiredFields) {
           const value = formData[field];
           
           if (!value || value.trim() === '') {
               globalMessage("Missing Information", `${name} is required.`);
               return false;
           }

           if (min && value.length < min) {
               globalMessage("Input Too Short", `${name} must be at least ${min} characters.`);
               return false;
           }

           if (max && value.length > max) {
               globalMessage("Input Too Long", `${name} must be ${max} characters or less.`);
               return false;
           }
       }

       // Validate URLs (only if they're provided)
       if (formData.backgroundUrl && !this.validateUrlFormat(formData.backgroundUrl)) {
           globalMessage("Invalid Background URL", "Please enter a valid image URL from an allowed domain.");
           return false;
       }

       // Validate social media URLs
       const socialMediaErrors = [];
       formData.socialMedia.forEach((url, index) => {
           if (url && !this.validateUrlFormat(url)) {
               const platforms = ['Facebook', 'Twitter', 'Instagram', 'YouTube'];
               socialMediaErrors.push(platforms[index] || `Social media ${index + 1}`);
           }
       });

       if (socialMediaErrors.length > 0) {
           globalMessage("Invalid Social Media URLs", 
               `Please check these social media URLs: ${socialMediaErrors.join(', ')}`);
           return false;
       }

       // Validate YouTube video URL
       if (formData.youtubeVideo && !this.validateYouTubeUrlFormat(formData.youtubeVideo)) {
           globalMessage("Invalid YouTube URL", "Please enter a valid YouTube video URL.");
           return false;
       }

       return true;
   }

   validateUrlFormat(url) {
       if (!url || url.trim() === '') return true; // Optional field
       
       try {
           const testUrl = url.startsWith('http') ? url : 'https://' + url;
           new URL(testUrl);
           return true;
       } catch {
           return false;
       }
   }

   validateYouTubeUrlFormat(url) {
       if (!url || url.trim() === '') return true; // Optional field
       
       const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)/i;
       return youtubeRegex.test(url);
   }

   showLoadingState() {
       const submitButton = id_('storyUpdate_form');
       const submitText = submitButton?.querySelector('.submit_text');
       const submitLoading = submitButton?.querySelector('.submit_loading');

       if (submitText) submitText.style.display = 'none';
       if (submitLoading) submitLoading.style.display = 'block';
       
       if (submitButton) {
           submitButton.disabled = true;
           submitButton.style.cursor = 'not-allowed';
       }
   }

   hideLoadingState() {
       const submitButton = id_('storyUpdate_form');
       const submitText = submitButton?.querySelector('.submit_text');
       const submitLoading = submitButton?.querySelector('.submit_loading');

       if (submitText) submitText.style.display = 'block';
       if (submitLoading) submitLoading.style.display = 'none';
       
       this.isLoading = false;
       
       if (submitButton) {
           submitButton.style.cursor = 'pointer';
       }
       
       this.validateForm();
   }
}

// Initialize the edit form
let editForm;
document.addEventListener('DOMContentLoaded', () => {
   editForm = new EnhancedEditForm();
   console.log('Edit form ready for enhanced editing');
});

// Legacy compatibility functions
const handleCharacterCount = (fieldId, maxLength) => {
   const field = id_(fieldId);
   if (field && editForm) {
       field.addEventListener('input', () => {
           editForm.updateCharCount(fieldId, maxLength);
       });
   }
};

// Validation helper functions
const validateUrl = (url) => {
   if (!url || url.trim() === '') return true;
   
   try {
       new URL(url.startsWith('http') ? url : 'https://' + url);
       return true;
   } catch {
       return false;
   }
};

const validateImageUrl = (url) => {
   if (!url || url.trim() === '') return true;
   
   const allowedDomains = ['imgur.com', 'tumblr.com', 'flickr.com', 'pinterest.com', 'photobucket.com'];
   const allowedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
   
   const isValidDomain = allowedDomains.some(domain => url.includes(domain));
   const isValidFormat = allowedFormats.some(format => url.toLowerCase().endsWith(format));
   
   return isValidDomain && isValidFormat;
};

// Global helper for tag system
window.addTagFromSuggestion = (tagName) => {
   if (editForm) {
       editForm.addTag(tagName);
   }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
   module.exports = { EnhancedEditForm };
}