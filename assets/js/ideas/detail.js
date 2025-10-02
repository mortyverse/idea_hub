/**
 * 아이디어 상세 페이지 JavaScript
 * Idea Detail Page JavaScript
 */

class IdeaDetailPage {
    constructor() {
        this.ideaId = this.getIdeaIdFromUrl();
        this.idea = null;
        this.comments = [];
        this.relatedIdeas = [];
        
        // DOM elements
        this.loadingState = document.getElementById('loading-state');
        this.errorState = document.getElementById('error-state');
        this.ideaDetailContent = document.getElementById('idea-detail-content');
        
        // Idea elements
        this.ideaTitle = document.getElementById('idea-title');
        this.ideaWriter = document.getElementById('idea-writer');
        this.ideaDate = document.getElementById('idea-date');
        this.ideaViewCount = document.getElementById('idea-view-count');
        this.ideaTags = document.getElementById('idea-tags');
        this.ideaContent = document.getElementById('idea-content');
        
        // Stats elements
        this.statViewCount = document.getElementById('stat-view-count');
        this.statForkCount = document.getElementById('stat-fork-count');
        this.statCommentCount = document.getElementById('stat-comment-count');
        
        // Action buttons
        this.forkBtn = document.getElementById('fork-btn');
        this.shareBtn = document.getElementById('share-btn');
        this.bookmarkBtn = document.getElementById('bookmark-btn');
        
        // Comment elements
        this.commentForm = document.getElementById('comment-form');
        this.commentWriter = document.getElementById('comment-writer');
        this.commentContent = document.getElementById('comment-content');
        this.commentSubmitBtn = document.getElementById('comment-submit-btn');
        this.commentsList = document.getElementById('comments-list');
        this.emptyComments = document.getElementById('empty-comments');
        this.commentsCount = document.getElementById('comments-count');
        
        // Related ideas elements
        this.relatedIdeasSection = document.getElementById('related-ideas-section');
        this.relatedIdeasGrid = document.getElementById('related-ideas-grid');
        
        // Modal elements
        this.shareModal = document.getElementById('share-modal');
        this.shareUrl = document.getElementById('share-url');
        this.copyUrlBtn = document.getElementById('copy-url-btn');
        
        // Templates
        this.commentTemplate = document.getElementById('comment-template');
        this.relatedIdeaTemplate = document.getElementById('related-idea-template');
        
        this.init();
    }
    
    init() {
        if (!this.ideaId) {
            this.showErrorState('유효하지 않은 아이디어 ID입니다.');
            return;
        }
        
        this.setupEventListeners();
        this.loadIdeaDetail();
    }
    
    setupEventListeners() {
        // Action buttons
        this.forkBtn.addEventListener('click', () => this.handleFork());
        this.shareBtn.addEventListener('click', () => this.showShareModal());
        this.bookmarkBtn.addEventListener('click', () => this.handleBookmark());
        
        // Comment form
        this.commentForm.addEventListener('submit', (e) => this.handleCommentSubmit(e));
        this.commentContent.addEventListener('input', () => this.updateCommentCounter());
        
        // Share modal
        this.copyUrlBtn.addEventListener('click', () => this.copyShareUrl());
        document.querySelector('.modal-close').addEventListener('click', () => this.hideShareModal());
        document.querySelector('.modal-overlay').addEventListener('click', () => this.hideShareModal());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    getIdeaIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get('id')) || null;
    }
    
    async loadIdeaDetail() {
        this.showLoadingState();
        
        // Try different API paths for dothome hosting
        const apiPaths = [
            `../../api/ideas/detail-simple.php?id=${this.ideaId}`,
            `/api/ideas/detail-simple.php?id=${this.ideaId}`,
            `api/ideas/detail-simple.php?id=${this.ideaId}`,
            `../../api/ideas/detail.php?id=${this.ideaId}`,
            `/api/ideas/detail.php?id=${this.ideaId}`,
            `api/ideas/detail.php?id=${this.ideaId}`
        ];
        
        let response;
        let lastError;
        
        for (const apiPath of apiPaths) {
            try {
                console.log('Loading idea detail from:', apiPath);
                response = await fetch(apiPath);
                
                if (response.ok) {
                    console.log('API response received from:', apiPath);
                    break;
                } else {
                    console.error('HTTP error:', response.status);
                    continue;
                }
            } catch (error) {
                console.error('API path failed:', apiPath, error);
                lastError = error;
                continue;
            }
        }
        
        if (!response || !response.ok) {
            console.error('All API paths failed. Last error:', lastError);
            this.showErrorState('아이디어를 불러올 수 없습니다.');
            return;
        }
        
        try {
            const data = await response.json();
            
            if (data.success) {
                this.idea = data.data;
                this.comments = this.idea.comments || [];
                this.relatedIdeas = this.idea.related_ideas || [];
                
                this.renderIdeaDetail();
                this.renderComments();
                this.renderRelatedIdeas();
                
                this.hideLoadingState();
                this.ideaDetailContent.style.display = 'block';
                
                // Update page title
                document.title = `${this.idea.title} - 아이디어 허브`;
                
                // Update meta description
                const metaDescription = document.querySelector('meta[name="description"]');
                if (metaDescription) {
                    metaDescription.content = this.idea.content.substring(0, 160) + '...';
                }
            } else {
                this.showErrorState(data.error);
            }
        } catch (error) {
            console.error('Failed to parse response:', error);
            this.showErrorState('응답을 처리할 수 없습니다.');
        }
    }
    
    renderIdeaDetail() {
        // Title
        this.ideaTitle.textContent = this.idea.title;
        
        // Meta information
        this.ideaWriter.textContent = this.idea.writer;
        this.ideaDate.textContent = this.idea.relative_time;
        this.ideaViewCount.textContent = this.idea.view_count.toLocaleString();
        
        // Content
        this.ideaContent.textContent = this.idea.content;
        
        // Stats
        this.statViewCount.textContent = this.idea.view_count.toLocaleString();
        this.statForkCount.textContent = this.idea.fork_count.toLocaleString();
        this.statCommentCount.textContent = this.idea.comment_count.toLocaleString();
        
        // Tags
        this.ideaTags.innerHTML = '';
        this.idea.tags.forEach(tag => {
            const tagElement = document.createElement('a');
            tagElement.className = 'idea-tag';
            tagElement.href = `list.html?tag=${encodeURIComponent(tag)}`;
            tagElement.textContent = tag;
            this.ideaTags.appendChild(tagElement);
        });
        
        // Set share URL
        this.shareUrl.value = window.location.href;
    }
    
    renderComments() {
        this.commentsCount.textContent = `(${this.comments.length})`;
        
        if (this.comments.length === 0) {
            this.commentsList.style.display = 'none';
            this.emptyComments.style.display = 'block';
            return;
        }
        
        this.commentsList.style.display = 'block';
        this.emptyComments.style.display = 'none';
        
        this.commentsList.innerHTML = '';
        
        this.comments.forEach(comment => {
            const commentElement = this.createCommentElement(comment);
            this.commentsList.appendChild(commentElement);
        });
    }
    
    createCommentElement(comment) {
        const template = this.commentTemplate.content.cloneNode(true);
        const commentElement = template.querySelector('.comment');
        
        commentElement.setAttribute('data-comment-id', comment.id);
        
        // Comment meta
        const writerElement = commentElement.querySelector('.comment-writer');
        const dateElement = commentElement.querySelector('.comment-date');
        writerElement.textContent = comment.writer;
        dateElement.textContent = comment.relative_time;
        
        // Comment content
        const contentElement = commentElement.querySelector('.comment-content');
        contentElement.textContent = comment.content;
        
        return commentElement;
    }
    
    renderRelatedIdeas() {
        if (this.relatedIdeas.length === 0) {
            this.relatedIdeasSection.style.display = 'none';
            return;
        }
        
        this.relatedIdeasSection.style.display = 'block';
        this.relatedIdeasGrid.innerHTML = '';
        
        this.relatedIdeas.forEach(idea => {
            const ideaElement = this.createRelatedIdeaElement(idea);
            this.relatedIdeasGrid.appendChild(ideaElement);
        });
    }
    
    createRelatedIdeaElement(idea) {
        const template = this.relatedIdeaTemplate.content.cloneNode(true);
        const ideaElement = template.querySelector('.related-idea-card');
        
        // Title
        const titleLink = ideaElement.querySelector('.related-idea-link');
        titleLink.href = `detail.html?id=${idea.id}`;
        titleLink.textContent = idea.title;
        
        // Meta
        const writerElement = ideaElement.querySelector('.related-writer');
        const dateElement = ideaElement.querySelector('.related-date');
        writerElement.textContent = idea.writer;
        dateElement.textContent = idea.relative_time;
        
        // Stats
        const viewCount = ideaElement.querySelector('.related-stat:nth-child(1) .related-stat-count');
        const forkCount = ideaElement.querySelector('.related-stat:nth-child(2) .related-stat-count');
        const commentCount = ideaElement.querySelector('.related-stat:nth-child(3) .related-stat-count');
        
        viewCount.textContent = idea.view_count.toLocaleString();
        forkCount.textContent = idea.fork_count.toLocaleString();
        commentCount.textContent = idea.comment_count.toLocaleString();
        
        return ideaElement;
    }
    
    async handleCommentSubmit(e) {
        e.preventDefault();
        
        if (this.commentSubmitBtn.disabled) {
            return;
        }
        
        const writer = this.commentWriter.value.trim();
        const content = this.commentContent.value.trim();
        
        if (!writer || !content) {
            this.showNotification('작성자명과 댓글 내용을 모두 입력해주세요.', 'error');
            return;
        }
        
        this.commentSubmitBtn.disabled = true;
        this.commentSubmitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">등록 중...</span>';
        
        try {
            const formData = {
                idea_id: this.ideaId,
                writer: writer,
                content: content,
                csrf_token: this.generateCSRFToken()
            };
            
            const response = await fetch('../../api/comments/create.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('댓글이 성공적으로 등록되었습니다.', 'success');
                this.commentForm.reset();
                this.updateCommentCounter();
                // Reload comments without full page reload
                setTimeout(() => {
                    this.loadIdeaDetail();
                }, 1000);
            } else {
                this.showNotification(data.error || '댓글 등록에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Comment submission error:', error);
            this.showNotification('네트워크 오류가 발생했습니다.', 'error');
        } finally {
            this.commentSubmitBtn.disabled = false;
            this.commentSubmitBtn.innerHTML = '<span class="btn-icon">💬</span><span class="btn-text">댓글 등록</span>';
        }
    }
    
    updateCommentCounter() {
        const current = this.commentContent.value.length;
        const max = 1000;
        
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
    }
    
    handleFork() {
        // TODO: Implement fork functionality
        this.showNotification('포크 기능은 곧 구현될 예정입니다.', 'info');
    }
    
    showShareModal() {
        this.shareModal.style.display = 'flex';
    }
    
    hideShareModal() {
        this.shareModal.style.display = 'none';
    }
    
    async copyShareUrl() {
        try {
            await navigator.clipboard.writeText(this.shareUrl.value);
            this.showNotification('링크가 클립보드에 복사되었습니다.', 'success');
            this.hideShareModal();
        } catch (error) {
            console.error('Failed to copy URL:', error);
            this.showNotification('링크 복사에 실패했습니다.', 'error');
        }
    }
    
    handleBookmark() {
        // TODO: Implement bookmark functionality
        this.showNotification('북마크 기능은 곧 구현될 예정입니다.', 'info');
    }
    
    handleKeyboardShortcuts(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            if (this.shareModal.style.display === 'flex') {
                this.hideShareModal();
            }
        }
        
        // Ctrl/Cmd + Enter to submit comment
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (document.activeElement === this.commentContent) {
                e.preventDefault();
                this.commentForm.dispatchEvent(new Event('submit'));
            }
        }
    }
    
    generateCSRFToken() {
        // Generate a simple token for demo purposes
        // In production, this should come from the server
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    
    showLoadingState() {
        this.loadingState.style.display = 'block';
        this.errorState.style.display = 'none';
        this.ideaDetailContent.style.display = 'none';
    }
    
    showErrorState(errorMessage) {
        this.loadingState.style.display = 'none';
        this.ideaDetailContent.style.display = 'none';
        this.errorState.style.display = 'block';
        
        // Update error message if needed
        const errorDescription = this.errorState.querySelector('.error-description');
        if (errorMessage) {
            errorDescription.textContent = errorMessage;
        }
    }
    
    hideLoadingState() {
        this.loadingState.style.display = 'none';
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        // Set colors based on type
        switch (type) {
            case 'success':
                notification.style.background = '#d4edda';
                notification.style.color = '#155724';
                notification.style.border = '1px solid #c3e6cb';
                break;
            case 'error':
                notification.style.background = '#f8d7da';
                notification.style.color = '#721c24';
                notification.style.border = '1px solid #f5c6cb';
                break;
            case 'info':
            default:
                notification.style.background = '#d1ecf1';
                notification.style.color = '#0c5460';
                notification.style.border = '1px solid #bee5eb';
                break;
        }
        
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    hideAllStates() {
        // 로딩 상태 숨기기
        if (this.loadingState) {
            this.loadingState.style.display = 'none';
        }
        
        // 에러 상태 숨기기
        if (this.errorState) {
            this.errorState.style.display = 'none';
        }
        
        // 아이디어 상세 컨테이너 숨기기
        if (this.ideaDetailContainer) {
            this.ideaDetailContainer.style.display = 'none';
        }
    }
}

// Initialize when DOM is loaded
// 페이지 초기화 함수
let pageInitialized = false;

function initializePage() {
    if (pageInitialized) return;
    pageInitialized = true;
    
    console.log('Initializing IdeaDetailPage...');
    new IdeaDetailPage();
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

// Add CSS animation for notification
const detailStyle = document.createElement('style');
detailStyle.textContent = `
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
`;
document.head.appendChild(detailStyle);
