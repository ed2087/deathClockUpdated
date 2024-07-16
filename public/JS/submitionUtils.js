document.addEventListener('DOMContentLoaded', () => {
    const tagsInput = id_('tagsInput');
    const tagsInputFake = id_('tagsInput_fake');
    const tagsContainer = id_('tagsContainer');

    const extraTagsInput = id_('extraTagsInput');
    const extraTagsInputFake = id_('extraTagsInput_fake');
    const extraTagsContainer = id_('extraTagsContainer');

    const createTagBox = (tag, container, input) => {
        const tagBox = create_('div');
        tagBox.className = 'tag-box';
        tagBox.textContent = tag;

        const removeBtn = create_('span');
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
});