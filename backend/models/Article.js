const mongoose = require('mongoose');

// Định nghĩa cấu trúc cho một bài viết
const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true, // Tiêu đề là bắt buộc
            trim: true      // Xóa khoảng trắng thừa
        },
        content: {
            type: String,
            required: true // Nội dung là bắt buộc
        },
        category: {
            type: String,
            required: true,
            default: 'news' // Giá trị mặc định
        },
        image: {
            type: String, // Chúng ta sẽ lưu đường dẫn tới file ảnh
            required: true // Ảnh đại diện là bắt buộc
        }
    },
    {
        // Tự động thêm hai trường: createdAt và updatedAt
        timestamps: true
    }
);

// Tạo và export model 'Article'
module.exports = mongoose.model('Article', articleSchema);