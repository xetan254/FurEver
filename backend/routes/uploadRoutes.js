const express = require('express');        // Thay import bằng require
const multer = require('multer');          // Thay import bằng require
const path = require('path');              // Thay import bằng require

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  if (req.file) {
    res.status(200).send(`/${req.file.path.replace(/\\/g, "/")}`);
  } else {
    res.status(400).send('Không có file nào được tải lên.');
  }
});

module.exports = router; // Dòng này bây giờ sẽ hoạt động chính xác