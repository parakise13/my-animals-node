const express = require("express");
const bodyParser = require("body-parser");

const animalsRoutes = require("./routes/animals-routes");
const usersRoutes = require("./routes/users-routes");
const httpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/api/animals", animalsRoutes);
app.use("/api/users", usersRoutes);

// 어떤 router에서도 res를 못 받은 경우
app.use((req, res, next) => {
  const error = new httpError("경로를 찾을 수 없습니다.", 404);
  return next(error);
});

app.use((error, req, res, next) => {
  // 응답 헤더가 클라이언트에 전달되면 true 아니면 false
  if (res.headersSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "알 수 없는 에러가 발생하였습니다." });
});

app.listen(5000);
