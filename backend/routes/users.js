const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Cần để kiểm tra ObjectId hợp lệ
const User = require('../models/User'); // Import User model
const Order = require('../models/Order'); // <<--- !!! THAY ĐỔI: Import Order model của bạn
const { protect, admin } = require('../middleware/authMiddleware'); // Import middleware bảo vệ
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Để xóa file ảnh cũ nếu cần (tùy chọn)

// --- Cấu hình Multer cho Upload Ảnh Đại Diện ---
const avatarStorage = multer.diskStorage({
    destination(req, file, cb) {
        const dir = 'public/images/avatars/';
        // Tạo thư mục nếu chưa tồn tại
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename(req, file, cb) {
        // Tạo tên file duy nhất: userId-timestamp.ext
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

function checkAvatarFileType(file, cb) {
    const filetypes = /jpe?g|png|webp/; // Chỉ cho phép các định dạng ảnh phổ biến
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép tải lên ảnh (JPG, PNG, WEBP)!'));
    }
}

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: function(req, file, cb) {
        checkAvatarFileType(file, cb);
    },
     limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// ===========================================
// === API ENDPOINTS CHO QUẢN LÝ USER ===
// ===========================================

/**
 * @route   GET /api/users
 * @desc    (Admin) Lấy tất cả người dùng
 * @access  Private/Admin
 */
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' });
    }
});

/**
 * @route   GET /api/users/profile
 * @desc    Lấy thông tin profile của người dùng đang đăng nhập
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -addresses._id'); // Loại bỏ ID của subdocument address nếu không cần
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatarUrl: user.avatarUrl,
                isAdmin: user.role === 'admin', // Trả về isAdmin dựa trên role
                role: user.role,
                // Không trả về addresses ở đây, dùng endpoint riêng
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
    } catch (error) {
         console.error("Lỗi get profile:", error);
         res.status(500).json({ message: 'Lỗi server khi lấy profile' });
    }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Cập nhật thông tin profile (tên, điện thoại, email)
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const { name, phone, email } = req.body;

        // Kiểm tra trùng lặp email (nếu email thay đổi)
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email: email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email này đã được sử dụng' });
            }
            user.email = email;
        }

        // Kiểm tra trùng lặp số điện thoại (nếu phone thay đổi)
        if (phone && phone !== user.phone) {
            const phoneExists = await User.findOne({ phone: phone });
            if (phoneExists) {
                return res.status(400).json({ message: 'Số điện thoại này đã được sử dụng' });
            }
            user.phone = phone;
        }

        user.name = name || user.name; // Cập nhật tên nếu có

        const updatedUser = await user.save();
        res.json({ // Trả về thông tin đã cập nhật (không bao gồm password)
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            avatarUrl: updatedUser.avatarUrl,
            isAdmin: updatedUser.role === 'admin',
            role: updatedUser.role,
        });
    } catch (error) {
         console.error("Lỗi update profile:", error);
         // Bắt lỗi validation từ Mongoose (ví dụ: email không hợp lệ)
         if (error.name === 'ValidationError') {
             return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
         }
        res.status(400).json({ message: 'Cập nhật thất bại', error: error.message });
    }
});

/**
 * @route   POST /api/users/avatar
 * @desc    Upload ảnh đại diện mới
 * @access  Private
 */
router.post('/avatar', protect, uploadAvatar.single('avatarImage'), async (req, res) => {
    try {
         const user = await User.findById(req.user._id);
         if (!user) {
             return res.status(404).json({ message: 'Không tìm thấy người dùng' });
         }
         if (!req.file) {
              return res.status(400).json({ message: 'Không có file nào được tải lên' });
         }

         // Tạo đường dẫn URL tương đối chính xác (bỏ 'public')
         const relativePath = `/images/avatars/${req.file.filename}`;

         // (Tùy chọn) Xóa ảnh cũ trước khi lưu ảnh mới
         if (user.avatarUrl) {
            const oldPath = path.join(__dirname, '..', 'public', user.avatarUrl); // Đường dẫn tuyệt đối đến file cũ
             fs.unlink(oldPath, (err) => {
                if (err) console.error("Không thể xóa ảnh cũ:", oldPath, err);
             });
         }

         user.avatarUrl = relativePath;
         await user.save();

         res.status(200).json({
             message: 'Tải ảnh lên thành công',
             avatarUrl: relativePath // Trả về đường dẫn mới
         });

    } catch (error) {
        console.error("Lỗi upload avatar:", error);
         // Xử lý lỗi từ multer (file size, type)
         if (error instanceof multer.MulterError || error.message.includes('Chỉ cho phép tải lên ảnh')) {
             return res.status(400).json({ message: error.message });
         }
        res.status(500).json({ message: 'Lỗi server khi tải ảnh lên' });
    }
});

/**
 * @route   PUT /api/users/password
 * @desc    Đổi mật khẩu người dùng
 * @access  Private
 */
router.put('/password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới' });
    }
     if (newPassword.length < 6) {
         return res.status(400).json({ message: 'Mật khẩu mới cần ít nhất 6 ký tự' });
     }


    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        // Cập nhật mật khẩu mới (hook .pre('save') trong User model sẽ tự hash)
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công' });

    } catch (error) {
        console.error("Lỗi đổi mật khẩu:", error);
        res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu' });
    }
});


// ===========================================
// === API ENDPOINTS CHO QUẢN LÝ ĐỊA CHỈ ===
// ===========================================

/**
 * @route   GET /api/users/addresses
 * @desc    Lấy danh sách địa chỉ của người dùng
 * @access  Private
 */
router.get('/addresses', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('addresses');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.json(user.addresses || []); // Trả về mảng rỗng nếu chưa có địa chỉ
    } catch (error) {
         console.error("Lỗi lấy địa chỉ:", error);
         res.status(500).json({ message: 'Lỗi server khi lấy địa chỉ' });
    }
});

/**
 * @route   POST /api/users/addresses
 * @desc    Thêm địa chỉ mới
 * @access  Private
 */
router.post('/addresses', protect, async (req, res) => {
    const { fullName, phone, street, ward, district, city, isDefault } = req.body;

    // Validate input cơ bản
    if (!fullName || !phone || !street || !ward || !district || !city) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin địa chỉ' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Nếu địa chỉ mới là mặc định, unset các địa chỉ cũ
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        // Tạo địa chỉ mới
        const newAddress = { fullName, phone, street, ward, district, city, isDefault: isDefault || false }; // Đảm bảo isDefault là boolean

        // Nếu chưa có địa chỉ nào, đặt địa chỉ mới làm mặc định
        if (user.addresses.length === 0) {
            newAddress.isDefault = true;
        }

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json(user.addresses); // Trả về toàn bộ danh sách địa chỉ đã cập nhật

    } catch (error) {
        console.error("Lỗi thêm địa chỉ:", error);
        res.status(400).json({ message: 'Thêm địa chỉ thất bại', error: error.message });
    }
});

/**
 * @route   PUT /api/users/addresses/:id
 * @desc    Cập nhật địa chỉ theo ID
 * @access  Private
 */
router.put('/addresses/:id', protect, async (req, res) => {
    const { fullName, phone, street, ward, district, city, isDefault } = req.body;
    const addressId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
        return res.status(400).json({ message: 'ID địa chỉ không hợp lệ' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
        }

        // Nếu đặt địa chỉ này làm mặc định, unset các địa chỉ khác
        if (isDefault) {
            user.addresses.forEach((addr, index) => {
                if (index !== addressIndex) addr.isDefault = false;
            });
        }

        // Cập nhật thông tin địa chỉ
        const addressToUpdate = user.addresses[addressIndex];
        addressToUpdate.fullName = fullName || addressToUpdate.fullName;
        addressToUpdate.phone = phone || addressToUpdate.phone;
        addressToUpdate.street = street || addressToUpdate.street;
        addressToUpdate.ward = ward || addressToUpdate.ward;
        addressToUpdate.district = district || addressToUpdate.district;
        addressToUpdate.city = city || addressToUpdate.city;
        addressToUpdate.isDefault = isDefault !== undefined ? isDefault : addressToUpdate.isDefault;

        // Đảm bảo luôn có ít nhất 1 địa chỉ mặc định nếu có địa chỉ
        const hasDefault = user.addresses.some(addr => addr.isDefault);
        if (!hasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true; // Đặt cái đầu tiên làm mặc định nếu không có cái nào
        }


        await user.save();
        res.json(user.addresses);

    } catch (error) {
        console.error("Lỗi cập nhật địa chỉ:", error);
        res.status(400).json({ message: 'Cập nhật địa chỉ thất bại', error: error.message });
    }
});

/**
 * @route   DELETE /api/users/addresses/:id
 * @desc    Xóa địa chỉ theo ID
 * @access  Private
 */
router.delete('/addresses/:id', protect, async (req, res) => {
    const addressId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
        return res.status(400).json({ message: 'ID địa chỉ không hợp lệ' });
    }
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const initialLength = user.addresses.length;
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);

        if (user.addresses.length === initialLength) {
             return res.status(404).json({ message: 'Không tìm thấy địa chỉ để xóa' });
        }

        // Nếu địa chỉ bị xóa là mặc định, và còn địa chỉ khác, đặt cái đầu tiên làm mặc định
        const wasDefaultDeleted = !user.addresses.some(addr => addr.isDefault);
        if (wasDefaultDeleted && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json(user.addresses);

    } catch (error) {
        console.error("Lỗi xóa địa chỉ:", error);
        res.status(500).json({ message: 'Xóa địa chỉ thất bại', error: error.message });
    }
});

/**
 * @route   PUT /api/users/addresses/:id/default
 * @desc    Đặt địa chỉ làm mặc định
 * @access  Private
 */
router.put('/addresses/:id/default', protect, async (req, res) => {
    const addressId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
        return res.status(400).json({ message: 'ID địa chỉ không hợp lệ' });
    }
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        let found = false;
        user.addresses.forEach(addr => {
            if (addr._id.toString() === addressId) {
                addr.isDefault = true;
                found = true;
            } else {
                addr.isDefault = false;
            }
        });

        if (!found) {
             return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
        }

        await user.save();
        res.json(user.addresses);

    } catch (error) {
        console.error("Lỗi đặt địa chỉ mặc định:", error);
        res.status(500).json({ message: 'Đặt địa chỉ mặc định thất bại', error: error.message });
    }
});


// ===========================================
// === API ENDPOINT CHO LỊCH SỬ ĐƠN HÀNG ===
// ===========================================

/**
 * @route   GET /api/users/orders
 * @desc    Lấy lịch sử đơn hàng (nhận nuôi) của người dùng
 * @access  Private
 */
router.get('/orders', protect, async (req, res) => {
    try {
        // <<--- !!! CẦN MODEL Order CỦA BẠN Ở ĐÂY --- !!!
        // Giả sử model Order có trường 'user' chứa ID của người dùng
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        
        // Hoặc nếu bạn lưu thông tin đơn hàng trong user model (không khuyến khích)
        // const user = await User.findById(req.user._id).populate('orders'); // Nếu có ref 'orders'
        // const orders = user.orders;

        res.json(orders || []); // Trả về mảng rỗng nếu không có đơn hàng

    } catch (error) {
        console.error("Lỗi lấy lịch sử đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy lịch sử đơn hàng' });
    }
});


module.exports = router;
