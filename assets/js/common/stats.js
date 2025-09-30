/**
 * Statistics Loader
 * 통계 데이터 로더
 */

class StatsLoader {
    constructor() {
        this.stats = {
            total_ideas: 0,
            total_users: 0,
            total_mindmaps: 0
        };
    }

    /**
     * Load statistics from API
     * API에서 통계 데이터 로드
     */
    async loadStats() {
        try {
            const stats = await API.stats.getOverallStats();
            this.stats = stats;
            this.updateUI();
        } catch (error) {
            console.error('Failed to load stats:', error);
            // 기본값 사용
            this.updateUI();
        }
    }

    /**
     * Update UI with statistics
     * 통계로 UI 업데이트
     */
    updateUI() {
        // CTA 섹션의 통계 업데이트
        const statElements = document.querySelectorAll('[data-stat]');
        statElements.forEach(element => {
            const statType = element.getAttribute('data-stat');
            const value = this.stats[statType] || 0;
            element.textContent = this.formatNumber(value) + '+';
        });

        // 통계 섹션의 숫자 애니메이션
        const statNumbers = document.querySelectorAll('.stat-number[data-target]');
        statNumbers.forEach(element => {
            const target = parseInt(element.getAttribute('data-target')) || 0;
            this.animateNumber(element, target);
        });
    }

    /**
     * Format number with commas
     * 숫자를 쉼표로 구분하여 포맷
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Animate number counting
     * 숫자 카운팅 애니메이션
     */
    animateNumber(element, target) {
        const duration = 2000; // 2초
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = this.formatNumber(Math.floor(current));
        }, 16);
    }
}

// 페이지 로드 시 통계 로드
document.addEventListener('DOMContentLoaded', async function() {
    const statsLoader = new StatsLoader();
    await statsLoader.loadStats();
});

// 전역으로 내보내기
window.StatsLoader = StatsLoader;
