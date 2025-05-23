const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// EJS를 뷰 엔진으로 설정
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 정적 파일 제공 (업로드된 이미지 접근용)
app.use(express.static(path.join(__dirname, "uploads")));

// Multer 설정 (파일 저장 위치 및 파일명 커스터마이징)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // 사용자가 입력한 파일 이름과 원본 확장자를 사용
    const customName = req.body.imageName;
    if (!customName) {
      // imageName이 없는 경우 원본 파일명을 사용 (오류 방지)
      // 또는 여기서 오류를 발생시킬 수도 있습니다.
      return cb(new Error("이미지 이름이 필요합니다."), false);
    }
    const extension = path.extname(file.originalname);
    cb(null, `${customName.replace(/\s+/g, "_")}${extension}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const customName = req.body.imageName;
    if (!customName) {
      return cb(new Error("이미지 이름이 비어있습니다."));
    }
    const extension = path.extname(file.originalname);
    const filePath = path.join(
      __dirname,
      "uploads",
      `${customName.replace(/\s+/g, "_")}${extension}`
    );
    if (fs.existsSync(filePath)) {
      // 파일이 이미 존재하면 업로드 거부
      return cb(new Error("이미 동일한 이름의 파일이 존재합니다."), false);
    }
    // 파일이 존재하지 않으면 업로드 허용
    cb(null, true);
  },
});

// 루트 경로 - 이미지 업로드 폼 표시
app.get("/", (req, res) => {
  res.render("upload");
});

// 이미지 업로드 처리
app.post("/upload", (req, res) => {
  upload.single("image")(req, res, function (err) {
    if (err) {
      // Multer 오류, fileFilter 오류 또는 기타 오류 처리
      // 오류 메시지와 함께 업로드 페이지를 다시 렌더링
      return res.status(400).render("upload", {
        error: err.message || "파일 업로드 중 오류가 발생했습니다.",
      });
    }

    if (!req.file) {
      // 파일이 없는 경우 오류 메시지와 함께 업로드 페이지를 다시 렌더링
      return res.status(400).render("upload", {
        error: "이미지를 업로드해주세요.",
      });
    }
    // 업로드 성공 시, 업로드된 파일명과 함께 결과 페이지 렌더링
    // 클라이언트 사이드에서 localStorage에 저장할 수 있도록 파일명을 전달
    res.render("result", { imageName: req.file.filename });
  });
});

// '/파일이름' 경로로 이미지 직접 접근
// 이 부분은 express.static 미들웨어가 처리하므로 별도 라우트 필요 없음

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
