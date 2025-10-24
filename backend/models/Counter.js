const mongoose = require('mongoose');

// Schema này dùng để lưu trữ số đếm tự động tăng
const counterSchema = mongoose.Schema({
    _id: { type: String, required: true }, // Tên của bộ đếm (ví dụ: 'orderId')
    seq: { type: Number, default: 0 }    // Giá trị số thứ tự hiện tại
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
