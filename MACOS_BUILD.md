# macOS 설치 파일 만들기

GitHub 저장소에 이 프로젝트를 올리면 `.github/workflows/build-macos.yml`이 macOS 14 빌드 환경에서 실행된다.

1. GitHub 저장소의 **Actions** 탭에서 **Build macOS installer**를 연다.
2. **Run workflow**를 누른다.
3. 완료된 실행 화면의 **Artifacts**에서 `Life-Flow-macOS-universal`을 내려받는다.

결과물에는 Apple Silicon과 Intel Mac 모두에서 실행되는 Universal `.app`과 `.dmg`가 들어 있다.

현재 워크플로는 테스트용 서명 없는 빌드다. 다른 사람에게 배포하려면 Apple Developer Program의 Developer ID 인증서로 코드 서명하고 Apple 공증을 추가해야 한다.
