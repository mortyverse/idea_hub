/**
 * Main JavaScript - 아이디어 허브 메인 스크립트
 */

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('아이디어 허브가 로드되었습니다.');
    
    // 초기화 함수들 실행
    initializeNavigation();
    initializeStats();
    initializeScrollEffects();
    initializeBackToTop();
    initializeLoadingIndicator();
    initializeUserMenu();
    initializeMobileMenu();
    initializeAnimations();
});

/**
 * 네비게이션 초기화
 */
function initializeNavigation() {
    const header = document.querySelector('.site-header');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // 스크롤 시 헤더 스타일 변경
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // 현재 페이지 하이라이트
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

/**
 * 통계 카운터 애니메이션 초기화
 */
function initializeStats() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2초
        const increment = target / (duration / 16); // 60fps 기준
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    };
    
    // Intersection Observer로 스크롤 시 애니메이션 실행
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

/**
 * 스크롤 효과 초기화
 */
function initializeScrollEffects() {
    // 스크롤 시 요소들 페이드인 효과
    const fadeElements = document.querySelectorAll('.card, .stat-card, .idea-card');
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeObserver.observe(element);
    });
}

/**
 * 백투탑 버튼 초기화
 */
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) return;
    
    // 스크롤 시 버튼 표시/숨김
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    // 클릭 시 맨 위로 스크롤
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * 로딩 인디케이터 초기화
 */
function initializeLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // 페이지 로드 시 로딩 표시
    window.addEventListener('beforeunload', function() {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
    });
    
    // 페이지 로드 완료 시 로딩 숨김
    window.addEventListener('load', function() {
        if (loadingIndicator) {
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
            }, 500);
        }
    });
}

/**
 * 사용자 메뉴 초기화
 */
function initializeUserMenu() {
    const userToggle = document.querySelector('.user-toggle');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (!userToggle || !userDropdown) return;
    
    // 토글 클릭 이벤트
    userToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isExpanded = userToggle.getAttribute('aria-expanded') === 'true';
        
        userToggle.setAttribute('aria-expanded', !isExpanded);
        userDropdown.classList.toggle('active', !isExpanded);
    });
    
    // 외부 클릭 시 메뉴 닫기
    document.addEventListener('click', function() {
        userToggle.setAttribute('aria-expanded', 'false');
        userDropdown.classList.remove('active');
    });
    
    // 드롭다운 내부 클릭 시 이벤트 전파 방지
    userDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

/**
 * 모바일 메뉴 초기화
 */
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');
    
    if (!mobileToggle || !navMenu) return;
    
    // 햄버거 메뉴 토글
    mobileToggle.addEventListener('click', function() {
        const isActive = mobileToggle.classList.contains('active');
        
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        if (mobileOverlay) {
            mobileOverlay.style.display = isActive ? 'none' : 'block';
        }
        
        // 스크롤 방지
        document.body.style.overflow = isActive ? 'auto' : 'hidden';
    });
    
    // 오버레이 클릭 시 메뉴 닫기
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function() {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
            mobileOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // 네비게이션 링크 클릭 시 메뉴 닫기 (모바일)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 991) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                if (mobileOverlay) {
                    mobileOverlay.style.display = 'none';
                }
                document.body.style.overflow = 'auto';
            }
        });
    });
}

/**
 * 애니메이션 초기화
 */
function initializeAnimations() {
    // 아이디어 버블 애니메이션
    const bubbles = document.querySelectorAll('.bubble');
    bubbles.forEach((bubble, index) => {
        bubble.style.animationDelay = `${index * 0.2}s`;
    });
    
    // 버튼 호버 효과
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // 카드 호버 효과
    const cards = document.querySelectorAll('.card, .idea-card, .stat-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * 아이디어 포크 기능
 */
function initializeForkButtons() {
    const forkButtons = document.querySelectorAll('.fork-btn');
    
    forkButtons.forEach(button => {
        button.addEventListener('click', function() {
            const ideaId = this.getAttribute('data-idea-id');
            
            if (!ideaId) return;
            
            // 로딩 상태 표시
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">포크 중...</span>';
            this.disabled = true;
            
            // API 호출 (실제 구현 시)
            setTimeout(() => {
                // 성공 시
                this.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">포크 완료</span>';
                this.classList.add('success');
                
                // 2초 후 원래 상태로 복원
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                    this.classList.remove('success');
                }, 2000);
            }, 1500);
        });
    });
}

/**
 * 더 보기 버튼 기능
 */
function initializeLoadMoreButtons() {
    const loadMoreButtons = document.querySelectorAll('.load-more-btn');
    
    loadMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            // 로딩 상태 표시
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">로딩 중...</span>';
            this.disabled = true;
            
            // API 호출 (실제 구현 시)
            setTimeout(() => {
                // 성공 시
                this.innerHTML = originalText;
                this.disabled = false;
                
                // 새로운 콘텐츠 추가 (예시)
                console.log(`더 많은 ${type} 아이디어를 로드했습니다.`);
            }, 1500);
        });
    });
}

/**
 * 검색 기능
 */
function initializeSearch() {
    const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
    
    searchInputs.forEach(input => {
        let searchTimeout;
        
        input.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length < 2) return;
            
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });
    });
}

/**
 * 검색 실행
 */
function performSearch(query) {
    console.log(`검색어: ${query}`);
    
    // 실제 구현 시 API 호출
    // fetch(`/api/search/results.php?q=${encodeURIComponent(query)}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         displaySearchResults(data);
    //     });
}

/**
 * 에러 처리
 */
window.addEventListener('error', function(e) {
    console.error('JavaScript 에러:', e.error);
    
    // 사용자에게 에러 알림 (선택사항)
    if (window.confirm('오류가 발생했습니다. 페이지를 새로고침하시겠습니까?')) {
        window.location.reload();
    }
});

/**
 * 네트워크 상태 확인
 */
window.addEventListener('online', function() {
    console.log('네트워크 연결이 복구되었습니다.');
    // 연결 복구 알림 표시
});

window.addEventListener('offline', function() {
    console.log('네트워크 연결이 끊어졌습니다.');
    // 오프라인 알림 표시
});

/**
 * 페이지 가시성 변경 처리
 */
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('페이지가 숨겨졌습니다.');
        // 백그라운드 작업 일시정지
    } else {
        console.log('페이지가 다시 보입니다.');
        // 백그라운드 작업 재개
    }
});

// 전역 함수로 내보내기
window.IdeaHub = {
    initializeForkButtons,
    initializeLoadMoreButtons,
    initializeSearch,
    performSearch
};
