# JavaScript 기반 컴포넌트 시스템

아이디어 허브 프로젝트의 헤더와 푸터를 컴포넌트화하여 코드 중복을 제거하고 유지보수성을 향상시킨 시스템입니다.

## 📁 파일 구조

```
components/
├── header.html          # 헤더 컴포넌트
├── footer.html          # 푸터 컴포넌트
└── ... (기존 컴포넌트들)

assets/js/common/
├── component-loader.js  # 컴포넌트 로더 시스템
├── main.js             # 메인 스크립트 (수정됨)
└── ... (기존 스크립트들)
```

## 🚀 사용법

### 1. 기본 사용법

새로운 페이지를 만들 때 다음과 같이 작성하세요:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <!-- 메타 태그들 -->
    <title>새 페이지</title>
    
    <!-- CSS 파일들 -->
    <link rel="stylesheet" href="assets/css/common/main.css">
    <link rel="stylesheet" href="assets/css/common/components.css">
    <link rel="stylesheet" href="assets/css/common/responsive.css">
</head>
<body>
    <!-- 로딩 인디케이터 -->
    <div id="loading-indicator" class="loading-indicator" style="display: none;">
        <div class="loading-spinner"></div>
        <span>로딩 중...</span>
    </div>
    
    <!-- 메인 컨테이너 -->
    <div class="main-container">
        <!-- 헤더는 자동으로 로드됩니다 -->
        
        <!-- 페이지 콘텐츠 -->
        <main id="main-content" class="main-content">
            <!-- 여기에 페이지별 콘텐츠 작성 -->
        </main>
        
        <!-- 푸터는 자동으로 로드됩니다 -->
    </div>
    
    <!-- JavaScript 파일들 -->
    <script src="assets/js/common/component-loader.js"></script>
    <script src="assets/js/common/main.js"></script>
    <!-- 기타 필요한 스크립트들 -->
</body>
</html>
```

### 2. 수동으로 컴포넌트 로드하기

특정 컴포넌트를 수동으로 로드하려면:

```javascript
// 단일 컴포넌트 로드
await window.componentLoader.loadComponent(
    'components/header.html',  // 컴포넌트 경로
    '.main-container',         // 삽입할 대상
    'afterbegin'              // 삽입 위치
);

// 여러 컴포넌트 병렬 로드
await window.componentLoader.loadMultipleComponents([
    {
        path: 'components/header.html',
        target: '.main-container',
        position: 'afterbegin'
    },
    {
        path: 'components/footer.html',
        target: '.main-container',
        position: 'beforeend'
    }
]);
```

### 3. 컴포넌트 로드 이벤트 처리

```javascript
// 컴포넌트 로드 완료 이벤트 리스너
document.addEventListener('componentLoaded', (event) => {
    const { componentPath, targetElement, timestamp } = event.detail;
    console.log(`컴포넌트 로드 완료: ${componentPath}`);
    
    // 특정 컴포넌트별 초기화 로직
    if (componentPath.includes('header.html')) {
        // 헤더 관련 초기화
    } else if (componentPath.includes('footer.html')) {
        // 푸터 관련 초기화
    }
});
```

## 🔧 컴포넌트 로더 API

### ComponentLoader 클래스

#### `loadComponent(componentPath, targetSelector, position)`
- **componentPath**: 컴포넌트 파일 경로
- **targetSelector**: 삽입할 대상 요소 선택자
- **position**: 삽입 위치 ('beforebegin', 'afterbegin', 'beforeend', 'afterend')
- **반환값**: Promise<void>

#### `loadMultipleComponents(components)`
- **components**: 로드할 컴포넌트 배열
- **반환값**: Promise<void[]>

#### `clearCache()`
- 컴포넌트 캐시 초기화

#### `removeFromCache(componentPath)`
- 특정 컴포넌트 캐시 제거

## 📋 컴포넌트 작성 가이드

### 헤더 컴포넌트 (`components/header.html`)
- 네비게이션 메뉴
- 로고 및 사이트 제목
- 사용자 액션 버튼
- 모바일 메뉴 토글

### 푸터 컴포넌트 (`components/footer.html`)
- 사이트 정보
- 링크 목록
- 소셜 미디어 링크
- 저작권 정보
- Back to Top 버튼

## ⚡ 성능 최적화

1. **캐싱**: 한 번 로드된 컴포넌트는 캐시되어 재사용됩니다.
2. **병렬 로딩**: 여러 컴포넌트를 동시에 로드할 수 있습니다.
3. **중복 방지**: 동일한 컴포넌트가 중복 로드되지 않습니다.

## 🐛 문제 해결

### 컴포넌트가 로드되지 않는 경우
1. 파일 경로가 올바른지 확인
2. 대상 요소가 존재하는지 확인
3. 브라우저 개발자 도구에서 네트워크 탭 확인

### JavaScript 오류가 발생하는 경우
1. 컴포넌트 로드 순서 확인
2. `component-loader.js`가 다른 스크립트보다 먼저 로드되는지 확인
3. 콘솔에서 오류 메시지 확인

## 📝 예제 파일

- `index.html`: 메인 페이지 (컴포넌트 시스템 적용됨)
- `test.html`: 테스트 페이지 (컴포넌트 시스템 테스트용)

## 🔄 업데이트 내역

- **v1.0.0**: 초기 컴포넌트 시스템 구현
  - 헤더/푸터 컴포넌트 분리
  - JavaScript 기반 동적 로딩
  - 캐싱 및 성능 최적화
  - 이벤트 기반 초기화 시스템
