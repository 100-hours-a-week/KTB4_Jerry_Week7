# 💬 TalkTalk — Front-end

## Front-end 소개

자유로운 주제로 글을 쓰고, 댓글로 소통하며, **실시간 1:1 채팅**으로 대화하는 커뮤니티 프로젝트입니다.

- **React 19 + Vite** 로 구현한 **SPA** 이며, 라우팅은 **React Router 7** 로 구성했습니다.
- 순수 **VanillaJS(MPA)** 로 시작한 프로젝트를 **React(SPA)로 마이그레이션**하며, 컴포넌트 재사용·전역 상태·선언적 렌더링 구조로 재설계했습니다.
- 초기 화면부터 기능, 백엔드 연결(REST + **STOMP over WebSocket 실시간 채팅**)까지 직접 구현했습니다.
- 상태는 **Context**(인증·토스트·확인 모달·채팅 소켓)와 **커스텀 훅**(커서 페이지네이션·무한 스크롤)으로 나누어 관리합니다.

## 개발 인원 및 기간

- **개발 기간** : 2026-05-26 ~ 2026-08-09
- **개발 인원** : 프론트엔드/백엔드 1명 (본인)

## 사용 기술 및 tools

| 구분                | 기술                                        |
| ------------------- | ------------------------------------------- |
| Language            | JavaScript                                  |
| Library / Framework | React 19, React Router 7                    |
| Build               | Vite 6, pnpm                                |
| Styling             | Tailwind CSS 4                              |
| Realtime            | STOMP over WebSocket (`@stomp/stompjs`)     |
| State               | React Context, Custom Hooks                 |
| Infra               | Docker (멀티스테이지 빌드), Nginx 정적 서빙 |

## Back-end

- **Back-end Github** : https://github.com/100-hours-a-week/KTB4_Jerry_Week4

## 서비스 시연 영상

- `<!-- 시연 영상 링크(구글 드라이브 등) 채우기 -->`

## 폴더 구조

<details>
<summary>폴더 구조 보기/숨기기</summary>

```
src
├── App.jsx
├── main.jsx
├── api
│   ├── client.js
│   ├── auth.js  user.js  post.js  comment.js  image.js  chat.js
├── components
│   ├── Layout.jsx  Header.jsx
│   ├── ProtectedRoute.jsx  PublicRoute.jsx
│   ├── PostCard.jsx  PostBody.jsx  PostActions.jsx  PostImageCarousel.jsx
│   ├── LikeButton.jsx  ImagePreview.jsx  AuthorTrigger.jsx
│   ├── CommentSection.jsx  CommentItem.jsx  CommentForm.jsx
│   ├── ReplyItem.jsx  ReplyComposer.jsx
│   ├── ChatRoomHeader.jsx  RoomListItem.jsx  MessageBubble.jsx  MessageComposer.jsx
│   └── icons
├── pages
│   ├── LoginPage.jsx  SignupPage.jsx
│   ├── PostListPage.jsx  PostDetailPage.jsx
│   ├── MakePostPage.jsx  EditPostPage.jsx
│   ├── EditProfilePage.jsx  EditPasswordPage.jsx
│   └── ChatListPage.jsx  ChatRoomPage.jsx
├── contexts
│   ├── AuthContext.jsx
│   ├── ChatSocketContext.jsx
│   ├── ToastContext.jsx  ConfirmContext.jsx  ProfileModalContext.jsx
├── hooks
│   ├── useCursorPagination.js
│   ├── useInfiniteScroll.js
│   └── useOutsideClick.js
├── constants
├── utils
└── styles/globals.css
```

</details>

## 서비스 화면

### 인증

|                      로그인                      |                     회원가입                      |
| :----------------------------------------------: | :-----------------------------------------------: |
| <img src="docs/screens/login.png" width="320" /> | <img src="docs/screens/signup.png" width="320" /> |

### 게시글 목록

|              게시글 목록 (무한 스크롤)               |
| :--------------------------------------------------: |
| <img src="docs/screens/post-list.png" width="360" /> |

### 게시글 작성 / 상세 / 수정 / 삭제

|                      게시글 작성                       |                      게시글 상세                       |                     게시글 수정                      |                      게시글 삭제                       |
| :----------------------------------------------------: | :----------------------------------------------------: | :--------------------------------------------------: | :----------------------------------------------------: |
| <img src="docs/screens/post-create.png" width="220" /> | <img src="docs/screens/post-detail.png" width="220" /> | <img src="docs/screens/post-edit.png" width="220" /> | <img src="docs/screens/post-delete.png" width="220" /> |

### 댓글 / 대댓글

|                        댓글 목록                        |                         댓글 등록                         |                        댓글 수정                        |                         댓글 삭제                         |
| :-----------------------------------------------------: | :-------------------------------------------------------: | :-----------------------------------------------------: | :-------------------------------------------------------: |
| <img src="docs/screens/comment-list.png" width="220" /> | <img src="docs/screens/comment-create.png" width="220" /> | <img src="docs/screens/comment-edit.png" width="220" /> | <img src="docs/screens/comment-delete.png" width="220" /> |

### 실시간 채팅

|                     채팅방 목록                      |                      채팅방 상세                      |
| :--------------------------------------------------: | :--------------------------------------------------: |
| <img src="docs/screens/chat-list.png" width="320" /> | <img src="docs/screens/chat-room.png" width="320" /> |

### 프로필 수정 / 비밀번호 수정 / 회원 탈퇴 / 로그아웃

|                       프로필 수정                       |                      비밀번호 수정                       |                      회원 탈퇴                      |                     로그아웃                      |
| :-----------------------------------------------------: | :------------------------------------------------------: | :-------------------------------------------------: | :-----------------------------------------------: |
| <img src="docs/screens/profile-edit.png" width="220" /> | <img src="docs/screens/password-edit.png" width="220" /> | <img src="docs/screens/withdraw.png" width="220" /> | <img src="docs/screens/logout.png" width="220" /> |

## 트러블 슈팅

### 1. 훅 규칙 위반으로 로그인 페이지가 흰 화면이 되던 문제

**증상** — 로그인한 적 있는 브라우저로 `/login` 에 바로 들어가면 첫 렌더는 통과하지만, 곧바로 흰 화면만 남았습니다. 리프레시 토큰 수명이 길어 이 조건이 오래 유지됐습니다.

**원인** — 로그인·회원가입 페이지가 `useState` 선언보다 **위에서** `isAuthenticated` 이면 `<Navigate />` 를 early return 하고 있었습니다. `AuthContext` 가 유저를 복원한 직후 리렌더에서 실행되는 훅의 개수가 달라졌고(React는 렌더마다 훅의 순서·개수가 같아야 함), 에러 경계가 없어 화면이 그대로 날아갔습니다.

**해결** — early return 을 훅 아래로 내리는 임시 수정 대신, `ProtectedRoute` 의 짝인 **`PublicRoute`** 로 로그인·회원가입을 감싸 **분기 자체를 컴포넌트 바깥으로** 옮겼습니다. 조건이 "훅을 건너뛸지"가 아니라 "컴포넌트를 마운트할지"를 결정하게 되어, 훅 규칙 위반이 구조적으로 발생할 수 없게 됐습니다.

```jsx
<Route element={<PublicRoute />}>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />
</Route>
```

### 2. 요청 실패를 "빈 성공"으로 처리해 무한 스크롤이 사라지던 문제

**증상** — 목록·댓글·대댓글에서 네트워크 요청이 한 번 실패하면 무한 스크롤과 "더보기" 버튼이 영영 사라졌습니다.

**원인** — `fetchPage` 가 실패를 예외로 던지지 않고 `items: []`, `next_cursor: null` 로 바꿔 반환하고 있었습니다. 호출부는 이를 **데이터가 없는 정상 응답**으로 오해해 `cursor` 를 `null` 로 확정했고, 그 순간 다음 페이지를 부를 수단이 사라졌습니다. VanillaJS 시절에는 실패해도 커서를 유지하고 버튼을 다시 활성화해 재시도할 수 있었는데, 오히려 동작이 후퇴한 것입니다.

**해결** — 실패를 빈 성공으로 감추지 않고 **에러로 구분**해 던지도록 바꿨습니다. 실패 시 커서를 유지하고 **재시도 버튼**을 남겨, 다시 시도할 수단을 보존했습니다.

### 3. 리프레시 실패가 전역에 전파되지 않아 생긴 "유령 로그인" 상태

**증상** — 세션이 만료됐는데도 헤더는 로그인 상태로 보이고, 목록은 비어 있고 상세 페이지는 튕기는 상태가 계속됐습니다.

**원인** — `apiFetch` 가 refresh 재시도까지 실패하면 `401` 을 그대로 반환할 뿐, 이를 받아 처리하는 곳이 없었습니다. **세션 만료를 아는 주체(`apiFetch`)** 와 **유저를 소유한 주체(`AuthContext`)** 가 분리돼 있어, 유저 상태만 남아 화면이 어긋난 것입니다.

**해결** — 리프레시 실패를 `AuthContext` 에 알려 **user 를 비우는 경로**를 연결했습니다. user 가 비면 `ProtectedRoute` 가 로그인 페이지로 보내, 만료가 화면 전체에 일관되게 반영되도록 했습니다.

### 4. Context value 리터럴로 인한 불필요한 리렌더링

**증상** — 토스트가 떴다가 2초 뒤 사라질 때마다, 토스트와 무관한 컴포넌트들까지 다시 렌더됐습니다.

**원인** — `showToast`·`confirm` 함수는 `useCallback` 으로 안정화돼 있었지만, 정작 **provider 에 넘기는 `value` 객체 리터럴이 매 렌더마다 새로 생성**되고 있었습니다. provider 는 자기 상태가 바뀔 때마다 리렌더되고, 그때마다 새 `value` 참조가 전파되어 해당 Context 구독자 전부가 리렌더된 것입니다. `AuthContext` 는 `login`·`logout`·`updateUser` 의 `useCallback` 조차 빠져 있었습니다.

**해결** — `value` 를 **`useMemo`** 로 묶어 참조를 유지하고, Context 가 내려주는 함수들을 **`useCallback`** 으로 고정했습니다. React DevTools Profiler 로 토스트 전후 리렌더 범위가 줄어든 것을 확인했습니다.

## 프로젝트 후기

이 프로젝트는 순수 **VanillaJS 로 만든 MPA** 에서 출발했습니다. 훅도 컴포넌트도 없이 페이지마다 독립된 HTML 이 자기 스크립트를 불러오고, 상태가 바뀔 때마다 어떤 DOM 을 어떻게 바꿀지 직접 지시하는 구조였습니다. 헤더·모달·프로필 드롭다운 같은 공통 요소를 여러 파일에 반복해 적으면서 **컴포넌트의 필요성**을 몸으로 느꼈고, 함수가 HTML 을 반환하도록 분리해 재사용하는 리팩터링을 거치며 JavaScript 의 동작 원리를 익혔습니다.

React 로 마이그레이션하며 가장 먼저 깨달은 것은, 그동안 **새로고침이 상태 관리자 역할을 대신하고 있었다**는 점이었습니다. MPA 에서 페이지 이동은 곧 전체 새로고침이라 브라우저가 모든 것을 초기화해 줬는데, SPA로 오자 그 위에 얹혀 있던 문제들이 드러났습니다. 6개 페이지에서 각각 호출하던 `mountHeader()` 는 `Layout` 의 `<Outlet />` 구조로 바뀌어 헤더가 앱에서 한 번만 렌더되도록 정리됐고, 페이지마다 흩어져 있던 인증 가드는 `ProtectedRoute` 한 곳으로 모였습니다. 이참에 액세스 토큰도 로컬 스토리지에서 **메모리**로 옮겼습니다. 새로고침으로 날아가도 refresh 로 다시 받아오면 되니, 보안과 맞바꿔 가며 저장할 이유가 없다고 판단했습니다.

구조를 옮긴 뒤에는 **React 식으로 상태와 컴포넌트를 다시 설계**하는 과정을 거쳤습니다. "무엇을 state 로 둘 것인가"를 고민하며 `hasMore` 처럼 다른 값에서 파생되는 것은 상태에서 제외했고, 게시글 상세 페이지에 뭉쳐 있던 변수들을 **그 값을 필요로 하는 모두의 가장 낮은 공통 조상** 컴포넌트로 흩어지게 나눴습니다. 커서 페이지네이션이 세 곳에서 반복되던 것은 `useCursorPagination` 커스텀 훅으로 뽑아, 무한 스크롤이냐 더보기 버튼이냐가 아니라 **데이터 로직을 기준**으로 재사용 단위를 잡았습니다.

돌아보면 가장 큰 배움은 **실패 경로와 리렌더링을 의식하게 된 것**이었습니다. 처음에는 성공하는 경우만 보고 구현·테스트했는데, 받은 피드백의 상당수가 요청 실패·세션 만료·에러 상태 같은 "잘 안 될 때"를 다루고 있었습니다(트러블 슈팅 2·3번). 리렌더링 역시 "어디서 왜 일어나는가"를 의식하지 못하다가 Context value 문제를 파고들며 감을 잡았습니다(4번). 앞으로도 잘 되는 경우만이 아니라 **어긋나는 경우까지 설계에 포함하는 습관**을 이어가려 합니다.
