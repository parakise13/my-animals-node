const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../models/animal");
const AWS = require("aws-sdk");

const s3bucket = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

// const fileUpload = multer({
//   limits: 500000,
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "uploads/images");
//     },
//     filename: (req, file, cb) => {
//       const ext = MIME_TYPE_MAP[file.mimetype];
//       cb(null, uuidv4() + "." + ext);
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     const isValid = !!MIME_TYPE_MAP[file.mimetype];
//     let error = isValid ? null : new Error("유효하지 않은 파일포맷입니다.");
//     cb(error, isValid);
//   },
// });

const fileUpload = multer({
  storage: multerS3({
    s3: s3bucket,
    bucket: process.env.S3_BUCKET_NAME,
    key: (req, file, cb) => {
      // const fileName = file.originalname.toLowerCase().split(" ").join("-");
      // cb(null, Date.now() + "-" + fileName);
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuidv4() + "." + ext);
    },
    acl: "public-read-write",
    limits: 500000,
    fileFilter: (req, file, cb) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype];
      let error = isValid ? null : new Error("유효하지 않은 파일포맷입니다.");
      cb(error, isValid);
    },
  }),
  // storage: multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null, "uploads/images");
  //   },
  //   filename: (req, file, cb) => {
  //     const ext = MIME_TYPE_MAP[file.mimetype];
  //     cb(null, uuidv4() + "." + ext);
  //   },
  // }),
});

// module.exports = fileUpload;
const upload = multer({ storage: fileUpload });
exports.upload = upload;
exports.s3bucket = s3bucket;
