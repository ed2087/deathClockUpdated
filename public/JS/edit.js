document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('submission_form');

    // Prevent form submission on Enter key press
    form.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
            event.preventDefault();
        }
    });

    const tagsInputFake = document.getElementById('tagsInput_fake');
    const tagsContainer = document.getElementById('tagsContainer');
    const tagsInput = document.getElementById('tagsInput');

    const extraTagsInputFake = document.getElementById('extraTagsInput_fake');
    const extraTagsContainer = document.getElementById('extraTagsContainer');
    const extraTagsInput = document.getElementById('extraTagsInput');

    const categoriesInputFake = document.getElementById('categoriesInput_fake');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const categoriesInput = document.getElementById('categoriesInput');

    const createTagBox = (tag, container, input) => {
        const tagBox = document.createElement('div');
        tagBox.className = 'tag-box';
        tagBox.textContent = tag;

        const removeBtn = document.createElement('span');
        removeBtn.textContent = '×';
        removeBtn.className = 'remove-tag';
        removeBtn.onclick = () => {
            container.removeChild(tagBox);
            updateHiddenInput(container, input);
        };

        tagBox.appendChild(removeBtn);
        return tagBox;
    };

    const updateHiddenInput = (container, input) => {
        const tags = [];
        container.querySelectorAll('.tag-box').forEach(tagBox => {
            tags.push(tagBox.textContent.slice(0, -1)); // Remove the '×' character
        });
        input.value = tags.join(',');
    };

    const addTag = (inputFake, container, input) => {
        const tag = inputFake.value.trim().replace(/,$/, ''); // Remove comma at the end if present
        if (tag) {
            const tagBox = createTagBox(tag, container, input);
            container.appendChild(tagBox);
            inputFake.value = '';
            updateHiddenInput(container, input);
            inputFake.focus();
        }
    };

    const handleKeyPress = (event, inputFake, container, input) => {
        if ((event.key === ',' || event.key === 'Enter') && event.target === inputFake) {
            event.preventDefault();
            addTag(inputFake, container, input);
        }
    };

    tagsInputFake.addEventListener('keyup', (event) => handleKeyPress(event, tagsInputFake, tagsContainer, tagsInput));
    tagsInputFake.addEventListener('blur', () => addTag(tagsInputFake, tagsContainer, tagsInput));

    extraTagsInputFake.addEventListener('keyup', (event) => handleKeyPress(event, extraTagsInputFake, extraTagsContainer, extraTagsInput));
    extraTagsInputFake.addEventListener('blur', () => addTag(extraTagsInputFake, extraTagsContainer, extraTagsInput));

    // Populate existing tags
    const existingTags = tagsInput.value.split(',');
    existingTags.forEach(tag => {
        if (tag.trim()) {
            const tagBox = createTagBox(tag.trim(), tagsContainer, tagsInput);
            tagsContainer.appendChild(tagBox);
        }
    });

    const existingExtraTags = extraTagsInput.value.split(',');
    existingExtraTags.forEach(tag => {
        if (tag.trim()) {
            const tagBox = createTagBox(tag.trim(), extraTagsContainer, extraTagsInput);
            extraTagsContainer.appendChild(tagBox);
        }
    });
});

