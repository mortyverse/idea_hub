/**
 * 아이디어 수정 페이지 JavaScript
 * Idea Edit Page JavaScript
 */

class IdeaEditPage {
    constructor() {
        this.ideaId = this.getIdeaIdFromURL();
        this.form = document.getElementById('idea-edit-form');
        this.titleInput = document.getElementById('idea-title');
        this.contentInput = document.getElementById('idea-content');
        this.tagsInput = document.getElementById('idea-tags');
        this.writerInput = document.getElementById('idea-writer');
        this.previewToggle = document.getElementById('preview-toggle');
        this.submitBtn = document.getElementById('submit-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        
        // Preview elements
        this.previewCard = document.getElementById('preview-card');
        this.previewTitle = document.getElementById('preview-title');
        this.previewContent = document.getElementById('preview-content');
        this.previewWriter = document.getElementById('preview-writer');
        this.previewDate = document.getElementById('preview-date');
        this.previewTags = document.getElementById('preview-tags');
        
        // State elements
        this.loadingState = document.getElementById('loading-state');
        this.errorState = document.getElementById('error-state');
        this.editFormContent = document.getElementById('edit-form-content');
        
        // Modal elements
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.successModal = document.getElementById('success-modal');
        this.viewIdeaBtn = document.getElementById('view-idea-btn');
        this.continueEditBtn = document.getElementById('continue-edit-btn');
        
        // Tag system
        this.tagsDisplay = document.getElementById('tags-display');
        this.tagsSuggestions = document.getElementById('tags-suggestions');
        this.selectedTags = new Set();
        this.availableTags = [];
        
        // Form state
        this.isPreviewMode = false;
        this.isSubmitting = false;
        this.originalData = null;
        
        this.init();
    }
    
    init() {
        if (!this.ideaId) {
            this.showError('유효하지 않은 아이디어 ID입니다.');
            return;
        }
        
        this.setupEventListeners();
        this.loadIdeaData();
        this.loadAvailableTags();
        this.setupFormValidation();
        this.setupCharacterCounter();
        this.generateCSRFToken();
    }
    
    getIdeaIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        return id ? parseInt(id, 10) : null;
    }
    
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Preview toggle
        this.previewToggle.addEventListener('click', () => this.togglePreview());
        
        // Cancel button
        this.cancelBtn.addEventListener('click', () => this.handleCancel());
        
        // Tag input events
        this.tagsInput.addEventListener('keydown', (e) => this.handleTagInput(e));
        this.tagsInput.addEventListener('input', () => this.handleTagSuggestions());
        this.tagsInput.addEventListener('blur', () => this.hideTagSuggestions());
        
        // Modal events
        this.viewIdeaBtn.addEventListener('click', () => this.viewIdea());
        this.continueEditBtn.addEventListener('click', () => this.continueEdit());
        
        // Close modal events
        document.querySelector('.modal-close').addEventListener('click', () => this.closeSuccessModal());
        document.querySelector('.modal-overlay').addEventListener('click', () => this.closeSuccessModal());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    setupFormValidation() {
        // Real-time validation
        this.titleInput.addEventListener('blur', () => this.validateTitle());
        this.contentInput.addEventListener('blur', () => this.validateContent());
        
        // Input validation
        this.titleInput.addEventListener('input', () => this.clearFieldError('title'));
        this.contentInput.addEventListener('input', () => this.clearFieldError('content'));
    }
    
    setupCharacterCounter() {
        this.contentInput.addEventListener('input', () => {
            const current = this.contentInput.value.length;
            const max = 5000;
            
            const counter = document.querySelector('.counter-current');
            
            if (counter) {
                counter.textContent = current.toLocaleString();
                
                // Change color when approaching limit
                if (current > max * 0.9) {
                    counter.style.color = '#e74c3c';
                } else if (current > max * 0.8) {
                    counter.style.color = '#f39c12';
                } else {
                    counter.style.color = '#e67e22';
                }
            }
        });
    }
    
    generateCSRFToken() {
        const tokenInput = document.getElementById('csrf-token');
        if (tokenInput) {
            tokenInput.value = this.generateRandomToken();
        }
    }
    
    generateRandomToken() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    
    async loadIdeaData() {
        try {
            this.showLoadingState();
            
            const idea = await this.fetchIdeaDetails();
            
            if (!idea) {
                this.showErrorState('아이디어를 찾을 수 없습니다.');
                return;
            }
            
            // Check if user can edit (simple check - in production, this should be server-side)
            // For now, we'll allow editing if writer matches what user enters
            
            this.originalData = idea;
            this.populateForm(idea);
            this.showEditForm();
            
        } catch (error) {
            console.error('Failed to load idea data:', error);
            this.showErrorState('아이디어를 불러오는 중 오류가 발생했습니다.');
        }
    }
    
    async fetchIdeaDetails() {
        const apiPaths = [
            `../../api/ideas/detail-simple.php?id=${this.ideaId}`,
            `/api/ideas/detail-simple.php?id=${this.ideaId}`,
            `api/ideas/detail-simple.php?id=${this.ideaId}`,
            `../../api/ideas/detail.php?id=${this.ideaId}`,
            `/api/ideas/detail.php?id=${this.ideaId}`,
            `api/ideas/detail.php?id=${this.ideaId}`
        ];
        
        for (const apiPath of apiPaths) {
            try {
                console.log('Fetching idea details from:', apiPath);
                const response = await fetch(apiPath);
                
                if (!response.ok) {
                    console.error('HTTP error:', response.status);
                    continue;
                }
                
                const data = await response.json();
                
                if (data.success && data.data) {
                    console.log('Idea details loaded successfully');
                    return data.data;
                } else {
                    console.error('Failed to load idea details:', data.error);
                }
            } catch (error) {
                console.error('Failed to fetch from', apiPath, ':', error);
            }
        }
        
        return null;
    }
    
    populateForm(idea) {
        // Set hidden fields
        document.getElementById('idea-id').value = idea.id;
        document.getElementById('original-writer').value = idea.writer;
        
        // Set form fields
        this.titleInput.value = idea.title;
        this.contentInput.value = idea.content;
        this.writerInput.value = idea.writer;
        
        // Set tags
        if (idea.tags && Array.isArray(idea.tags)) {
            this.selectedTags = new Set(idea.tags);
            this.updateTagsDisplay();
        }
        
        // Set edit info
        document.getElementById('created-date').textContent = this.formatDate(idea.created_at);
        document.getElementById('updated-date').textContent = idea.updated_at ? 
            this.formatDate(idea.updated_at) : '수정된 적 없음';
        
        // Update breadcrumb
        const detailLink = document.getElementById('detail-link');
        if (detailLink) {
            detailLink.href = `detail.html?id=${idea.id}`;
            detailLink.textContent = idea.title.length > 20 ? 
                idea.title.substring(0, 20) + '...' : idea.title;
        }
        
        // Update character counter
        this.setupCharacterCounter();
        this.contentInput.dispatchEvent(new Event('input'));
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    async loadAvailableTags() {
        const apiPaths = [
            '../../api/ideas/tags-simple.php?limit=50&sort=usage_count',
            '/api/ideas/tags-simple.php?limit=50&sort=usage_count',
            'api/ideas/tags-simple.php?limit=50&sort=usage_count',
            '../../api/ideas/tags.php?limit=50&sort=usage_count',
            '/api/ideas/tags.php?limit=50&sort=usage_count',
            'api/ideas/tags.php?limit=50&sort=usage_count'
        ];
        
        for (const apiPath of apiPaths) {
            try {
                const response = await fetch(apiPath);
                
                if (!response.ok) continue;
                
                const data = await response.json();
                
                if (data.success) {
                    this.availableTags = data.data.tags.map(tag => ({
                        name: tag.name,
                        count: tag.usage_count
                    }));
                    return;
                }
            } catch (error) {
                console.error('Failed to load tags from', apiPath, ':', error);
            }
        }
        
        // Default tags if all paths failed
        this.availableTags = [
            { name: '기술', count: 10 },
            { name: '창의', count: 8 },
            { name: '교육', count: 6 },
            { name: '비즈니스', count: 5 },
            { name: '디자인', count: 4 },
            { name: '환경', count: 3 },
            { name: 'AI', count: 7 },
            { name: '협업', count: 2 }
        ];
    }
    
    handleTagInput(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tagValue = this.tagsInput.value.trim();
            if (tagValue) {
                this.addTag(tagValue);
            }
        } else if (e.key === 'Backspace' && this.tagsInput.value === '' && this.selectedTags.size > 0) {
            const lastTag = Array.from(this.selectedTags).pop();
            this.removeTag(lastTag);
        } else if (e.key === ',' || e.key === ' ') {
            e.preventDefault();
            const tagValue = this.tagsInput.value.trim();
            if (tagValue) {
                this.addTag(tagValue);
            }
        }
    }
    
    handleTagSuggestions() {
        const query = this.tagsInput.value.trim().toLowerCase();
        
        if (query.length === 0) {
            this.hideTagSuggestions();
            return;
        }
        
        const suggestions = this.availableTags
            .filter(tag => 
                tag.name.toLowerCase().includes(query) && 
                !this.selectedTags.has(tag.name)
            )
            .slice(0, 5);
        
        this.showTagSuggestions(suggestions);
    }
    
    showTagSuggestions(suggestions) {
        if (suggestions.length === 0) {
            this.hideTagSuggestions();
            return;
        }
        
        this.tagsSuggestions.innerHTML = suggestions
            .map(tag => `
                <div class="tag-suggestion" data-tag="${tag.name}">
                    <span class="tag-suggestion-name">${tag.name}</span>
                    <span class="tag-suggestion-count">(${tag.count})</span>
                </div>
            `).join('');
        
        this.tagsSuggestions.querySelectorAll('.tag-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                const tagName = suggestion.dataset.tag;
                this.addTag(tagName);
            });
        });
        
        this.tagsSuggestions.style.display = 'block';
    }
    
    hideTagSuggestions() {
        setTimeout(() => {
            this.tagsSuggestions.style.display = 'none';
        }, 150);
    }
    
    addTag(tagName) {
        tagName = tagName.trim().replace(/[,\s]+/g, ' ').trim();
        
        if (!tagName || this.selectedTags.has(tagName) || this.selectedTags.size >= 10) {
            return;
        }
        
        if (tagName.length > 20) {
            this.showNotification('태그는 20자 이하로 입력해주세요.', 'error');
            return;
        }
        
        this.selectedTags.add(tagName);
        this.updateTagsDisplay();
        this.tagsInput.value = '';
        this.hideTagSuggestions();
    }
    
    removeTag(tagName) {
        this.selectedTags.delete(tagName);
        this.updateTagsDisplay();
    }
    
    updateTagsDisplay() {
        if (this.selectedTags.size === 0) {
            this.tagsDisplay.innerHTML = '<span class="no-tags-text">태그를 입력하고 Enter를 누르세요</span>';
            return;
        }
        
        this.tagsDisplay.innerHTML = Array.from(this.selectedTags)
            .map(tag => `
                <span class="tag-chip">
                    <span class="tag-chip-text">${tag}</span>
                    <button type="button" class="tag-chip-remove" data-tag="${tag}" aria-label="태그 제거">&times;</button>
                </span>
            `).join('');
        
        this.tagsDisplay.querySelectorAll('.tag-chip-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeTag(btn.dataset.tag);
            });
        });
    }
    
    togglePreview() {
        this.isPreviewMode = !this.isPreviewMode;
        
        if (this.isPreviewMode) {
            this.updatePreview();
            this.previewCard.style.display = 'block';
            this.previewToggle.innerHTML = '<span class="btn-icon">✏️</span><span class="btn-text">편집하기</span>';
        } else {
            this.previewCard.style.display = 'none';
            this.previewToggle.innerHTML = '<span class="btn-icon">👁️</span><span class="btn-text">미리보기</span>';
        }
    }
    
    updatePreview() {
        this.previewTitle.textContent = this.titleInput.value || '제목이 여기에 표시됩니다';
        this.previewContent.textContent = this.contentInput.value || '내용이 여기에 표시됩니다...';
        this.previewWriter.textContent = this.writerInput.value || '작성자';
        this.previewDate.textContent = '수정됨';
        
        this.previewTags.innerHTML = Array.from(this.selectedTags)
            .map(tag => `<span class="preview-tag">${tag}</span>`)
            .join('');
    }
    
    validateTitle() {
        const value = this.titleInput.value.trim();
        if (value.length === 0) {
            this.showFieldError('title', '제목을 입력해주세요.');
            return false;
        }
        if (value.length > 100) {
            this.showFieldError('title', '제목은 100자 이하로 입력해주세요.');
            return false;
        }
        this.clearFieldError('title');
        return true;
    }
    
    validateContent() {
        const value = this.contentInput.value.trim();
        if (value.length === 0) {
            this.showFieldError('content', '내용을 입력해주세요.');
            return false;
        }
        if (value.length > 5000) {
            this.showFieldError('content', '내용은 5000자 이하로 입력해주세요.');
            return false;
        }
        this.clearFieldError('content');
        return true;
    }
    
    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        const inputElement = document.getElementById(`idea-${fieldName}`);
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }
    
    clearFieldError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        const inputElement = document.getElementById(`idea-${fieldName}`);
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }
    
    validateForm() {
        const isTitleValid = this.validateTitle();
        const isContentValid = this.validateContent();
        
        return isTitleValid && isContentValid;
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }
        
        if (!this.validateForm()) {
            this.scrollToFirstError();
            return;
        }
        
        this.isSubmitting = true;
        this.showLoading();
        
        try {
            const formData = this.prepareFormData();
            console.log('Submitting edit form data:', formData);
            
            const response = await this.submitEdit(formData);
            console.log('Edit response received:', response);
            
            if (response && response.success) {
                console.log('Edit success! Showing success modal');
                this.showSuccessModal();
            } else {
                console.error('Edit response indicates failure:', response);
                this.showError(response?.error || '아이디어 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError(error.message || '아이디어 수정 중 오류가 발생했습니다.');
        } finally {
            this.isSubmitting = false;
            this.hideLoading();
        }
    }
    
    prepareFormData() {
        return {
            idea_id: this.ideaId,
            title: this.titleInput.value.trim(),
            content: this.contentInput.value.trim(),
            tags: Array.from(this.selectedTags),
            csrf_token: document.getElementById('csrf-token').value,
            original_writer: document.getElementById('original-writer').value
        };
    }
    
    async submitEdit(formData) {
        const apiPaths = [
            '../../api/ideas/edit.php',
            '/api/ideas/edit.php',
            'api/ideas/edit.php'
        ];
        
        let lastError;
        
        for (const apiPath of apiPaths) {
            try {
                console.log('Trying edit API path:', apiPath);
                const response = await fetch(apiPath, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('Response received from:', apiPath, 'Status:', response.status);
                
                const responseText = await response.text();
                console.log('Raw response:', responseText);
                
                if (!responseText.trim()) {
                    console.warn('Empty response from:', apiPath);
                    lastError = new Error('서버에서 빈 응답을 받았습니다.');
                    continue;
                }
                
                let data;
                try {
                    data = JSON.parse(responseText);
                    console.log('Parsed response:', data);
                } catch (parseError) {
                    console.error('JSON parse error from:', apiPath, parseError);
                    console.error('Raw response that failed to parse:', responseText);
                    lastError = new Error('서버 응답을 처리할 수 없습니다. 응답: ' + responseText.substring(0, 100));
                    continue;
                }
                
                if (data && typeof data === 'object') {
                    if (data.success === true) {
                        console.log('Success response from:', apiPath);
                        return data;
                    } else if (data.success === false) {
                        console.warn('API returned error from:', apiPath, data.error);
                        if (data.debug_error) {
                            console.error('Debug Error:', data.debug_error);
                            console.error('Debug Trace:', data.debug_trace);
                        }
                        let errorMessage = data.error || '아이디어 수정에 실패했습니다.';
                        if (data.debug_error) {
                            errorMessage += '\n\n디버그 정보: ' + data.debug_error;
                        }
                        lastError = new Error(errorMessage);
                        continue;
                    }
                }
                
                console.warn('Unexpected response format from:', apiPath, data);
                lastError = new Error('예상하지 못한 응답 형식입니다.');
                continue;
                
            } catch (error) {
                console.error('API path failed:', apiPath, error);
                lastError = error;
                continue;
            }
        }
        
        throw lastError || new Error('모든 API 경로에서 실패했습니다.');
    }
    
    showLoadingState() {
        this.loadingState.style.display = 'flex';
        this.errorState.style.display = 'none';
        this.editFormContent.style.display = 'none';
    }
    
    showErrorState(message) {
        this.loadingState.style.display = 'none';
        this.errorState.style.display = 'flex';
        this.editFormContent.style.display = 'none';
        
        const errorDescription = this.errorState.querySelector('.error-description');
        if (errorDescription) {
            errorDescription.innerHTML = message + '<br>아이디어 목록으로 돌아가서 다른 아이디어를 확인해보세요.';
        }
    }
    
    showEditForm() {
        this.loadingState.style.display = 'none';
        this.errorState.style.display = 'none';
        this.editFormContent.style.display = 'block';
    }
    
    showLoading() {
        this.loadingOverlay.style.display = 'flex';
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">수정 중...</span>';
    }
    
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = '<span class="btn-icon">💾</span><span class="btn-text">수정 완료</span>';
    }
    
    showSuccessModal() {
        this.successModal.style.display = 'flex';
    }
    
    closeSuccessModal() {
        this.successModal.style.display = 'none';
    }
    
    viewIdea() {
        window.location.href = `detail.html?id=${this.ideaId}`;
    }
    
    continueEdit() {
        this.closeSuccessModal();
    }
    
    scrollToFirstError() {
        const firstError = document.querySelector('.form-error-text[style*="block"]');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10001;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `${type}-notification`;
        const bgColor = type === 'error' ? '#e74c3c' : '#3498db';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10001;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    handleCancel() {
        // Check if there are unsaved changes
        if (this.hasUnsavedChanges()) {
            if (confirm('수정한 내용이 저장되지 않습니다. 정말 나가시겠습니까?')) {
                window.location.href = `detail.html?id=${this.ideaId}`;
            }
        } else {
            window.location.href = `detail.html?id=${this.ideaId}`;
        }
    }
    
    hasUnsavedChanges() {
        if (!this.originalData) return false;
        
        const currentTitle = this.titleInput.value.trim();
        const currentContent = this.contentInput.value.trim();
        const currentTags = Array.from(this.selectedTags).sort();
        const originalTags = (this.originalData.tags || []).sort();
        
        return (
            currentTitle !== this.originalData.title ||
            currentContent !== this.originalData.content ||
            JSON.stringify(currentTags) !== JSON.stringify(originalTags)
        );
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (!this.isSubmitting) {
                this.form.dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            if (this.successModal.style.display === 'flex') {
                this.closeSuccessModal();
            }
        }
    }
}

// Initialize when DOM is loaded
let pageInitialized = false;

function initializePage() {
    if (pageInitialized) return;
    pageInitialized = true;
    
    console.log('Initializing IdeaEditPage...');
    new IdeaEditPage();
}

// Component load completion handler
document.addEventListener('componentLoaded', (event) => {
    if (event.detail.componentPath.includes('header.html')) {
        setTimeout(() => {
            initializePage();
        }, 100);
    }
});

// Fallback for when component loader is not available
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!window.componentLoader && !pageInitialized) {
            initializePage();
        }
    }, 1000);
});

// Add CSS animations and styles
const createStyle = document.createElement('style');
createStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .form-input.error {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
    }
    
    .tags-display {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        min-height: 2rem;
        align-items: center;
    }
    
    .tag-chip {
        display: inline-flex;
        align-items: center;
        background: #e67e22;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        gap: 0.25rem;
    }
    
    .tag-chip-text {
        font-weight: 500;
    }
    
    .tag-chip-remove {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1rem;
        line-height: 1;
        padding: 0;
        margin-left: 0.25rem;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    
    .tag-chip-remove:hover {
        opacity: 1;
    }
    
    .no-tags-text {
        color: #6c757d;
        font-style: italic;
        font-size: 0.875rem;
    }
    
    .tags-input-container {
        position: relative;
    }
    
    .tags-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
    }
    
    .tag-suggestion {
        padding: 0.5rem 1rem;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .tag-suggestion:hover {
        background: #f8f9fa;
    }
    
    .tag-suggestion:last-child {
        border-bottom: none;
    }
    
    .tag-suggestion-name {
        font-weight: 500;
    }
    
    .tag-suggestion-count {
        color: #6c757d;
        font-size: 0.875rem;
    }
`;
document.head.appendChild(createStyle);
