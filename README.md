# Life Flow

Windows·macOS용 Tauri 데스크톱 앱. V4 실행 동작과 하루 전환까지 구현했으며, Windows에서 저장·종료·재실행을 확인했습니다. macOS 빌드와 실기기 검증은 남아 있습니다.

## 개발 실행

Node.js 22.12 이상, Rust stable, OS별 Tauri 빌드 도구가 필요합니다. Windows는 MSVC C++ 빌드 도구와 WebView2, macOS는 Xcode Command Line Tools가 필요합니다.

```sh
npm install
npm run desktop
```

Rust를 새로 설치했다면 터미널을 다시 열어 PATH를 반영하세요.

```sh
npm run build          # TypeScript 검사 및 화면 빌드
npm test               # 상태 전이·저장 큐·하루 경계·화면 통합 검증
npm run desktop:build  # 현재 OS용 데스크톱 빌드
```

`npm run dev`는 화면 개발 전용입니다. 제품 실행 및 네이티브 기능 검증에는 `npm run desktop`을 사용합니다. macOS 산출물은 macOS 환경에서 빌드·검증합니다.

## 현재 범위

- 고정 2×2 화면, 구간별 스크롤, 현재 시간대 표시
- Enter 연속 추가, 한글 조합 입력 보호, 100자·공백 검증
- 우클릭 이름 변경, Enter 저장·Esc/외부 클릭 취소
- 삭제 확인, 빈 상태, 긴 이름 말줄임 및 전체 이름 툴팁
- 단일 인스턴스 복원, 창 닫기 시 종료를 위한 Tauri 코드
- 카드 본문 드래그로 같은 블록 순서 변경 및 다른 블록 이동
- 빈 블록 드롭, 삽입 위치 표시, Esc·영역 밖 드롭 취소

- 하나의 현재 행동 선택, 완료·건너뜀 및 클릭으로 취소
- 완료 위치를 기준으로 다음 행동 테두리 제안, 자동 진행 없음
- 오전 6시 이후 하루 전환 질문과 이전 하루 계속하기
- 로컬 파일 자동 저장, 저장 오류 재시도, 종료 시 저장 완료 대기
- 손상 데이터 보호와 명시적 초기화

브라우저 미리보기는 저장하지 않습니다. 데스크톱 앱은 계획·순서·처리 상태를 저장하며, 현재 행동 선택은 재실행 시 비워집니다. 사용자가 제공한 `UI/VISUAL_DIRECTION.md`, `UI/MainUIRef.png`, UI 레이어와 글꼴을 기준으로 V6 첫 디자인을 적용했습니다. 화면 구조·카드·상태 요소에는 제공 PNG 레이어를 직접 사용합니다. 단계별 검토 기록은 `UI/VISUAL_IMPLEMENTATION.md`를 참고하세요.

## 저장 및 검증

Windows 저장 파일은 `%APPDATA%\com.lifeflow.desktop\flow.json`입니다. `flow.pending.json`은 저장 중간 파일이며 복원 대상이 아닙니다. 이전 날짜 기록은 별도로 보관하지 않습니다.

자동 테스트 46개와 Windows 디버그 빌드를 통과했습니다. 실제 앱에서 완료 후 파일 저장, 종료·재실행, 완료와 제안 복원, current 초기화를 확인했습니다. 설치 후 검증·macOS·실제 절전 복귀·양 OS IME 조합 검증은 남아 있습니다.

네이티브 개발 테스트는 디버그 빌드에만 적용되는 `LIFE_FLOW_TEST_DATA_DIR` 절대 경로로 저장 폴더를 분리할 수 있습니다. 릴리스 빌드는 이 환경 변수를 무시합니다. 테스트 데이터는 `.test-data/`에 두며 사용자 계획과 분리합니다.

## 참고

- https://v2.tauri.app/start/prerequisites/
- https://v2.tauri.app/start/frontend/vite/
- https://v2.tauri.app/plugin/single-instance/
- https://tailwindcss.com/docs/installation/using-vite


