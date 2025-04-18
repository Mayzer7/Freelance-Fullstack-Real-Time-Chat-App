import multer from "multer";

const storage = multer.memoryStorage(); // сохраняем файл в памяти

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // до 5MB
  },
});

export default upload;
