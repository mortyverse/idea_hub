/**
 * Utility Functions - 유틸리티 함수들
 */

/**
 * 문자열 유틸리티
 */
const StringUtils = {
    /**
     * 문자열 자르기
     */
    truncate(str, length = 100, suffix = '...') {
        if (!str || str.length <= length) return str;
        return str.substring(0, length) + suffix;
    },
    
    /**
     * HTML 태그 제거
     */
    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    },
    
    /**
     * 첫 글자 대문자로
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    /**
     * 카멜케이스로 변환
     */
    toCamelCase(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    },
    
    /**
     * 케밥케이스로 변환
     */
    toKebabCase(str) {
        return str.replace(/([A-Z])/g, '-$1').toLowerCase();
    },
    
    /**
     * 랜덤 문자열 생성
     */
    generateRandom(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    /**
     * 이메일 유효성 검사
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    /**
     * URL 유효성 검사
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    /**
     * 전화번호 포맷팅
     */
    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
        return phone;
    }
};

/**
 * 숫자 유틸리티
 */
const NumberUtils = {
    /**
     * 숫자 포맷팅 (천 단위 콤마)
     */
    formatNumber(num) {
        return num.toLocaleString();
    },
    
    /**
     * 파일 크기 포맷팅
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * 퍼센트 계산
     */
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    },
    
    /**
     * 랜덤 숫자 생성
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * 숫자 범위 제한
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
};

/**
 * 날짜/시간 유틸리티
 */
const DateUtils = {
    /**
     * 상대적 시간 표시
     */
    getRelativeTime(date) {
        const now = new Date();
        const targetDate = new Date(date);
        const diffInSeconds = Math.floor((now - targetDate) / 1000);
        
        if (diffInSeconds < 60) return '방금 전';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
        return `${Math.floor(diffInSeconds / 31536000)}년 전`;
    },
    
    /**
     * 날짜 포맷팅
     */
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },
    
    /**
     * 날짜 차이 계산
     */
    getDaysDifference(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    /**
     * 오늘인지 확인
     */
    isToday(date) {
        const today = new Date();
        const targetDate = new Date(date);
        return today.toDateString() === targetDate.toDateString();
    }
};

/**
 * DOM 유틸리티
 */
const DOMUtils = {
    /**
     * 요소 선택
     */
    $(selector) {
        return document.querySelector(selector);
    },
    
    /**
     * 요소들 선택
     */
    $$(selector) {
        return document.querySelectorAll(selector);
    },
    
    /**
     * 요소 생성
     */
    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    },
    
    /**
     * 클래스 토글
     */
    toggleClass(element, className) {
        element.classList.toggle(className);
    },
    
    /**
     * 요소 표시/숨김
     */
    toggleVisibility(element, show = null) {
        if (show === null) {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        } else {
            element.style.display = show ? '' : 'none';
        }
    },
    
    /**
     * 스크롤 위치 가져오기
     */
    getScrollPosition() {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop
        };
    },
    
    /**
     * 부드러운 스크롤
     */
    smoothScrollTo(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },
    
    /**
     * 요소가 뷰포트에 있는지 확인
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

/**
 * 로컬 스토리지 유틸리티
 */
const StorageUtils = {
    /**
     * 데이터 저장
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },
    
    /**
     * 데이터 가져오기
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },
    
    /**
     * 데이터 삭제
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },
    
    /**
     * 모든 데이터 삭제
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },
    
    /**
     * 키 존재 확인
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    }
};

/**
 * 쿠키 유틸리티
 */
const CookieUtils = {
    /**
     * 쿠키 설정
     */
    set(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },
    
    /**
     * 쿠키 가져오기
     */
    get(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    /**
     * 쿠키 삭제
     */
    delete(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
};

/**
 * 디바운스/스로틀 유틸리티
 */
const PerformanceUtils = {
    /**
     * 디바운스 함수
     */
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
    },
    
    /**
     * 스로틀 함수
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

/**
 * 검색 유틸리티
 */
const SearchUtils = {
    /**
     * 하이라이트 텍스트
     */
    highlightText(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },
    
    /**
     * 검색어 추출
     */
    extractSearchTerms(query) {
        return query.toLowerCase()
            .split(/\s+/)
            .filter(term => term.length > 0);
    },
    
    /**
     * 유사도 계산 (간단한 버전)
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    },
    
    /**
     * 레벤슈타인 거리 계산
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
};

/**
 * 파일 유틸리티
 */
const FileUtils = {
    /**
     * 파일 확장자 가져오기
     */
    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    },
    
    /**
     * 파일 크기 검증
     */
    validateFileSize(file, maxSize = 2 * 1024 * 1024) { // 2MB 기본값
        return file.size <= maxSize;
    },
    
    /**
     * 파일 타입 검증
     */
    validateFileType(file, allowedTypes = ['jpg', 'jpeg', 'png', 'gif']) {
        const extension = this.getFileExtension(file.name).toLowerCase();
        return allowedTypes.includes(extension);
    },
    
    /**
     * 파일 미리보기 URL 생성
     */
    createPreviewUrl(file) {
        return URL.createObjectURL(file);
    },
    
    /**
     * 파일 다운로드
     */
    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * 폼 유틸리티
 */
const FormUtils = {
    /**
     * 폼 데이터 수집
     */
    collectFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },
    
    /**
     * 폼 유효성 검사
     */
    validateForm(form, rules) {
        const errors = {};
        const formData = this.collectFormData(form);
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            
            if (rule.required && !value) {
                errors[field] = `${field}는 필수 입력 항목입니다.`;
                continue;
            }
            
            if (rule.minLength && value.length < rule.minLength) {
                errors[field] = `${field}는 최소 ${rule.minLength}자 이상 입력해주세요.`;
                continue;
            }
            
            if (rule.maxLength && value.length > rule.maxLength) {
                errors[field] = `${field}는 최대 ${rule.maxLength}자까지 입력 가능합니다.`;
                continue;
            }
            
            if (rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.message || `${field} 형식이 올바르지 않습니다.`;
                continue;
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

// 전역으로 유틸리티 객체들 내보내기
window.Utils = {
    string: StringUtils,
    number: NumberUtils,
    date: DateUtils,
    dom: DOMUtils,
    storage: StorageUtils,
    cookie: CookieUtils,
    performance: PerformanceUtils,
    search: SearchUtils,
    file: FileUtils,
    form: FormUtils
};
