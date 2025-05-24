# Express Image Drop (익스프레스 이미지드롭)

**Express Image Drop**(익스프레스 이미지드롭)은 사용자가 임시 코드를 생성하거나 입력하여 해당 코드에 해당하는 전용 폴더에 이미지를 업로드, 조회, 다운로드 및 삭제할 수 있는 간단한 웹 애플리케이션입니다. 각 사용자는 자신만의 코드(폴더)를 통해 파일을 관리할 수 있습니다.

## 주요 기능

- **임시 코드 기반 폴더**: 사용자는 임의의 코드를 입력하여 해당 코드명으로 된 폴더에 접근합니다.
- **이미지 업로드**: 지정된 코드(폴더) 내에 이미지를 업로드할 수 있습니다.
  - 사용자 정의 파일명 사용 (공백은 밑줄로 대체)
  - 동일 이름 파일 존재 시 업로드 방지
- **이미지 목록 조회**: 해당 코드(폴더)에 업로드된 이미지 목록을 보여줍니다.
- **이미지 다운로드**: 목록에서 이미지를 클릭하면 바로 다운로드됩니다.
- **이미지 삭제**: 목록에서 각 이미지를 삭제할 수 있는 버튼을 제공합니다.
- **전체 URL 제공**: 업로드된 이미지에 접근할 수 있는 전체 URL (`/uploads/코드/파일명`)을 제공합니다.
- **Docker 지원**: `Dockerfile` 및 `docker-compose.yml`을 통해 쉽게 컨테이너 환경에서 실행할 수 있습니다.
- **모바일 친화적 UI**: 기본적인 모바일 환경을 고려한 UI를 제공합니다.

## 기술 스택

- **백엔드**: Node.js, Express.js
- **템플릿 엔진**: EJS (Embedded JavaScript templates)
- **파일 업로드 처리**: Multer
- **기타**: `fs` (File System), `path`

## 설정 및 실행 방법

### 1. 로컬 환경에서 직접 실행

**요구 사항**: Node.js 및 npm (또는 yarn) 설치

1.  **저장소 복제 (Clone Repository)** (이미 프로젝트가 있다면 생략):

    ```bash
    # git clone <repository-url>
    # cd filebe
    ```

2.  **의존성 설치 (Install Dependencies)**:

    ```bash
    npm install
    ```

3.  **애플리케이션 실행 (Run Application)**:

    ```bash
    node app.js
    # 또는 package.json에 start 스크립트가 정의되어 있다면:
    # npm start
    ```

    서버는 기본적으로 `http://localhost:3000` 에서 실행됩니다.

4.  **애플리케이션 접속**:
    웹 브라우저를 열고 `http://localhost:3000` 으로 접속합니다.

### 2. Docker를 사용하여 실행

**요구 사항**: Docker 및 Docker Compose 설치

1.  **저장소 복제 (Clone Repository)**: (이미 프로젝트가 있고 Docker 파일들이 있다면 생략)

    ```bash
    # git clone <repository-url>
    # cd filebe
    ```

2.  **Docker 이미지 빌드 및 컨테이너 실행 (Build and Run with Docker Compose)**:

    ```bash
    docker-compose up --build
    ```

    이 명령어는 `Dockerfile`을 사용하여 이미지를 빌드하고, `docker-compose.yml` 설정에 따라 컨테이너를 실행합니다. `-d` 옵션을 추가하면 백그라운드에서 실행됩니다 (`docker-compose up --build -d`).

3.  **애플리케이션 접속**:
    웹 브라우저를 열고 `http://localhost:3000` 으로 접속합니다. `uploads` 폴더는 호스트의 `./uploads` 디렉토리와 바인드 마운트되어 데이터가 유지됩니다.

4.  **Docker 컨테이너 중지**:
    ```bash
    docker-compose down
    ```

## 폴더 구조

```
filebe/
├── uploads/            # 업로드된 이미지들이 코드별 하위 폴더에 저장되는 공간
│   └── [임시코드]/
│       └── example.png
├── views/              # EJS 템플릿 파일
│   ├── index.ejs       # 임시 코드 입력 페이지
│   ├── upload.ejs      # 이미지 업로드 및 목록 조회 페이지
│   └── result.ejs      # 업로드 결과 페이지
├── app.js              # Express 애플리케이션 로직
├── package.json        # 프로젝트 메타데이터 및 의존성
├── Dockerfile          # Docker 이미지 생성을 위한 설정 파일
├── docker-compose.yml  # Docker Compose 실행을 위한 설정 파일
├── LICENSE             # 프로젝트 라이선스 (Unlicense)
└── README.md           # 프로젝트 설명 파일 (현재 파일)
```

## 사용 방법

1.  애플리케이션에 처음 접속하면 임시 코드를 입력하는 페이지가 나타납니다.
2.  원하는 코드를 입력하고 "입장" 버튼을 누릅니다. (예: `mysecretfolder`)
3.  해당 코드의 이미지 업로드 페이지로 이동합니다.
    - "이미지 이름"을 입력하고 (확장자 제외)
    - "이미지 파일"을 선택한 후 "업로드" 버튼을 누릅니다.
4.  업로드 성공 시 결과 페이지가 나타나며, 업로드된 이미지와 URL을 확인할 수 있습니다.
5.  "업로드 페이지로 돌아가기" 버튼을 누르면 현재 코드의 업로드 페이지로 돌아가며, 방금 업로드한 이미지를 포함한 목록을 볼 수 있습니다.
6.  이미지 목록에서 파일명을 클릭하면 다운로드할 수 있고, "삭제" 버튼을 누르면 해당 이미지를 서버에서 삭제할 수 있습니다.
7.  다른 코드를 사용하고 싶으면 "처음으로" 버튼을 눌러 임시 코드 입력 페이지로 돌아갑니다.

---

라이선스: [The Unlicense](LICENSE) — 누구나 자유롭게 사용, 수정, 배포할 수 있습니다.
