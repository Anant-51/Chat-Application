import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/assets"));
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, (err, bytes) => {
      if (err) {
        console.error("Error generating random bytes:", err);
        return cb(err, null);
      }
      const fileName = bytes.toString("hex") + path.extname(file.originalname);
      req.originalFileName = file.originalname;
      cb(null, fileName);
    });
  },
});
const allowedExt = [
  ".jpg",
  ".png",
  ".jpeg",
  ".webp",
  ".mp4",
  ".webm",
  ".mp3",
  ".wav",
  ".ogv",
  ".ogg",
  ".doc",
  ".docx",
  ".txt",
  ".pdf",
  ".zip",
];

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "video/ogg",
  "audio/ogg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/pdf",
  "application/zip",
];
const fileFilter = (req, file, cb) => {
  if (
    allowedExt.includes(path.extname(file.originalname)) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { filesize: 5 * 1024 * 1024 },
});
export default upload;
