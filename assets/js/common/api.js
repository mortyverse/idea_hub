/**
 * API Communication Module - API 통신 모듈
 */

class APIClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.timeout = 10000; // 10초
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        
        // CSRF 토큰 가져오기
        this.csrfToken = this.getCSRFToken();
        if (this.csrfToken) {
            this.defaultHeaders['X-CSRF-Token'] = this.csrfToken;
        }
    }
    
    /**
     * CSRF 토큰 가져오기
     */
    getCSRFToken() {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : null;
    }
    
    /**
     * 기본 fetch 요청 래퍼
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: { ...this.defaultHeaders, ...options.headers },
            timeout: this.timeout,
            ...options
        };
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('요청 시간이 초과되었습니다.');
            }
            throw error;
        }
    }
    
    /**
     * GET 요청
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, { method: 'GET' });
    }
    
    /**
     * POST 요청
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    /**
     * PUT 요청
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    /**
     * DELETE 요청
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    /**
     * 파일 업로드
     */
    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        // 추가 데이터 추가
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });
        
        return this.request(endpoint, {
            method: 'POST',
            headers: {
                'X-CSRF-Token': this.csrfToken
            },
            body: formData
        });
    }
}

// API 클라이언트 인스턴스 생성
const api = new APIClient();

/**
 * 아이디어 관련 API
 */
const IdeasAPI = {
    /**
     * 아이디어 목록 가져오기
     */
    async getList(params = {}) {
        return api.get('/api/ideas/list.php', params);
    },
    
    /**
     * 아이디어 상세 정보 가져오기
     */
    async getDetail(id) {
        return api.get(`/api/ideas/detail.php?id=${id}`);
    },
    
    /**
     * 아이디어 생성
     */
    async create(data) {
        return api.post('/api/ideas/create.php', data);
    },
    
    /**
     * 아이디어 수정
     */
    async update(id, data) {
        return api.put(`/api/ideas/edit.php?id=${id}`, data);
    },
    
    /**
     * 아이디어 삭제
     */
    async delete(id) {
        return api.delete(`/api/ideas/delete.php?id=${id}`);
    },
    
    /**
     * 아이디어 포크
     */
    async fork(id, data = {}) {
        return api.post(`/api/ideas/fork.php?id=${id}`, data);
    },
    
    /**
     * 아이디어 좋아요/싫어요
     */
    async like(id, action = 'like') {
        return api.post(`/api/ideas/like.php?id=${id}`, { action });
    }
};

/**
 * 마인드맵 관련 API
 */
const MindmapAPI = {
    /**
     * 마인드맵 목록 가져오기
     */
    async getList(params = {}) {
        return api.get('/api/mindmap/list.php', params);
    },
    
    /**
     * 마인드맵 상세 정보 가져오기
     */
    async getDetail(id) {
        return api.get(`/api/mindmap/viewer.php?id=${id}`);
    },
    
    /**
     * 마인드맵 생성
     */
    async create(data) {
        return api.post('/api/mindmap/editor.php', data);
    },
    
    /**
     * 마인드맵 수정
     */
    async update(id, data) {
        return api.put(`/api/mindmap/editor.php?id=${id}`, data);
    },
    
    /**
     * 마인드맵 삭제
     */
    async delete(id) {
        return api.delete(`/api/mindmap/editor.php?id=${id}`);
    },
    
    /**
     * 노드 추가
     */
    async addNode(mindmapId, data) {
        return api.post(`/api/mindmap/nodes.php?mindmap_id=${mindmapId}`, data);
    },
    
    /**
     * 노드 수정
     */
    async updateNode(nodeId, data) {
        return api.put(`/api/mindmap/nodes.php?id=${nodeId}`, data);
    },
    
    /**
     * 노드 삭제
     */
    async deleteNode(nodeId) {
        return api.delete(`/api/mindmap/nodes.php?id=${nodeId}`);
    }
};

/**
 * 태그 관련 API
 */
const TagsAPI = {
    /**
     * 태그 목록 가져오기
     */
    async getList(params = {}) {
        return api.get('/api/tags/list.php', params);
    },
    
    /**
     * 태그 상세 정보 가져오기
     */
    async getDetail(tagName) {
        return api.get(`/api/tags/detail.php?tag=${encodeURIComponent(tagName)}`);
    },
    
    /**
     * 태그 자동완성
     */
    async autocomplete(query) {
        return api.get('/api/tags/autocomplete.php', { q: query });
    },
    
    /**
     * 태그 관리
     */
    async manage(action, data) {
        return api.post('/api/tags/manage.php', { action, ...data });
    }
};

/**
 * 검색 관련 API
 */
const SearchAPI = {
    /**
     * 통합 검색
     */
    async search(query, params = {}) {
        return api.get('/api/search/results.php', { q: query, ...params });
    },
    
    /**
     * 고급 검색
     */
    async advancedSearch(criteria) {
        return api.post('/api/search/results.php', criteria);
    },
    
    /**
     * 검색 제안
     */
    async getSuggestions(query) {
        return api.get('/api/search/suggestions.php', { q: query });
    }
};

/**
 * 댓글 관련 API
 */
const CommentsAPI = {
    /**
     * 댓글 목록 가져오기
     */
    async getList(ideaId, params = {}) {
        return api.get(`/api/comments/list.php?idea_id=${ideaId}`, params);
    },
    
    /**
     * 댓글 생성
     */
    async create(data) {
        return api.post('/api/comments/create.php', data);
    },
    
    /**
     * 댓글 수정
     */
    async update(id, data) {
        return api.put(`/api/comments/edit.php?id=${id}`, data);
    },
    
    /**
     * 댓글 삭제
     */
    async delete(id) {
        return api.delete(`/api/comments/delete.php?id=${id}`);
    }
};

/**
 * 사용자 관련 API
 */
const UserAPI = {
    /**
     * 사용자 프로필 가져오기
     */
    async getProfile(userId) {
        return api.get(`/api/profile/user.php?id=${userId}`);
    },
    
    /**
     * 사용자 설정 업데이트
     */
    async updateSettings(data) {
        return api.put('/api/profile/settings.php', data);
    },
    
    /**
     * 사용자 활동 내역
     */
    async getActivity(userId, params = {}) {
        return api.get(`/api/profile/activity.php?user_id=${userId}`, params);
    }
};

/**
 * 인증 관련 API
 */
const AuthAPI = {
    /**
     * 로그인
     */
    async login(credentials) {
        return api.post('/api/auth/login.php', credentials);
    },
    
    /**
     * 로그아웃
     */
    async logout() {
        return api.post('/api/auth/logout.php');
    },
    
    /**
     * 회원가입
     */
    async register(userData) {
        return api.post('/api/auth/register.php', userData);
    },
    
    /**
     * 비밀번호 재설정 요청
     */
    async requestPasswordReset(email) {
        return api.post('/api/auth/password-reset.php', { email });
    },
    
    /**
     * 비밀번호 재설정
     */
    async resetPassword(token, newPassword) {
        return api.post('/api/auth/password-reset-confirm.php', { token, password: newPassword });
    }
};

/**
 * 통계 관련 API
 */
const StatsAPI = {
    /**
     * 전체 통계 가져오기
     */
    async getOverallStats() {
        return api.get('/api/stats/overall.php');
    },
    
    /**
     * 사용자 통계 가져오기
     */
    async getUserStats(userId) {
        return api.get(`/api/stats/user.php?user_id=${userId}`);
    },
    
    /**
     * 카테고리별 통계
     */
    async getCategoryStats() {
        return api.get('/api/stats/categories.php');
    }
};

/**
 * 에러 처리 유틸리티
 */
const APIErrorHandler = {
    /**
     * API 에러 처리
     */
    handle(error) {
        console.error('API Error:', error);
        
        let message = '알 수 없는 오류가 발생했습니다.';
        
        if (error.message.includes('timeout')) {
            message = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
        } else if (error.message.includes('NetworkError')) {
            message = '네트워크 연결을 확인해주세요.';
        } else if (error.message.includes('401')) {
            message = '로그인이 필요합니다.';
        } else if (error.message.includes('403')) {
            message = '접근 권한이 없습니다.';
        } else if (error.message.includes('404')) {
            message = '요청한 리소스를 찾을 수 없습니다.';
        } else if (error.message.includes('500')) {
            message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
        
        this.showNotification(message, 'error');
        return message;
    },
    
    /**
     * 알림 표시
     */
    showNotification(message, type = 'info') {
        // 실제 구현 시 토스트 알림 또는 모달 표시
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // 간단한 알림 표시 (실제 구현 시 더 나은 UI로 교체)
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : '#3498db'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
};

// 전역으로 API 객체들 내보내기
window.API = {
    client: api,
    ideas: IdeasAPI,
    mindmap: MindmapAPI,
    tags: TagsAPI,
    search: SearchAPI,
    comments: CommentsAPI,
    user: UserAPI,
    auth: AuthAPI,
    stats: StatsAPI,
    errorHandler: APIErrorHandler
};

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
