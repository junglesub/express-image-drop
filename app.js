const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// EJS를 뷰 엔진으로 설정
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// URL-encoded 본문 파서 추가
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (업로드된 이미지 접근용)
// uploads 폴더 전체를 /uploads 경로로 제공
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const code = req.params.code; // URL 파라미터에서 코드 가져오기
    if (!code) {
      return cb(new Error("코드가 URL에 필요합니다."), false);
    }
    const uploadPath = path.join(__dirname, "uploads", code);
    // 해당 코드명의 폴더가 없으면 생성
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const customName = req.body.imageName;
    if (!customName) {
      return cb(new Error("이미지 이름이 필요합니다."), false);
    }
    const extension = path.extname(file.originalname);
    cb(null, `${customName.replace(/\\s+/g, "_")}${extension}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const code = req.params.code;
    const customName = req.body.imageName;
    if (!customName) {
      return cb(new Error("이미지 이름이 비어있습니다."));
    }
    if (!code) {
      return cb(new Error("코드가 URL에 필요합니다."));
    }
    const extension = path.extname(file.originalname);
    const filePath = path.join(
      __dirname,
      "uploads",
      code,
      `${customName.replace(/\\s+/g, "_")}${extension}`
    );
    if (fs.existsSync(filePath)) {
      return cb(new Error("동일한 이름의 파일이 이미 존재합니다."), false);
    }
    cb(null, true);
  },
});

// 루트 경로 - 임시 코드 입력 페이지
app.get("/", (req, res) => {
  res.render("index");
});

// 임시 코드 제출 처리
app.post("/enter-code", (req, res) => {
  const { tempCode } = req.body;
  if (!tempCode || tempCode.trim() === "") {
    return res.render("index", { error: "코드를 입력해주세요." });
  }
  // 코드를 사용하여 해당 폴더 뷰로 리디렉션
  res.redirect(`/folder/${tempCode.trim()}`);
});

// 특정 코드의 폴더 뷰 - 이미지 업로드 폼 및 파일 목록 표시
app.get("/folder/:code", (req, res) => {
  const code = req.params.code;
  const folderPath = path.join(__dirname, "uploads", code);

  fs.readdir(folderPath, (err, files) => {
    let imageFiles = [];
    if (err) {
      // 폴더가 존재하지 않거나 읽을 수 없는 경우 (첫 방문 시)
      if (err.code === "ENOENT") {
        // 폴더가 없으면 빈 배열로 진행 (업로드 시 생성됨)
        console.log(`폴더 없음: ${folderPath}, 새로 생성될 예정입니다.`);
      } else {
        console.error("폴더 읽기 오류:", err);
        // 다른 오류는 에러 페이지 또는 메시지로 처리 가능
        return res.status(500).send("폴더를 읽는 중 오류가 발생했습니다.");
      }
    } else {
      imageFiles = files
        .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file)) // 이미지 파일만 필터링
        .map((file) => ({
          name: file,
          url: `/uploads/${code}/${file}`, // 전체 URL 생성
        }));
    }
    res.render("upload", {
      code: code,
      images: imageFiles,
      error: null,
      message: null,
    });
  });
});

// 이미지 업로드 처리 (특정 코드 폴더)
app.post("/folder/:code/upload", (req, res) => {
  const code = req.params.code;

  upload.single("image")(req, res, function (err) {
    const folderPath = path.join(__dirname, "uploads", code);
    let imageFiles = [];
    try {
      const files = fs.readdirSync(folderPath);
      imageFiles = files
        .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
        .map((file) => ({
          name: file,
          url: `/uploads/${code}/${file}`,
        }));
    } catch (readError) {
      // 업로드 성공 후 폴더 읽기 실패 시 (거의 발생하지 않음)
      console.error("업로드 후 폴더 읽기 오류:", readError);
    }

    if (err) {
      return res.status(400).render("upload", {
        code: code,
        images: imageFiles, // 오류 발생 시에도 현재 파일 목록 전달
        error: err.message || "파일 업로드 중 오류가 발생했습니다.",
        message: null,
      });
    }

    if (!req.file) {
      return res.status(400).render("upload", {
        code: code,
        images: imageFiles, // 파일 미선택 시에도 현재 파일 목록 전달
        error: "이미지를 업로드해주세요.",
        message: null,
      });
    }
    // 업로드 성공 시 결과 페이지 렌더링
    res.render("result", {
      imageName: req.file.filename,
      code: code,
      imageUrl: `/uploads/${code}/${req.file.filename}`, // 전체 URL 전달
    });
  });
});

// 이미지 삭제 처리 (특정 코드 폴더의 특정 이미지)
app.delete("/folder/:code/delete/:imageName", (req, res) => {
  const code = req.params.code;
  const imageName = req.params.imageName;
  // URL 파라미터로 전달된 파일 이름이므로 decodeURIComponent를 사용합니다.
  const decodedImageName = decodeURIComponent(imageName);
  const filePath = path.join(__dirname, "uploads", code, decodedImageName);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("파일 삭제 오류:", filePath, err);
      // 클라이언트에는 좀 더 일반적인 오류 메시지를 보낼 수 있습니다.
      return res
        .status(500)
        .json({ success: false, error: "파일 삭제 중 오류가 발생했습니다." });
    }
    console.log("파일 삭제 성공:", filePath);
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
