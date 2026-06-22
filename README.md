# Netflix Clone

React + TypeScript 기반 Netflix 클론 프로젝트입니다. 기존 프론트엔드 중심 클론에서 FastAPI 백엔드를 추가해 영화 데이터 조회 구조를 `React -> FastAPI -> TMDB API` 형태로 개선했습니다.

## GitHub Pages

- Front-End: https://dearonfox.github.io/Netflix/
- Repository: https://github.com/Dearonfox/Netflix.git

> GitHub Pages는 정적 프론트엔드 배포입니다. 영화 데이터와 AI 추천 기능까지 완전히 동작하려면 FastAPI 백엔드를 별도 서버에 실행하거나 배포한 뒤 `REACT_APP_API_BASE_URL`을 해당 백엔드 주소로 설정해야 합니다.

## 주요 기능

- Netflix 스타일 홈 화면
- 로그인 및 회원가입 UI
- 보호 라우트
- 메인 배너
- 인기 영화, 최신 영화, 대세 콘텐츠 조회
- 영화 검색
- 영화 상세 모달
- 사용자 찜 목록
- AI 영화 추천
- 추천 결과 클릭 시 검색 화면 이동

## 기술 스택

- Front-End: React, TypeScript, React Router, Axios, Framer Motion
- Back-End: FastAPI, SQLAlchemy 2.x, Pydantic v2, SQLite
- External API: TMDB API, OpenAI API
- Auth/Storage: Firebase Authentication, Firestore, localStorage

## 로컬 실행

백엔드:

```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

프론트엔드:

```powershell
npm install
$env:REACT_APP_API_BASE_URL="http://127.0.0.1:8000"
npm start
```

## 환경변수

프론트엔드:

```text
REACT_APP_API_BASE_URL
```

백엔드:

```text
TMDB_API_KEY
OPENAI_API_KEY
OPENAI_MODEL
BACKEND_CORS_ORIGINS
```
