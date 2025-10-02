/**
 * 아이디어 목록 페이지 JavaScript
 * Ideas List Page JavaScript
 */

class IdeasListPage {
    constructor() {
        this.currentPage = 1;
        this.currentLimit = 10;
        this.currentSort = 'created_at';
        this.currentOrder = 'DESC';
        this.currentSearch = '';
        this.currentTag = '';
        this.currentWriter = '';
        
        // DOM elements
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.sortSelect = document.getElementById('sort-select');
        this.tagFilter = document.getElementById('tag-filter');
        this.writerFilter = document.getElementById('writer-filter');
        this.clearFiltersBtn = document.getElementById('clear-filters');
        this.createIdeaBtn = document.getElementById('create-idea-btn');
        this.emptyCreateBtn = document.getElementById('empty-create-btn');
        this.retryBtn = document.getElementById('retry-btn');
        
        // Debug: Check if create button exists
        console.log('Create idea button found:', !!this.createIdeaBtn);
        console.log('Empty create button found:', !!this.emptyCreateBtn);
        
        // State elements
        this.loadingState = document.getElementById('loading-state');
        this.ideasGrid = document.getElementById('ideas-grid');
        this.emptyState = document.getElementById('empty-state');
        this.errorState = document.getElementById('error-state');
        this.ideasCountText = document.getElementById('ideas-count-text');
        
        // Pagination elements
        this.paginationContainer = document.getElementById('pagination-container');
        this.prevPageBtn = document.getElementById('prev-page');
        this.nextPageBtn = document.getElementById('next-page');
        this.paginationPages = document.getElementById('pagination-pages');
        this.paginationInfoText = document.getElementById('pagination-info-text');
        
        // Template
        this.ideaCardTemplate = document.getElementById('idea-card-template');
        
        // Delete modal elements
        this.deleteModal = document.getElementById('delete-modal');
        this.deleteForm = document.getElementById('delete-form');
        this.deleteIdeaTitle = document.getElementById('delete-idea-title');
        this.deleteWriterConfirm = document.getElementById('delete-writer-confirm');
        this.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        
        // Current idea being deleted
        this.currentDeleteIdea = null;
        
        // Data
        this.ideas = [];
        this.totalCount = 0;
        this.totalPages = 0;
        this.availableTags = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadAvailableTags();
        this.loadIdeas();
        this.setupInfiniteScroll();
    }
    
    setupEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('input', () => this.handleSearchInput());
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        this.searchBtn.addEventListener('click', () => this.performSearch());
        
        // Filter changes
        this.sortSelect.addEventListener('change', () => this.handleFilterChange());
        this.tagFilter.addEventListener('change', () => this.handleFilterChange());
        this.writerFilter.addEventListener('input', () => this.debounce(() => this.handleFilterChange(), 500));
        
        // Clear filters
        this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        
        // Create idea buttons
        if (this.createIdeaBtn) {
            this.createIdeaBtn.addEventListener('click', () => {
                console.log('Create idea button clicked');
                this.navigateToCreate();
            });
        }
        if (this.emptyCreateBtn) {
            this.emptyCreateBtn.addEventListener('click', () => {
                console.log('Empty create button clicked');
                this.navigateToCreate();
            });
        }
        
        // Retry button
        this.retryBtn.addEventListener('click', () => this.loadIdeas());
        
        // Pagination
        this.prevPageBtn.addEventListener('click', () => this.goToPreviousPage());
        this.nextPageBtn.addEventListener('click', () => this.goToNextPage());
        
        // Delete modal
        if (this.deleteForm) {
            this.deleteForm.addEventListener('submit', (e) => this.handleDeleteSubmit(e));
        }
        
        // Modal close events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleModalClose(e));
        });
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => this.handleModalClose(e));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    async loadAvailableTags() {
        // Try different API paths for dothome hosting
        const apiPaths = [
            '../../api/ideas/tags-simple.php?limit=100&sort=usage_count',
            '/api/ideas/tags-simple.php?limit=100&sort=usage_count',
            'api/ideas/tags-simple.php?limit=100&sort=usage_count',
            '../../api/ideas/tags.php?limit=100&sort=usage_count',
            '/api/ideas/tags.php?limit=100&sort=usage_count',
            'api/ideas/tags.php?limit=100&sort=usage_count'
        ];
        
        for (const apiPath of apiPaths) {
            try {
                console.log('Loading tags from:', apiPath);
                const response = await fetch(apiPath);
                
                if (!response.ok) {
                    console.error('HTTP error:', response.status);
                    continue;
                }
                
                const data = await response.json();
                
                if (data.success) {
                    this.availableTags = data.data.tags;
                    this.populateTagFilter();
                    console.log('Tags loaded successfully:', this.availableTags.length);
                    return; // Success, exit the function
                } else {
                    console.error('Failed to load tags:', data.error);
                }
            } catch (error) {
                console.error('Failed to load tags from', apiPath, ':', error);
            }
        }
        
        // If all paths failed, set some default tags
        this.availableTags = [
            { name: '기술', usage_count: 10 },
            { name: '창의', usage_count: 8 },
            { name: '교육', usage_count: 6 },
            { name: '비즈니스', usage_count: 5 },
            { name: '디자인', usage_count: 4 },
            { name: '환경', usage_count: 3 },
            { name: 'AI', usage_count: 7 },
            { name: '협업', usage_count: 2 }
        ];
        this.populateTagFilter();
        console.log('Using default tags:', this.availableTags.length);
    }
    
    populateTagFilter() {
        this.tagFilter.innerHTML = '<option value="">전체 태그</option>';
        
        this.availableTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.name;
            option.textContent = `${tag.name} (${tag.usage_count})`;
            this.tagFilter.appendChild(option);
        });
    }
    
    async loadIdeas() {
        this.showLoadingState();
        
        const params = new URLSearchParams({
            page: this.currentPage,
            limit: this.currentLimit,
            sort: this.currentSort,
            order: this.currentOrder,
            search: this.currentSearch,
            tag: this.currentTag,
            writer: this.currentWriter
        });
        
        // Try different API paths for dothome hosting
        const apiPaths = [
            `../../api/ideas/list-simple.php?${params}`,
            `/api/ideas/list-simple.php?${params}`,
            `api/ideas/list-simple.php?${params}`,
            `../../api/ideas/list.php?${params}`,
            `/api/ideas/list.php?${params}`,
            `api/ideas/list.php?${params}`
        ];
        
        let response;
        let lastError;
        
        for (const apiPath of apiPaths) {
            try {
                console.log('Loading ideas from:', apiPath);
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
            this.showErrorState('아이디어 목록을 불러올 수 없습니다.');
            return;
        }
        
        try {
            const data = await response.json();
            
            if (data.success) {
                this.ideas = data.data.ideas;
                this.totalCount = data.data.pagination.total_count;
                this.totalPages = data.data.pagination.total_pages;
                
                this.updateIdeasCount();
                this.renderIdeas();
                this.renderPagination();
                
                if (this.ideas.length === 0) {
                    this.showEmptyState();
                } else {
                    this.hideAllStates();
                    this.ideasGrid.style.display = 'grid';
                    // Show ideas header when ideas are loaded
                    const ideasHeader = document.getElementById('ideas-header');
                    if (ideasHeader) {
                        ideasHeader.style.display = 'flex';
                    }
                }
            } else {
                this.showErrorState(data.error);
            }
        } catch (error) {
            console.error('Failed to parse response:', error);
            this.showErrorState('응답을 처리할 수 없습니다.');
        }
    }
    
    renderIdeas() {
        this.ideasGrid.innerHTML = '';
        
        this.ideas.forEach((idea, index) => {
            const card = this.createIdeaCard(idea);
            card.style.animationDelay = `${index * 0.1}s`;
            this.ideasGrid.appendChild(card);
        });
    }
    
    createIdeaCard(idea) {
        const template = this.ideaCardTemplate.content.cloneNode(true);
        const card = template.querySelector('.idea-card');
        
        // Set data attributes
        card.setAttribute('data-idea-id', idea.id);
        
        // Title
        const titleLink = card.querySelector('.idea-title-link');
        titleLink.href = `detail.html?id=${idea.id}`;
        titleLink.textContent = idea.title;
        
        // Meta information
        const writerText = card.querySelector('.idea-writer .meta-text');
        const dateText = card.querySelector('.idea-date .meta-text');
        writerText.textContent = idea.writer;
        dateText.textContent = idea.relative_time;
        
        // Content
        const content = card.querySelector('.idea-content');
        content.textContent = idea.content;
        
        // Stats
        const viewCount = card.querySelector('.idea-stats .stat-item:nth-child(1) .stat-count');
        const forkCount = card.querySelector('.idea-stats .stat-item:nth-child(2) .stat-count');
        const commentCount = card.querySelector('.idea-stats .stat-item:nth-child(3) .stat-count');
        
        viewCount.textContent = idea.view_count.toLocaleString();
        forkCount.textContent = idea.fork_count.toLocaleString();
        commentCount.textContent = idea.comment_count.toLocaleString();
        
        // Tags
        const tagsContainer = card.querySelector('.idea-tags');
        tagsContainer.innerHTML = '';
        
        idea.tags.forEach(tag => {
            const tagElement = document.createElement('a');
            tagElement.className = 'idea-tag';
            tagElement.href = `list.html?tag=${encodeURIComponent(tag)}`;
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
        
        // Author actions (show for all cards, let server validate)
        const cardActions = card.querySelector('.idea-card-actions');
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        
        console.log('Card actions elements:', {
            cardActions: !!cardActions,
            editBtn: !!editBtn,
            deleteBtn: !!deleteBtn,
            ideaId: idea.id
        });
        
        if (cardActions && editBtn && deleteBtn) {
            cardActions.style.display = 'flex';
            console.log('Author actions shown for idea:', idea.id, 'writer:', idea.writer);
            
            editBtn.addEventListener('click', (e) => {
                console.log('Edit button clicked for idea:', idea.id);
                e.preventDefault();
                e.stopPropagation();
                this.handleEdit(idea.id);
            });
            
            deleteBtn.addEventListener('click', (e) => {
                console.log('Delete button clicked for idea:', idea.id);
                e.preventDefault();
                e.stopPropagation();
                this.showDeleteModal(idea);
            });
        } else {
            console.log('Some action elements missing for idea:', idea.id);
        }
        
        return card;
    }
    
    renderPagination() {
        if (this.totalPages <= 1) {
            this.paginationContainer.style.display = 'none';
            return;
        }
        
        this.paginationContainer.style.display = 'flex';
        
        // Update pagination buttons
        this.prevPageBtn.disabled = this.currentPage <= 1;
        this.nextPageBtn.disabled = this.currentPage >= this.totalPages;
        
        // Generate page numbers
        this.paginationPages.innerHTML = '';
        
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);
        
        // First page
        if (startPage > 1) {
            this.addPageNumber(1);
            if (startPage > 2) {
                this.addPageEllipsis();
            }
        }
        
        // Page range
        for (let i = startPage; i <= endPage; i++) {
            this.addPageNumber(i);
        }
        
        // Last page
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                this.addPageEllipsis();
            }
            this.addPageNumber(this.totalPages);
        }
        
        // Update pagination info
        const startItem = (this.currentPage - 1) * this.currentLimit + 1;
        const endItem = Math.min(this.currentPage * this.currentLimit, this.totalCount);
        this.paginationInfoText.textContent = 
            `${startItem}-${endItem} / 총 ${this.totalCount.toLocaleString()}개 아이디어`;
    }
    
    addPageNumber(pageNumber) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-page';
        if (pageNumber === this.currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = pageNumber;
        pageBtn.addEventListener('click', () => this.goToPage(pageNumber));
        this.paginationPages.appendChild(pageBtn);
    }
    
    addPageEllipsis() {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'pagination-ellipsis';
        ellipsis.textContent = '...';
        ellipsis.style.padding = '0 0.5rem';
        ellipsis.style.color = '#6c757d';
        this.paginationPages.appendChild(ellipsis);
    }
    
    updateIdeasCount() {
        if (this.totalCount === 0) {
            this.ideasCountText.textContent = '로딩 중...';
        } else {
            this.ideasCountText.textContent = `총 ${this.totalCount.toLocaleString()}개의 아이디어`;
        }
    }
    
    handleSearchInput() {
        // Real-time search could be implemented here
        // For now, we'll just update the search term
    }
    
    performSearch() {
        this.currentSearch = this.searchInput.value.trim();
        this.currentPage = 1;
        this.loadIdeas();
    }
    
    handleFilterChange() {
        this.currentSort = this.sortSelect.value;
        this.currentTag = this.tagFilter.value;
        this.currentWriter = this.writerFilter.value.trim();
        this.currentPage = 1;
        this.loadIdeas();
    }
    
    clearFilters() {
        this.searchInput.value = '';
        this.sortSelect.value = 'created_at';
        this.tagFilter.value = '';
        this.writerFilter.value = '';
        
        this.currentSearch = '';
        this.currentSort = 'created_at';
        this.currentTag = '';
        this.currentWriter = '';
        this.currentPage = 1;
        
        this.loadIdeas();
    }
    
    goToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= this.totalPages) {
            this.currentPage = pageNumber;
            this.loadIdeas();
            this.scrollToTop();
        }
    }
    
    goToPreviousPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }
    
    goToNextPage() {
        if (this.currentPage < this.totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }
    
    navigateToCreate() {
        console.log('Navigating to create page...');
        window.location.href = 'create.html';
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.searchInput.focus();
        }
        
        // Arrow keys for pagination
        if (e.key === 'ArrowLeft' && this.currentPage > 1) {
            e.preventDefault();
            this.goToPreviousPage();
        } else if (e.key === 'ArrowRight' && this.currentPage < this.totalPages) {
            e.preventDefault();
            this.goToNextPage();
        }
    }
    
    setupInfiniteScroll() {
        // Optional: Implement infinite scroll for better UX
        // This would replace pagination with infinite loading
    }
    
    showLoadingState() {
        this.hideAllStates();
        this.loadingState.style.display = 'block';
    }
    
    showEmptyState() {
        this.hideAllStates();
        this.emptyState.style.display = 'block';
    }
    
    showErrorState(errorMessage) {
        this.hideAllStates();
        this.errorState.style.display = 'block';
        
        // Update error message if needed
        const errorDescription = this.errorState.querySelector('.error-description');
        if (errorMessage) {
            errorDescription.textContent = errorMessage;
        }
    }
    
    hideAllStates() {
        this.loadingState.style.display = 'none';
        this.ideasGrid.style.display = 'none';
        this.emptyState.style.display = 'none';
        this.errorState.style.display = 'none';
        // Hide ideas header
        const ideasHeader = document.getElementById('ideas-header');
        if (ideasHeader) {
            ideasHeader.style.display = 'none';
        }
    }
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // =============================================
    // Author Actions (Edit/Delete)
    // =============================================
    
    handleEdit(ideaId) {
        console.log('handleEdit called, redirecting to edit page for idea:', ideaId);
        // Redirect to edit page
        window.location.href = `edit.html?id=${ideaId}`;
    }
    
    showDeleteModal(idea) {
        console.log('showDeleteModal called for idea:', idea?.title);
        if (this.deleteModal && idea) {
            this.currentDeleteIdea = idea;
            this.deleteIdeaTitle.textContent = idea.title;
            this.deleteWriterConfirm.value = '';
            this.deleteModal.style.display = 'flex';
            this.deleteWriterConfirm.focus();
            console.log('Delete modal shown');
        } else {
            console.log('Delete modal or idea not found:', {
                deleteModal: !!this.deleteModal,
                idea: !!idea
            });
        }
    }
    
    hideDeleteModal() {
        if (this.deleteModal) {
            this.deleteModal.style.display = 'none';
            this.deleteWriterConfirm.value = '';
            this.currentDeleteIdea = null;
        }
    }
    
    async handleDeleteSubmit(e) {
        e.preventDefault();
        
        if (!this.currentDeleteIdea) {
            this.showNotification('삭제할 아이디어를 찾을 수 없습니다.', 'error');
            return;
        }
        
        const writerConfirm = this.deleteWriterConfirm.value.trim();
        
        if (!writerConfirm) {
            this.showNotification('작성자명을 입력해주세요.', 'error');
            return;
        }
        
        if (writerConfirm !== this.currentDeleteIdea.writer) {
            this.showNotification('작성자명이 일치하지 않습니다.', 'error');
            return;
        }
        
        // Disable submit button
        this.confirmDeleteBtn.disabled = true;
        this.confirmDeleteBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">삭제 중...</span>';
        
        try {
            await this.deleteIdea(this.currentDeleteIdea.id, writerConfirm);
        } catch (error) {
            console.error('Delete failed:', error);
            this.showNotification('삭제 중 오류가 발생했습니다.', 'error');
        } finally {
            // Re-enable submit button
            this.confirmDeleteBtn.disabled = false;
            this.confirmDeleteBtn.innerHTML = '<span class="btn-icon">🗑️</span><span class="btn-text">삭제하기</span>';
        }
    }
    
    async deleteIdea(ideaId, writerConfirm) {
        const apiPaths = [
            '../../api/ideas/delete.php',
            '../api/ideas/delete.php',
            '/api/ideas/delete.php',
            'api/ideas/delete.php'
        ];
        
        const requestData = {
            idea_id: ideaId,
            original_writer: writerConfirm
        };
        
        let response = null;
        let lastError = null;
        
        for (const apiPath of apiPaths) {
            try {
                response = await fetch(apiPath, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });
                
                if (response.ok) {
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
            throw new Error('삭제 API 호출에 실패했습니다.');
        }
        
        const data = await response.json();
        
        if (data.success) {
            this.showNotification('아이디어가 성공적으로 삭제되었습니다.', 'success');
            this.hideDeleteModal();
            
            // Reload the ideas list
            this.loadIdeas();
        } else {
            throw new Error(data.error || '삭제에 실패했습니다.');
        }
    }
    
    handleModalClose(e) {
        const modal = e.target.closest('.modal');
        if (modal && modal.id === 'delete-modal') {
            this.hideDeleteModal();
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#10b981';
                break;
            case 'error':
                notification.style.background = '#ef4444';
                break;
            case 'warning':
                notification.style.background = '#f59e0b';
                break;
            default:
                notification.style.background = '#3b82f6';
                break;
        }
        
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize when DOM is loaded
// 페이지 초기화 함수
let pageInitialized = false;

function initializePage() {
    if (pageInitialized) return;
    pageInitialized = true;
    
    console.log('Initializing IdeasListPage...');
    try {
        const listPage = new IdeasListPage();
        console.log('IdeasListPage instance created successfully:', listPage);
        window.ideasListPage = listPage; // For debugging
    } catch (error) {
        console.error('Failed to initialize IdeasListPage:', error);
    }
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

// Add CSS for pagination ellipsis
const listStyle = document.createElement('style');
listStyle.textContent = `
    .pagination-ellipsis {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        color: #6c757d;
        font-weight: 500;
    }
`;
document.head.appendChild(listStyle);
