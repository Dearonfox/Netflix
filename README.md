## Netflix Clone

React와 TypeScript로 만든 Netflix 스타일 영화 탐색 앱입니다. TMDB API를 사용해 인기 영화, 최신 영화, 액션 영화를 보여주고 검색과 찜 목록을 제공합니다.

### Live Demo
- https://dearonfox.github.io/Netflix/#/

### Features

- 영화 목록(인기/최신/액션 등) 조회
- 검색
- 찜(Wishlist): localStorage 저장/해제
- 로그인/회원가입(localStorage 기반)
- 반응형 Header(모바일 햄버거 메뉴)
- 백엔드 API 기반 감상 메모 저장

### Tech Stack

- Front-End: React, TypeScript, React Router, Axios
- Back-End: Node.js HTTP server
- Storage: localStorage, JSON file
- Deploy: GitHub Pages

### Run (Local)

```bash
npm install
npm run server
npm start
```

프론트엔드는 기본적으로 `http://localhost:3000`, 백엔드는 `http://localhost:4000`에서 실행됩니다.

### Environment

TMDB API 키는 `.env`의 `REACT_APP_TMDB_API_KEY` 또는 로그인 화면의 `TMDB API Key` 입력값으로 사용할 수 있습니다.

```bash
cp .env.example .env
```

`.env` 파일을 수정한 뒤 프론트엔드 서버를 다시 시작하세요.
