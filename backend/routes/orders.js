const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Counter = require('../models/Counter'); // Import model Counter
const { protect, admin } = require('../middleware/authMiddleware'); // Import cả admin

// Hàm helper để lấy số thứ tự tiếp theo
async function getNextSequenceValue(sequenceName) {
    const sequenceDocument = await Counter.findByIdAndUpdate(
        sequenceName,
        { $inc: { seq: 1 } }, // Tăng seq lên 1
        { new: true, upsert: true }
    );
    // Bắt đầu từ 1 (không cộng 1000)
    // Lần đầu chạy, seq là 1. Lần 2 là 2.
    return sequenceDocument.seq; 
}

// === TẠO ĐƠN HÀNG (USER) ===
/**
 * @route   POST /api/orders
 * @desc    Tạo đơn hàng nhận nuôi mới (trạng thái 'pending')
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    try {
        const { petDetails, adoptionMethod, selectedAddress, totalFee, shippingFee } = req.body;

        if (!petDetails || !adoptionMethod || totalFee === undefined) {
            return res.status(400).json({ message: 'Thiếu thông tin cần thiết để tạo đơn hàng' });
        }
        
        // 1. Lấy số thứ tự
        const nextOrderNum = await getNextSequenceValue('orderId');
        
        // 2. Tạo mã đơn hàng (ví dụ: ORD-000001)
        const orderCode = `ORD-${String(nextOrderNum).padStart(6, '0')}`;

        // 3. Tạo đơn hàng mới
        const order = new Order({
            orderCode: orderCode,
            user: req.user._id,
            pet: petDetails._id,
            petName: petDetails.name,
            // Sửa lại: Lấy ảnh từ mảng images
            petImage: (petDetails.images && petDetails.images.length > 0) ? `/images/${petDetails.images[0]}` : null,
            adoptionFee: petDetails.adoptionFee,
            shippingFee: shippingFee,
            totalFee: totalFee,
            adoptionMethod: adoptionMethod,
            shippingAddress: (adoptionMethod === 'delivery' && selectedAddress) ? {
                fullName: selectedAddress.fullName,
                phone: selectedAddress.phone,
                street: selectedAddress.street,
                ward: selectedAddress.ward, 
                district: selectedAddress.district,
                city: selectedAddress.city,
            } : null,
            status: 'pending', // Trạng thái ban đầu: chờ thanh toán
        });

        const createdOrder = await order.save();
        
        // 4. Trả về đơn hàng vừa tạo
        res.status(201).json(createdOrder);

    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng' });
    }
});

// === USER XÁC NHẬN THANH TOÁN ===
/**
 * @route   PUT /api/orders/:id/confirm-payment
 * @desc    Người dùng xác nhận đã thanh toán, chuyển trạng thái sang "processing"
 * @access  Private
 */
router.put('/:id/confirm-payment', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Không có quyền truy cập' });
        }
        if (order.status === 'pending') {
            order.status = 'processing'; // Chuyển sang 'Chờ xử lý'
            await order.save();
            res.json({ message: 'Đã xác nhận thanh toán, đơn hàng đang chờ xử lý.', order });
        } else {
            res.status(400).json({ message: `Đơn hàng đang ở trạng thái ${order.status}, không thể xác nhận.` });
        }

    } catch (error) {
       console.error("Lỗi khi xác nhận thanh toán:", error);
       res.status(500).json({ message: 'Lỗi server' });
    }
});


// ===========================================
// === API CHO ADMIN QUẢN LÝ ĐƠN HÀNG ===
// ===========================================

/**
 * @route   GET /api/orders
 * @desc    (Admin) Lấy tất cả đơn hàng
 * @access  Private/Admin
 */
router.get('/', protect, admin, async (req, res) => {
    try {
        // Sắp xếp đơn hàng mới nhất lên đầu, và populate tên user
        const orders = await Order.find({})
            .populate('user', 'name email phone') // Lấy thông tin user
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Lỗi lấy tất cả đơn hàng (Admin):", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Lấy chi tiết một đơn hàng
 * @access  Private (Cả user và admin đều có thể xem)
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email phone');
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        // Cho phép admin xem mọi đơn hàng, user chỉ xem được đơn hàng của mình
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Không có quyền truy cập đơn hàng này' });
        }

        res.json(order);
    } catch (error) {
        console.error("Lỗi lấy chi tiết đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


/**
 * @route   PUT /api/orders/:id
 * @desc    (Admin) Cập nhật đơn hàng (VD: đổi trạng thái, thêm ghi chú)
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        // Admin có thể cập nhật trạng thái, địa chỉ, hoặc các thông tin khác
        // Ví dụ: admin xác nhận thanh toán và chuyển sang 'completed'
        order.status = req.body.status || order.status;
        order.shippingAddress = req.body.shippingAddress || order.shippingAddress;
        // Thêm các trường admin có thể sửa ở đây
        
        // Ví dụ: Đánh dấu là đã thanh toán (nếu admin xác nhận)
        if (req.body.status === 'completed' && order.status !== 'completed') {
             // Logic khi đơn hàng hoàn thành, ví dụ: đánh dấu thú cưng là "đã nhận nuôi"
             // const pet = await Pet.findById(order.pet);
             // if (pet) {
             //    pet.status = 'adopted';
             //    await pet.save();
             // }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);

    } catch (error) {
         console.error("Lỗi cập nhật đơn hàng (Admin):", error);
         res.status(400).json({ message: 'Cập nhật thất bại', error: error.message });
    }
});

/**
 * @route   DELETE /api/orders/:id
 * @desc    (Admin) Xóa một đơn hàng
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, async (req, res) => {
     try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        
        await order.deleteOne(); // Dùng deleteOne() (hoặc remove() tùy phiên bản)
        res.json({ message: 'Đã xóa đơn hàng' });

    } catch (error) {
         console.error("Lỗi xóa đơn hàng (Admin):", error);
         res.status(500).json({ message: 'Lỗi server' });
    }
});


module.exports = router;
