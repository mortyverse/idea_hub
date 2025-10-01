/**
 * Component Loader System
 * HTML 컴포넌트를 동적으로 로드하고 삽입하는 시스템
 */

class ComponentLoader {
    constructor() {
        this.loadedComponents = new Set();
        this.loadingPromises = new Map();
    }

    /**
     * 컴포넌트를 로드하고 지정된 요소에 삽입
     * @param {string} componentPath - 컴포넌트 파일 경로
     * @param {string} targetSelector - 삽입할 대상 요소 선택자
     * @param {string} position - 삽입 위치 ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
     * @returns {Promise<void>}
     */
    async loadComponent(componentPath, targetSelector, position = 'beforeend') {
        try {
            // 이미 로딩 중인 컴포넌트가 있다면 해당 Promise 반환
            if (this.loadingPromises.has(componentPath)) {
                await this.loadingPromises.get(componentPath);
                return;
            }

            // 이미 로드된 컴포넌트라면 캐시된 내용 사용
            if (this.loadedComponents.has(componentPath)) {
                await this.insertComponent(componentPath, targetSelector, position);
                return;
            }

            // 컴포넌트 로딩 Promise 생성
            const loadingPromise = this.fetchAndCacheComponent(componentPath);
            this.loadingPromises.set(componentPath, loadingPromise);

            await loadingPromise;
            await this.insertComponent(componentPath, targetSelector, position);

            // 로딩 완료 후 Promise 정리
            this.loadingPromises.delete(componentPath);

        } catch (error) {
            console.error(`컴포넌트 로딩 실패: ${componentPath}`, error);
            this.loadingPromises.delete(componentPath);
        }
    }

    /**
     * 컴포넌트를 가져와서 캐시에 저장
     * @param {string} componentPath - 컴포넌트 파일 경로
     * @returns {Promise<string>} 컴포넌트 HTML 내용
     */
    async fetchAndCacheComponent(componentPath) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            this.loadedComponents.add(componentPath);
            return html;
        } catch (error) {
            console.error(`컴포넌트 가져오기 실패: ${componentPath}`, error);
            throw error;
        }
    }

    /**
     * 캐시된 컴포넌트를 지정된 위치에 삽입
     * @param {string} componentPath - 컴포넌트 파일 경로
     * @param {string} targetSelector - 삽입할 대상 요소 선택자
     * @param {string} position - 삽입 위치
     */
    async insertComponent(componentPath, targetSelector, position) {
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) {
            throw new Error(`대상 요소를 찾을 수 없습니다: ${targetSelector}`);
        }

        // 컴포넌트 내용을 다시 가져와서 삽입
        const response = await fetch(componentPath);
        const html = await response.text();
        
        targetElement.insertAdjacentHTML(position, html);
        
        // 컴포넌트 로드 후 이벤트 발생
        this.dispatchComponentLoadedEvent(componentPath, targetElement);
    }

    /**
     * 컴포넌트 로드 완료 이벤트 발생
     * @param {string} componentPath - 컴포넌트 파일 경로
     * @param {Element} targetElement - 대상 요소
     */
    dispatchComponentLoadedEvent(componentPath, targetElement) {
        const event = new CustomEvent('componentLoaded', {
            detail: {
                componentPath,
                targetElement,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 여러 컴포넌트를 병렬로 로드
     * @param {Array} components - 로드할 컴포넌트 배열 [{path, target, position}]
     * @returns {Promise<void[]>}
     */
    async loadMultipleComponents(components) {
        const promises = components.map(component => 
            this.loadComponent(component.path, component.target, component.position)
        );
        return Promise.all(promises);
    }

    /**
     * 컴포넌트 캐시 초기화
     */
    clearCache() {
        this.loadedComponents.clear();
        this.loadingPromises.clear();
    }

    /**
     * 특정 컴포넌트 캐시 제거
     * @param {string} componentPath - 컴포넌트 파일 경로
     */
    removeFromCache(componentPath) {
        this.loadedComponents.delete(componentPath);
        this.loadingPromises.delete(componentPath);
    }
}

// 전역 컴포넌트 로더 인스턴스 생성
window.componentLoader = new ComponentLoader();

// 페이지 로드 시 자동으로 헤더와 푸터 로드
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 현재 페이지 경로에 따라 컴포넌트 경로 결정
        const currentPath = window.location.pathname;
        let headerPath, footerPath;
        
        if (currentPath.includes('/pages/')) {
            // pages 폴더 내의 페이지들
            headerPath = '../../components/header.html';
            footerPath = '../../components/footer.html';
        } else {
            // 루트 페이지들
            headerPath = 'components/header.html';
            footerPath = 'components/footer.html';
        }
        
        // 헤더와 푸터를 병렬로 로드
        await window.componentLoader.loadMultipleComponents([
            {
                path: headerPath,
                target: '#header-container',
                position: 'beforeend'
            },
            {
                path: footerPath,
                target: '#footer-container',
                position: 'beforeend'
            }
        ]);

        console.log('헤더와 푸터 컴포넌트가 성공적으로 로드되었습니다.');

    } catch (error) {
        console.error('컴포넌트 로딩 중 오류 발생:', error);
    }
});

// 컴포넌트 로드 완료 이벤트 리스너
document.addEventListener('componentLoaded', (event) => {
    const { componentPath, targetElement } = event.detail;
    console.log(`컴포넌트 로드 완료: ${componentPath}`);
    
    // 특정 컴포넌트별 초기화 로직
    if (componentPath.includes('header.html')) {
        initializeHeader();
    } else if (componentPath.includes('footer.html')) {
        initializeFooter();
    }
});

/**
 * 헤더 초기화 함수
 */
function initializeHeader() {
    // 모바일 메뉴 토글 기능
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mainNavigation = document.querySelector('.main-navigation');

    if (mobileMenuToggle && mobileNavOverlay && mainNavigation) {
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            mobileNavOverlay.style.display = !isExpanded ? 'block' : 'none';
            mainNavigation.classList.toggle('mobile-open');
            
            // 스크롤 방지
            document.body.style.overflow = !isExpanded ? 'hidden' : '';
        });

        // 오버레이 클릭 시 메뉴 닫기
        mobileNavOverlay.addEventListener('click', () => {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileNavOverlay.style.display = 'none';
            mainNavigation.classList.remove('mobile-open');
            document.body.style.overflow = '';
        });
    }
}

/**
 * 푸터 초기화 함수
 */
function initializeFooter() {
    // Back to Top 버튼 기능
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        // 스크롤 이벤트 리스너
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        // 클릭 이벤트 리스너
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}
