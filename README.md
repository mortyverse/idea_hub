# 아이디어 허브 (Idea Hub)

집단지성으로 아이디어를 발전시키는 오픈소스 아이디어 플랫폼

## 📋 프로젝트 개요

아이디어 허브는 세상의 모든 아이디어를 한곳에 모아 집단지성의 힘으로 발전시키는 오픈소스 아이디어 플랫폼입니다. 개발자들이 GitHub에서 코드를 공유하고 협업하여 소프트웨어를 발전시키듯, 아이디어 허브는 누구나 자유롭게 아이디어를 제안하고, 다른 사람의 아이디어에 의견을 더하거나 새로운 방향으로 발전시켜 나가는 협력의 공간입니다.

### 🎯 핵심 기능

- **아이디어 게시판**: 텍스트 기반 아이디어 제안 및 토론
- **공동 편집 마인드맵**: 실시간 협업 마인드맵 편집
- **아이디어 포크 시스템**: GitHub 스타일의 아이디어 발전
- **태그 시스템**: 아이디어 분류 및 검색
- **댓글 시스템**: 아이디어 토론 및 피드백

### 👥 대상 사용자

- **주요 타겟층**: 창의적인 아이디어를 구체화하고 발전시키고 싶은 대학생, 프로젝트 아이디어가 필요한 학생, 새로운 영감을 얻고 싶은 기획자 및 창작자
- **서브 타겟층**: 특정 문제에 대한 해결책을 찾고자 하는 개인 또는 그룹, 집단지성을 통해 아이디어를 얻고 싶은 모든 사람

## 🛠 기술 스택

- **프론트엔드**: HTML5, CSS3, JavaScript (ES6+)
- **백엔드**: PHP 7.4+
- **데이터베이스**: MySQL 5.7+
- **호스팅**: dothome.co.kr
- **버전 관리**: Git

### 기술 스택별 역할

#### 프론트엔드
- **HTML5**: 페이지 구조와 콘텐츠 마크업, 시맨틱 태그 사용
- **CSS3**: 스타일링, 레이아웃, 반응형 디자인, 애니메이션
- **JavaScript**: 클라이언트 사이드 상호작용, API 통신, DOM 조작

#### 백엔드
- **PHP**: 서버 사이드 로직, 데이터베이스 처리, API 엔드포인트
- **MySQL**: 데이터 저장, 관계형 데이터베이스 관리, 쿼리 최적화

## 📁 프로젝트 구조

```
idea_hub/
├── index.html                   # 메인 페이지 (HTML)
├── config/
│   ├── database.php            # 데이터베이스 연결 설정 (PHP)
│   └── config.php              # 전역 설정 (PHP)
├── includes/
│   ├── header.html             # 공통 헤더 (HTML)
│   ├── footer.html             # 공통 푸터 (HTML)
│   ├── navigation.html         # 네비게이션 메뉴 (HTML)
│   └── functions.php           # 공통 함수들 (PHP)
├── components/                 # 재사용 가능한 컴포넌트
│   ├── hero-section.html       # 히어로 섹션 (HTML)
│   ├── stats-section.html      # 통계 섹션 (HTML)
│   ├── latest-ideas.html      # 최신 아이디어 섹션 (HTML)
│   ├── popular-ideas.html     # 인기 아이디어 섹션 (HTML)
│   ├── categories.html        # 카테고리 섹션 (HTML)
│   └── cta-section.html       # CTA 섹션 (HTML)
├── pages/
│   ├── ideas/                  # 아이디어 관련 페이지
│   │   ├── list.html           # 아이디어 목록 (HTML)
│   │   ├── detail.html         # 아이디어 상세 (HTML)
│   │   ├── create.html         # 아이디어 작성 (HTML)
│   │   ├── edit.html           # 아이디어 수정 (HTML)
│   │   └── fork.html           # 아이디어 포크 (HTML)
│   ├── mindmap/                # 마인드맵 관련 페이지
│   │   ├── editor.html         # 마인드맵 편집 (HTML)
│   │   ├── viewer.html         # 마인드맵 뷰어 (HTML)
│   │   └── list.html           # 마인드맵 목록 (HTML)
│   ├── tags/                   # 태그 관련 페이지
│   │   ├── list.html           # 태그 목록 (HTML)
│   │   ├── detail.html         # 태그 상세 (HTML)
│   │   └── manage.html         # 태그 관리 (HTML)
│   ├── search/                 # 검색 관련 페이지
│   │   ├── index.html          # 검색 메인 (HTML)
│   │   └── results.html        # 검색 결과 (HTML)
│   └── profile/                # 프로필 관련 페이지
│       ├── user.html           # 사용자 프로필 (HTML)
│       └── settings.html       # 설정 (HTML)
├── api/
│   ├── ideas/                  # 아이디어 관련 API
│   │   ├── list.php            # 아이디어 목록 API
│   │   ├── detail.php          # 아이디어 상세 API
│   │   ├── create.php          # 아이디어 생성 API
│   │   ├── edit.php            # 아이디어 수정 API
│   │   ├── delete.php          # 아이디어 삭제 API
│   │   └── fork.php            # 아이디어 포크 API
│   ├── mindmap/                # 마인드맵 관련 API
│   │   ├── editor.php          # 마인드맵 편집 API
│   │   ├── viewer.php          # 마인드맵 뷰어 API
│   │   ├── nodes.php           # 노드 관리 API
│   │   └── list.php            # 마인드맵 목록 API
│   ├── tags/                   # 태그 관련 API
│   │   ├── list.php            # 태그 목록 API
│   │   ├── detail.php          # 태그 상세 API
│   │   ├── manage.php          # 태그 관리 API
│   │   └── autocomplete.php    # 태그 자동완성 API
│   ├── search/                 # 검색 관련 API
│   │   ├── index.php           # 검색 메인 API
│   │   └── results.php         # 검색 결과 API
│   ├── comments/               # 댓글 관련 API
│   │   ├── list.php            # 댓글 목록 API
│   │   ├── create.php          # 댓글 생성 API
│   │   ├── edit.php            # 댓글 수정 API
│   │   └── delete.php          # 댓글 삭제 API
│   └── profile/                # 프로필 관련 API
│       ├── user.php            # 사용자 프로필 API
│       └── settings.php        # 설정 API
├── assets/
│   ├── css/
│   │   ├── common/             # 공통 CSS
│   │   │   ├── main.css        # 메인 스타일
│   │   │   ├── components.css  # 컴포넌트 스타일
│   │   │   └── responsive.css  # 반응형 스타일
│   │   ├── components/         # 컴포넌트별 CSS
│   │   │   ├── hero.css        # 히어로 섹션 스타일
│   │   │   ├── stats.css       # 통계 섹션 스타일
│   │   │   ├── ideas.css       # 아이디어 카드 스타일
│   │   │   └── categories.css  # 카테고리 스타일
│   │   ├── ideas/              # 아이디어 관련 CSS
│   │   │   ├── list.css        # 아이디어 목록 스타일
│   │   │   ├── detail.css      # 아이디어 상세 스타일
│   │   │   ├── create.css      # 아이디어 작성 스타일
│   │   │   ├── edit.css        # 아이디어 수정 스타일
│   │   │   └── fork.css        # 아이디어 포크 스타일
│   │   ├── mindmap/            # 마인드맵 관련 CSS
│   │   │   ├── editor.css      # 마인드맵 편집 스타일
│   │   │   ├── viewer.css      # 마인드맵 뷰어 스타일
│   │   │   └── list.css        # 마인드맵 목록 스타일
│   │   ├── tags/               # 태그 관련 CSS
│   │   │   ├── list.css        # 태그 목록 스타일
│   │   │   ├── detail.css      # 태그 상세 스타일
│   │   │   └── manage.css      # 태그 관리 스타일
│   │   ├── search/             # 검색 관련 CSS
│   │   │   ├── index.css       # 검색 메인 스타일
│   │   │   └── results.css     # 검색 결과 스타일
│   │   └── profile/            # 프로필 관련 CSS
│   │       ├── user.css        # 사용자 프로필 스타일
│   │       └── settings.css    # 설정 스타일
│   ├── js/
│   │   ├── common/             # 공통 JavaScript
│   │   │   ├── main.js         # 메인 JavaScript
│   │   │   ├── api.js          # API 통신 모듈
│   │   │   ├── utils.js        # 유틸리티 함수
│   │   │   └── components.js   # 공통 컴포넌트
│   │   ├── components/         # 컴포넌트별 JavaScript
│   │   │   ├── hero.js         # 히어로 섹션 기능
│   │   │   ├── stats.js        # 통계 로딩
│   │   │   ├── ideas.js        # 아이디어 카드 기능
│   │   │   └── categories.js   # 카테고리 기능
│   │   ├── ideas/              # 아이디어 관련 JavaScript
│   │   │   ├── list.js         # 아이디어 목록 기능
│   │   │   ├── detail.js       # 아이디어 상세 기능
│   │   │   ├── create.js       # 아이디어 작성 기능
│   │   │   ├── edit.js         # 아이디어 수정 기능
│   │   │   └── fork.js         # 아이디어 포크 기능
│   │   ├── mindmap/            # 마인드맵 관련 JavaScript
│   │   │   ├── editor.js       # 마인드맵 편집 기능
│   │   │   ├── viewer.js       # 마인드맵 뷰어 기능
│   │   │   ├── nodes.js        # 노드 관리 기능
│   │   │   └── list.js         # 마인드맵 목록 기능
│   │   ├── tags/               # 태그 관련 JavaScript
│   │   │   ├── list.js         # 태그 목록 기능
│   │   │   ├── detail.js       # 태그 상세 기능
│   │   │   ├── manage.js       # 태그 관리 기능
│   │   │   └── autocomplete.js # 태그 자동완성 기능
│   │   ├── search/             # 검색 관련 JavaScript
│   │   │   ├── index.js        # 검색 메인 기능
│   │   │   └── results.js      # 검색 결과 기능
│   │   └── profile/            # 프로필 관련 JavaScript
│   │       ├── user.js         # 사용자 프로필 기능
│   │       └── settings.js      # 설정 기능
│   └── images/
│       ├── icons/              # 아이콘 이미지들
│       ├── backgrounds/        # 배경 이미지들
│       └── uploads/            # 업로드된 이미지들
├── sql/
│   ├── schema.sql              # 데이터베이스 스키마
│   └── sample_data.sql         # 샘플 데이터
└── uploads/                    # 업로드된 파일들
```

## 🔗 파일 연결 관계

### 기본 규칙
각 페이지와 동일한 파일명으로 CSS/JS/API가 연결됩니다:

```
pages/{메뉴}/{파일명}.html ↔ assets/css/{메뉴}/{파일명}.css ↔ assets/js/{메뉴}/{파일명}.js ↔ api/{메뉴}/{파일명}.php
```

### 파일 역할 설명
- **HTML 파일**: 페이지 구조, 콘텐츠 마크업, 사용자 인터페이스
- **CSS 파일**: 스타일링, 레이아웃, 반응형 디자인
- **JavaScript 파일**: 클라이언트 사이드 로직, API 통신, 사용자 상호작용
- **PHP 파일**: 서버 사이드 로직, 데이터베이스 처리, API 응답

### 구체적인 연결 예시

#### 아이디어 관련
- `pages/ideas/list.html` → `assets/css/ideas/list.css` + `assets/js/ideas/list.js` + `api/ideas/list.php`
- `pages/ideas/detail.html` → `assets/css/ideas/detail.css` + `assets/js/ideas/detail.js` + `api/ideas/detail.php`
- `pages/ideas/create.html` → `assets/css/ideas/create.css` + `assets/js/ideas/create.js` + `api/ideas/create.php`

#### 마인드맵 관련
- `pages/mindmap/editor.html` → `assets/css/mindmap/editor.css` + `assets/js/mindmap/editor.js` + `api/mindmap/editor.php`
- `pages/mindmap/viewer.html` → `assets/css/mindmap/viewer.css` + `assets/js/mindmap/viewer.js` + `api/mindmap/viewer.php`

## 🗄️ 데이터베이스 설계

### 주요 테이블

#### ideas (아이디어 게시판)
- `id`: 게시글 고유 번호 (Primary Key)
- `title`: 아이디어 제목
- `content`: 아이디어 상세 설명
- `writer`: 작성자
- `created_at`: 작성일
- `view_count`: 조회수
- `fork_count`: 포크 수
- `comment_count`: 댓글 수
- `forked_from_id`: 원본 아이디어 ID (Foreign Key)

#### tags (태그)
- `id`: 태그 고유 번호 (Primary Key)
- `name`: 태그 이름
- `usage_count`: 사용 횟수

#### idea_tags (아이디어-태그 연결)
- `idea_id`: 아이디어 ID (Foreign Key)
- `tag_id`: 태그 ID (Foreign Key)

#### mindmap_nodes (마인드맵 노드)
- `id`: 노드 고유 번호 (Primary Key)
- `idea_id`: 해당 마인드맵이 속한 아이디어 ID
- `node_text`: 노드에 표시될 텍스트
- `parent_node_id`: 부모 노드 ID
- `position_x`: x좌표
- `position_y`: y좌표

#### comments (댓글)
- `id`: 댓글 고유 번호 (Primary Key)
- `idea_id`: 댓글이 달린 아이디어 ID
- `writer`: 작성자
- `content`: 댓글 내용
- `parent_comment_id`: 부모 댓글 ID (대댓글용)

## 🚀 개발 단계별 계획

### Phase 1: 기반 구조 구축 (1-2주)
**목표**: 기본 환경 설정 및 핵심 구조 완성

**작업 내용:**
- [x] 폴더 구조 생성 (컴포넌트 기반 구조)
- [x] 기본 페이지 구조 (`config/`, `includes/`, `components/`, 공통 CSS/JS)
- [x] 메인 페이지 컴포넌트화 구조 (`index.html`)

**학생 결정 사항 (적용됨):**
- [x] 컬러 팔레트: 파란색 계열 (#3498db)
- [x] 폰트: 웹폰트 Noto Sans KR
- [x] 레이아웃 스타일: 카드형 레이아웃

**컴포넌트 구조:**
```
index.html
├── includes/header.html          # 헤더 컴포넌트
├── components/
│   ├── hero-section.html        # 히어로 섹션 (서비스 소개)
│   ├── stats-section.html       # 통계 섹션 (아이디어 수, 댓글 수 등)
│   ├── latest-ideas.html        # 최신 아이디어 섹션
│   ├── popular-ideas.html       # 인기 아이디어 섹션
│   ├── categories.html          # 카테고리 바로가기 섹션
│   └── cta-section.html         # Call-to-Action 섹션
└── includes/footer.html         # 푸터 컴포넌트
```

### Phase 2: 아이디어 게시판 구현 (2-3주)
**목표**: 핵심 기능인 아이디어 게시판 완성

**작업 내용:**
- [ ] 아이디어 CRUD 기능 (생성, 조회, 수정, 삭제)
- [ ] 태그 시스템 (입력, 자동완성, 필터링)
- [ ] 댓글 시스템 (작성, 수정, 삭제, 대댓글)
- [ ] 검색 및 정렬 기능

**학생 결정 사항:**
- [ ] 댓글 정렬 방식 (최신순 vs 등록순)
- [ ] 태그 입력 방식 (자유 입력 vs 선택형)
- [ ] 아이디어 목록 표시 방식 (카드형 vs 테이블형)

### Phase 3: 마인드맵 기능 구현 (3-4주)
**목표**: 공동 편집 마인드맵 기능 완성

**작업 내용:**
- [ ] 마인드맵 기본 기능 (노드 추가/삭제/수정, 연결/해제)
- [ ] 실시간 협업 (AJAX를 통한 실시간 저장)
- [ ] 마인드맵 뷰어 (읽기 전용 모드)
- [ ] 드래그 앤 드롭 기능

**학생 결정 사항:**
- [ ] 마인드맵 라이브러리 선택 (직접 구현 vs 외부 라이브러리)
- [ ] 실시간 업데이트 방식 (폴링 vs WebSocket)
- [ ] 노드 스타일링 옵션

### Phase 4: 포크 시스템 및 고급 기능 (2-3주)
**목표**: 아이디어 포크 시스템 및 부가 기능 완성

**작업 내용:**
- [ ] 포크 시스템 (아이디어 포크, 계보 표시)
- [ ] 검색 및 필터링 (통합 검색, 고급 필터링)
- [ ] 사용자 경험 개선 (페이지네이션, 무한 스크롤)

**학생 결정 사항:**
- [ ] 포크 표시 방식 (트리형 vs 리스트형)
- [ ] 검색 알고리즘 (단순 검색 vs 전문 검색)
- [ ] 페이지네이션 방식 (숫자형 vs 무한스크롤)

### Phase 5: 최적화 및 배포 (1-2주)
**목표**: 성능 최적화 및 실제 배포

**작업 내용:**
- [ ] 성능 최적화 (DB 쿼리 최적화, 이미지 최적화)
- [ ] 보안 강화 (SQL 인젝션 방지, XSS 방지, CSRF 토큰)
- [ ] 배포 및 테스트 (dothome 호스팅 배포, 크로스 브라우저 테스트)

**학생 결정 사항:**
- [ ] 캐싱 전략 (브라우저 캐시 vs 서버 캐시)
- [ ] 보안 수준 (기본 vs 고급)
- [ ] 모니터링 도구 사용 여부

## 🌐 dothome 호스팅 환경 고려사항

### 지원 환경
- PHP 7.4+ (최신 버전 지원)
- MySQL 5.7+ (MariaDB 지원)
- Apache 웹서버
- SSL 인증서 지원
- FTP/SFTP 파일 업로드

### 제약사항
- 메모리 제한: 128MB (일반 플랜)
- 실행 시간 제한: 30초
- 파일 업로드 크기 제한: 2MB
- 데이터베이스 크기 제한: 100MB (기본 플랜)

### 최적화 방안
- 데이터베이스 쿼리 최적화
- 파일 업로드 최적화
- 캐싱 시스템 구현
- 메모리 사용량 최적화

## 🎨 디자인 컨셉

### 전체적인 스타일
- 깔끔하고 미니멀한 디자인
- 사용자가 아이디어 자체에 집중할 수 있도록 불필요한 장식 최소화
- 직관적인 UI 제공

### 컬러 팔레트
- **주 색상**: 신뢰감을 주는 파란색 (#3498db)
- **포인트 색상**: 창의력을 자극하는 노란색 (#f39c12)
- **배경 색상**: 눈이 편안한 흰색과 회색 톤

### 타이포그래피
- 가독성이 좋은 산세리프 계열 폰트 사용
- 명확한 정보 전달에 초점

## 🔧 설치 및 실행

### 1. 환경 요구사항
- PHP 7.4 이상
- MySQL 5.7 이상
- Apache 웹서버
- dothome 호스팅 계정

### 2. 설치 과정
1. 프로젝트 파일을 dothome 호스팅에 업로드
2. 데이터베이스 생성 및 사용자 계정 설정
3. `config/database.php`에서 DB 연결 정보 수정
4. `sql/schema.sql` 실행하여 테이블 생성
5. `sql/sample_data.sql` 실행하여 샘플 데이터 입력

### 3. 설정
- `config/config.php`에서 사이트 설정 수정
- `.htaccess` 파일로 URL 리라이팅 설정
- 파일 권한 설정 (755 for directories, 644 for files)

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 연락처

프로젝트에 대한 문의사항이나 제안사항이 있으시면 언제든지 연락해주세요.

---

**아이디어 허브** - 집단지성으로 아이디어를 발전시키는 플랫폼 🚀
