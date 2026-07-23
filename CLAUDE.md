# talktalk-FE (React 마이그레이션)

Vanilla JS(MPA) → React(SPA) 마이그레이션 프로젝트. **같은 repo에서 인플레이스로 재작성**한다.
**학습 목적** — React의 상태·데이터 흐름을 직접 익히는 게 최우선. 코드 생산성보다 이해가 우선한다.

## 스택
- **Vite + React (JavaScript)** — TypeScript 아님
- **React Router** — SPA 클라이언트 라우팅
- **Tailwind v4** (`@tailwindcss/vite`) — 기존 `globals.css` 디자인 토큰 유지
- 서버 상태: **`useState` + `useEffect` 직접** (TanStack Query 등 데이터 라이브러리 미사용)

## ⚠️ AI 관여 수준 (반드시 준수)

영역마다 관여 수준이 다르다. **요청 없이 아래 "직접" 영역의 코드를 작성하지 말 것.**

- 🔴 **직접 구현 (코드 작성 금지 · 힌트/리뷰만)**
  - 상태 설계, 커스텀 훅(`useCursorPagination`·`useInfiniteScroll`·`useForm`)
  - `useEffect` 데이터 흐름, 낙관적 업데이트, `AuthContext` 설계
  - → "직접 짜볼게" 하면 **개념·힌트만**. 완성 후 요청 시 **리뷰만**.
- 🟢🟡 **초안 제공 OK**
  - 프로젝트 설정, `utils`/`constants` 이식, 문자열 템플릿 → JSX 변환
  - 라우팅·`Layout`·`Header` 보일러플레이트
  - → 초안 주되, 핵심 로직은 사용자가 이해할 수 있게 설명 동반

## 디렉토리
```
src/
├── api/        도메인별 API 함수 (컴포넌트에서 fetch 직접 호출 금지)
├── components/ 재사용 UI
├── pages/      라우트 단위 페이지
├── hooks/      커스텀 훅
├── contexts/   AuthContext, ToastContext, ConfirmContext
├── utils/      format · validation · image
└── constants/  config · httpStatus · messages
```

## 핵심 설계 원칙
- **파생 vs 상태**: 지금 값으로 계산되면 파생(`useState` 금지). 예) `hasMore`, `isOwner`, 폼 에러
- **controlled 입력**: 함께 제출하는 값은 부모(폼)가 소유, 입력 컴포넌트는 `value`/`onChange`만
- **상태 소유 위치**: 자식 안에서 완결되면 자식(`LikeButton`), 부모가 함께 쓰면 부모(`PostForm`)
- **훅 추출은 2번째 등장에서** — 미리 만들지 않는다
- **Context 얼굴은 처음부터** — `useAuth`·`useToast`·`useConfirm`
- **낙관적 업데이트**: `setState` 즉시 반영 → 실패 시 롤백

## 인증
- accessToken은 **메모리(모듈 변수)** 저장 — **localStorage 금지**
- refresh는 httpOnly 쿠키, `apiFetch`가 401 시 자동 재시도 (1회)
- 새로고침 시 `getMyInfo`로 `user` 복원 (`isAuthLoading` 동안 판정 보류)
- 인증 가드는 **`ProtectedRoute` 한 곳** — 페이지 상단 개별 가드 금지

## 하지 말 것
- localStorage에 토큰 저장
- DOM 직접 조작 (`getElementById`, `innerHTML`) — 상태 → 렌더로 표현
- 객체를 필드별 상태로 분해 (`post.title` 등은 `post` 하나로 관리)
- 페이지마다 `getMyInfo` 중복 호출 — `useAuth().user` 사용

## 컨벤션
- 컴포넌트 `PascalCase`, 훅 `useXxx`, 파일명은 컴포넌트명과 동일
- API 호출은 `api/` 도메인 함수 경유 (컴포넌트에서 `fetch` 직접 금지)
- 검증은 `utils/validation`의 순수 함수 재사용
