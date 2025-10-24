const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Pet = require('../models/Pet');
const { protect, admin } = require('../middleware/authMiddleware');

// Cấu hình Multer để lưu trữ file ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/'); // Thư mục lưu ảnh
    },
    filename: function (req, file, cb) {
        // Tạo tên file duy nhất để tránh bị ghi đè
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Middleware của Multer, cập nhật để nhận một MẢNG ảnh (tối đa 10 ảnh)
// Tên trường phải là 'images' để khớp với FormData ở frontend
const upload = multer({ storage: storage });


// --- CÁC API ENDPOINTS ---

/**
 * @route   GET /api/pets
 * @desc    Lấy tất cả thú cưng
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const pets = await Pet.find({}).sort({ createdAt: -1 });
        res.json(pets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});

/**
 * @route   GET /api/pets/:id
 * @desc    Lấy chi tiết một thú cưng
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ msg: 'Không tìm thấy thú cưng' });
        }
        res.json(pet);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});


/**
 * @route   POST /api/pets
 * @desc    Thêm một thú cưng mới (hỗ trợ nhiều ảnh)
 * @access  Private/Admin
 */
router.post('/', protect, admin, upload.array('images', 10), async (req, res) => {
    try {
        const petData = { ...req.body };

        // req.files là một MẢNG các file đã được tải lên
        if (req.files && req.files.length > 0) {
            petData.images = req.files.map(file => file.filename);
        }

        // Xử lý chuỗi requirements từ form thành mảng
        if (petData.requirements && typeof petData.requirements === 'string') {
            petData.requirements = petData.requirements.split(',').map(item => item.trim()).filter(Boolean);
        }

        const newPet = new Pet(petData);
        const savedPet = await newPet.save();
        res.status(201).json(savedPet);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ message: 'Dữ liệu không hợp lệ', error: err.message });
    }
});

/**
 * @route   PUT /api/pets/:id
 * @desc    Cập nhật thông tin một thú cưng (hỗ trợ tải lại nhiều ảnh)
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, upload.array('images', 10), async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Nếu có ảnh mới được tải lên, nó sẽ THAY THẾ hoàn toàn mảng ảnh cũ
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => file.filename);
        }

        // Xử lý chuỗi requirements
        if (updateData.requirements && typeof updateData.requirements === 'string') {
            updateData.requirements = updateData.requirements.split(',').map(item => item.trim()).filter(Boolean);
        } else if (updateData.requirements === '') {
            updateData.requirements = [];
        }

        const pet = await Pet.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

        if (!pet) {
            return res.status(404).json({ msg: 'Không tìm thấy thú cưng' });
        }
        
        res.json(pet);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ message: 'Dữ liệu cập nhật không hợp lệ', error: err.message });
    }
});

/**
 * @route   DELETE /api/pets/:id
 * @desc    Xóa một thú cưng
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const pet = await Pet.findByIdAndDelete(req.params.id);
        if (!pet) {
            return res.status(404).json({ msg: 'Không tìm thấy thú cưng' });
        }
        res.json({ msg: 'Đã xóa thú cưng thành công' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
});

module.exports = router;
