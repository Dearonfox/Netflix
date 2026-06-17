# Netflix Clone Project Report

## 1. Project Summary

이 프로젝트는 React와 TypeScript로 구현한 Netflix 스타일 영화 탐색 서비스입니다. TMDB API를 통해 영화 데이터를 조회하고, 사용자는 영화 검색, 인기 콘텐츠 확인, 찜 목록 관리, 감상 메모 저장 기능을 사용할 수 있습니다.

이번 작업에서는 기존 프론트엔드 중심 SPA에 간단한 Node.js 백엔드 API를 추가하여 오픈소스 과제 4번의 "Front-End와 Back-End 모두 포함" 조건을 만족하도록 확장했습니다.

## 2. Current Tech Stack

- Front-End: React, TypeScript, React Router, Axios
- Back-End: Node.js HTTP server
- Storage: localStorage, JSON file
- External API: TMDB API
- Test: React Scripts, Jest
- Deploy Target: GitHub Pages

## 3. Code Review

### Strengths

- 영화 목록, 검색, 찜 목록, 로그인 UI 등 클론 코딩의 핵심 기능이 이미 구성되어 있습니다.
- React Router를 사용해 페이지별 구조가 분리되어 있습니다.
- `src/api`, `src/utils`, `src/pages`, `src/Component`처럼 역할별 폴더 구분이 되어 있어 확장하기 쉽습니다.
- localStorage 유틸을 통해 브라우저 저장소 접근을 일부 공통화했습니다.

### Issues

- 현재 로그인/회원가입은 localStorage 기반이라 실제 인증 보안은 없습니다.
- TMDB API 키를 로그인 비밀번호처럼 사용하는 구조는 제출용 데모에는 가능하지만, 실제 서비스 구조로는 적절하지 않습니다.
- 백엔드가 새로 추가되었지만 아직 JSON 파일 저장 방식이므로 동시성, 검색, 사용자 관리에는 한계가 있습니다.
- CRA와 최신 Node 버전 조합에서 production build가 실패합니다. 현재 환경은 Node `v24.13.0`이며, CRA `react-scripts@5`는 보통 Node 18 LTS 또는 20 LTS에서 더 안정적입니다.
- 스타일이 대부분 inline style이라 UI 규모가 커질수록 유지보수가 어려워질 수 있습니다.

## 4. Added Feature

### Back-End Movie Notes API

찜한 영화마다 감상 메모를 저장할 수 있는 백엔드 API를 추가했습니다.

API 목록:

- `GET /api/health`
- `GET /api/movies/:movieId/note?user={email}`
- `POST /api/movies/:movieId/note?user={email}`
- `DELETE /api/movies/:movieId/note?user={email}`

프론트엔드 변경:

- 찜 목록 페이지에서 영화별 감상 메모 입력 가능
- `메모 저장` 버튼으로 백엔드 API에 저장
- 서버 연결 실패 시 `서버 연결 필요` 상태 표시

## 5. Verification

확인 완료:

- `npx tsc --noEmit`: 통과
- `npm test -- --watchAll=false --runInBand`: 통과
- `GET /api/health`: 통과
- 감상 메모 저장/조회 API: 통과

빌드 이슈:

- `npm run build`는 현재 Node `v24.13.0` 환경에서 `react-scripts build`가 exit code 1로 종료됩니다.
- 권장 해결 방법은 Node 20 LTS 또는 Node 18 LTS로 낮춘 뒤 다시 빌드하는 것입니다.

## 6. Development Roadmap

### Step 1. Submission Stabilization

- Node 버전을 20 LTS로 맞추고 production build 확인
- README 실행 방법 보강
- GitHub 저장소에 백엔드 포함 변경사항 push

### Step 2. Back-End Upgrade

- 현재 Node 기본 HTTP 서버를 Express로 전환
- JSON 파일 저장소를 SQLite로 전환
- 사용자, 찜 목록, 감상 메모 테이블 분리
- API 에러 응답 형식 통일

### Step 3. Authentication

- localStorage 회원가입을 백엔드 회원가입 API로 이동
- 비밀번호 해시 처리
- 로그인 세션 또는 JWT 도입
- 사용자별 찜 목록과 메모 분리 저장

### Step 4. Front-End Refactoring

- inline style을 CSS module 또는 styled-components로 분리
- 공통 MovieCard 컴포넌트 재사용 확대
- API loading, error, empty state UI 통일
- 모바일 레이아웃 QA 강화

### Step 5. Deployment

- 프론트엔드: GitHub Pages 또는 Vercel
- 백엔드: Render, Railway, Fly.io 중 하나 선택
- TMDB API Key는 환경변수로 관리

## 7. Recommended Next Implementation

다음으로 가장 좋은 추가 기능은 Express + SQLite 기반의 백엔드 전환입니다. 이 작업을 하면 단순 클론을 넘어 "프론트와 백엔드가 실제로 역할을 나누는 서비스"로 보이기 때문에 과제 평가에서 더 설득력이 있습니다.
