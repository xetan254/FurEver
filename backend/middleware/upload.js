const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu trữ và tên file
const storage = multer.diskStorage({
    // Nơi file sẽ được lưu
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Thư mục 'uploads'
    },
    // Tạo tên file mới để tránh trùng lặp
    filename: function (req, file, cb) {
        // Tên file mới sẽ là: <ngày-tháng-năm>-<tên-file-gốc>
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Kiểm tra loại file, chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Chấp nhận file
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh!'), false); // Từ chối file
    }
};

// Khởi tạo multer với cấu hình đã tạo
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Giới hạn kích thước file 5MB
});

module.exports = upload;