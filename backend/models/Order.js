const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
    {
        // Mã đơn hàng tùy chỉnh (ví dụ: ORD-0001)
        orderCode: {
            type: String,
            required: true,
            unique: true, // Đảm bảo mã đơn hàng là duy nhất
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        pet: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Pet',
        },
        petName: { type: String, required: true },
        petImage: { type: String }, // Đường dẫn tương đối của ảnh pet
        adoptionFee: { type: Number, required: true, default: 0 },
        shippingFee: { type: Number, required: true, default: 0 },
        totalFee: { type: Number, required: true, default: 0 },
        
        adoptionMethod: { type: String, required: true, enum: ['direct', 'delivery'] },
        
        // Lưu lại thông tin địa chỉ tại thời điểm đặt hàng
        shippingAddress: {
            fullName: { type: String },
            phone: { type: String },
            street: { type: String },
            ward: { type: String },
            district: { type: String },
            city: { type: String },
        },
        
        status: {
            type: String,
            required: true,
            default: 'pending', // Trạng thái 'chờ thanh toán'
            enum: ['pending', 'processing', 'completed', 'cancelled','shipping'],
        },
        // Thêm các trường khác nếu cần, ví dụ: paymentMethod, isPaid...
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

