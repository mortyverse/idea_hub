/**
 * 아이디어 작성 페이지 JavaScript
 * Idea Creation Page JavaScript
 */

class IdeaCreatePage {
    constructor() {
        this.form = document.getElementById('idea-create-form');
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
        
        // Modal elements
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.successModal = document.getElementById('success-modal');
        this.viewIdeaBtn = document.getElementById('view-idea-btn');
        this.createAnotherBtn = document.getElementById('create-another-btn');
        
        // Tag system
        this.tagsDisplay = document.getElementById('tags-display');
        this.tagsSuggestions = document.getElementById('tags-suggestions');
        this.selectedTags = new Set();
        this.availableTags = [];
        
        // Form state
        this.isPreviewMode = false;
        this.isSubmitting = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadAvailableTags();
        this.setupFormValidation();
        this.setupCharacterCounter();
        this.generateCSRFToken();
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
        this.viewIdeaBtn.addEventListener('click', () => this.viewCreatedIdea());
        this.createAnotherBtn.addEventListener('click', () => this.createAnotherIdea());
        
        // Close modal events
        document.querySelector('.modal-close').addEventListener('click', () => this.closeSuccessModal());
        document.querySelector('.modal-overlay').addEventListener('click', () => this.closeSuccessModal());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Auto-save (optional)
        this.setupAutoSave();
    }
    
    setupFormValidation() {
        // Real-time validation
        this.titleInput.addEventListener('blur', () => this.validateTitle());
        this.contentInput.addEventListener('blur', () => this.validateContent());
        this.writerInput.addEventListener('blur', () => this.validateWriter());
        
        // Input validation
        this.titleInput.addEventListener('input', () => this.clearFieldError('title'));
        this.contentInput.addEventListener('input', () => this.clearFieldError('content'));
        this.writerInput.addEventListener('input', () => this.clearFieldError('writer'));
    }
    
    setupCharacterCounter() {
        this.contentInput.addEventListener('input', () => {
            const current = this.contentInput.value.length;
            const max = 5000;
            
            const counter = document.querySelector('.counter-current');
            const maxCounter = document.querySelector('.counter-max');
            
            if (counter && maxCounter) {
                counter.textContent = current.toLocaleString();
                
                // Change color when approaching limit
                if (current > max * 0.9) {
                    counter.style.color = '#e74c3c';
                } else if (current > max * 0.8) {
                    counter.style.color = '#f39c12';
                } else {
                    counter.style.color = '#3498db';
                }
            }
        });
    }
    
    generateCSRFToken() {
        const tokenInput = document.getElementById('csrf-token');
        if (tokenInput) {
            // Generate a simple token for demo purposes
            // In production, this should come from the server
            tokenInput.value = this.generateRandomToken();
        }
    }
    
    generateRandomToken() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    
    async loadAvailableTags() {
        try {
            const response = await fetch('../../api/ideas/tags.php?limit=50&sort=usage_count');
            const data = await response.json();
            
            if (data.success) {
                this.availableTags = data.data.tags.map(tag => ({
                    name: tag.name,
                    count: tag.usage_count
                }));
            } else {
                console.error('Failed to load tags:', data.error);
                this.availableTags = [];
            }
        } catch (error) {
            console.error('Failed to load tags:', error);
            this.availableTags = [];
        }
    }
    
    handleTagInput(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.addTag(this.tagsInput.value.trim());
        } else if (e.key === 'Backspace' && this.tagsInput.value === '' && this.selectedTags.size > 0) {
            // Remove last tag if input is empty and backspace is pressed
            const lastTag = Array.from(this.selectedTags).pop();
            this.removeTag(lastTag);
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
        
        // Add click event listeners
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
        if (!tagName || this.selectedTags.has(tagName) || this.selectedTags.size >= 10) {
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
        this.tagsDisplay.innerHTML = Array.from(this.selectedTags)
            .map(tag => `
                <span class="tag-chip">
                    ${tag}
                    <button type="button" class="tag-chip-remove" data-tag="${tag}">&times;</button>
                </span>
            `).join('');
        
        // Add remove event listeners
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
        this.previewDate.textContent = '방금 전';
        
        // Update tags
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
    
    validateWriter() {
        const value = this.writerInput.value.trim();
        if (value.length === 0) {
            this.showFieldError('writer', '작성자명을 입력해주세요.');
            return false;
        }
        if (value.length > 50) {
            this.showFieldError('writer', '작성자명은 50자 이하로 입력해주세요.');
            return false;
        }
        this.clearFieldError('writer');
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
        const isWriterValid = this.validateWriter();
        
        return isTitleValid && isContentValid && isWriterValid;
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
            const response = await this.submitIdea(formData);
            
            if (response.success) {
                this.showSuccessModal(response.data);
            } else {
                this.showError(response.error || '아이디어 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            this.isSubmitting = false;
            this.hideLoading();
        }
    }
    
    prepareFormData() {
        return {
            title: this.titleInput.value.trim(),
            content: this.contentInput.value.trim(),
            writer: this.writerInput.value.trim(),
            tags: Array.from(this.selectedTags),
            csrf_token: document.getElementById('csrf-token').value
        };
    }
    
    async submitIdea(formData) {
        const response = await fetch('../../api/ideas/create.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '서버 오류가 발생했습니다.');
        }
        
        return data;
    }
    
    showLoading() {
        this.loadingOverlay.style.display = 'flex';
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">등록 중...</span>';
    }
    
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = '<span class="btn-icon">💡</span><span class="btn-text">아이디어 등록</span>';
    }
    
    showSuccessModal(data) {
        this.successModal.style.display = 'flex';
        this.createdIdeaId = data.idea_id;
    }
    
    closeSuccessModal() {
        this.successModal.style.display = 'none';
    }
    
    viewCreatedIdea() {
        // Redirect to the created idea page
        window.location.href = `detail.html?id=${this.createdIdeaId}`;
    }
    
    createAnotherIdea() {
        // Reset form and close modal
        this.resetForm();
        this.closeSuccessModal();
    }
    
    resetForm() {
        this.form.reset();
        this.selectedTags.clear();
        this.updateTagsDisplay();
        this.isPreviewMode = false;
        this.previewCard.style.display = 'none';
        this.previewToggle.innerHTML = '<span class="btn-icon">👁️</span><span class="btn-text">미리보기</span>';
        this.clearAllErrors();
        this.generateCSRFToken();
    }
    
    clearAllErrors() {
        ['title', 'content', 'writer'].forEach(field => {
            this.clearFieldError(field);
        });
    }
    
    scrollToFirstError() {
        const firstError = document.querySelector('.form-error-text[style*="block"]');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    showError(message) {
        // Create a simple error notification
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
    
    handleCancel() {
        if (this.hasUnsavedChanges()) {
            if (confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
                this.resetForm();
                window.location.href = 'list.html';
            }
        } else {
            window.location.href = 'list.html';
        }
    }
    
    hasUnsavedChanges() {
        return this.titleInput.value.trim() !== '' ||
               this.contentInput.value.trim() !== '' ||
               this.writerInput.value.trim() !== '' ||
               this.selectedTags.size > 0;
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
    
    setupAutoSave() {
        // Auto-save form data to localStorage every 30 seconds
        setInterval(() => {
            if (this.hasUnsavedChanges() && !this.isSubmitting) {
                this.saveToLocalStorage();
            }
        }, 30000);
        
        // Restore from localStorage on page load
        this.restoreFromLocalStorage();
    }
    
    saveToLocalStorage() {
        const formData = {
            title: this.titleInput.value,
            content: this.contentInput.value,
            writer: this.writerInput.value,
            tags: Array.from(this.selectedTags),
            timestamp: Date.now()
        };
        
        localStorage.setItem('idea_draft', JSON.stringify(formData));
    }
    
    restoreFromLocalStorage() {
        const saved = localStorage.getItem('idea_draft');
        if (saved) {
            try {
                const formData = JSON.parse(saved);
                
                // Only restore if it's recent (within 24 hours)
                if (Date.now() - formData.timestamp < 24 * 60 * 60 * 1000) {
                    if (confirm('이전에 작성하던 내용이 있습니다. 복원하시겠습니까?')) {
                        this.titleInput.value = formData.title;
                        this.contentInput.value = formData.content;
                        this.writerInput.value = formData.writer;
                        
                        formData.tags.forEach(tag => this.selectedTags.add(tag));
                        this.updateTagsDisplay();
                        
                        // Clear saved data
                        localStorage.removeItem('idea_draft');
                    }
                }
            } catch (error) {
                console.error('Failed to restore form data:', error);
                localStorage.removeItem('idea_draft');
            }
        }
    }
    
    hideAllStates() {
        // 로딩 오버레이 숨기기
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
        
        // 성공 모달 숨기기
        if (this.successModal) {
            this.successModal.style.display = 'none';
        }
    }
}

// Initialize when DOM is loaded
// 페이지 초기화 함수
let pageInitialized = false;

function initializePage() {
    if (pageInitialized) return;
    pageInitialized = true;
    
    console.log('Initializing IdeaCreatePage...');
    new IdeaCreatePage();
}

// 컴포넌트 로드 완료 후 페이지 초기화
document.addEventListener('componentLoaded', (event) => {
    if (event.detail.componentPath.includes('header.html')) {
        // 헤더 로드 완료 후 페이지 초기화
        setTimeout(() => {
            initializePage();
        }, 100);
    }
});

// 컴포넌트 로더가 없는 경우를 위한 fallback
document.addEventListener('DOMContentLoaded', () => {
    // 컴포넌트 로더가 로드되지 않은 경우 1초 후 초기화
    setTimeout(() => {
        if (!window.componentLoader && !pageInitialized) {
            initializePage();
        }
    }, 1000);
});

// Add CSS animation for error notification
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
`;
document.head.appendChild(createStyle);
