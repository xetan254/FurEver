const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Article = require('../models/Article');
const { protect, admin } = require('../middleware/authMiddleware');

// Cấu hình Multer để lưu ảnh đại diện vào `public/images`
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images/'),
    filename: (req, file, cb) => cb(null, `article-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// --- CÁC API ENDPOINTS ---

/**
 * @route   GET /api/articles
 * @desc    Lấy tất cả bài viết
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find({}).sort({ createdAt: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' });
    }
});

/**
 * @route   GET /api/articles/:id
 * @desc    Lấy một bài viết theo ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (article) {
            res.json(article);
        } else {
            // Dùng status 404 khi không tìm thấy resource
            res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' });
    }
});
/**
 * @route   POST /api/articles
 * @desc    (Admin) Tạo bài viết mới
 * @access  Private/Admin
 */
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { title, content, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Ảnh đại diện là bắt buộc.' });
        }

        const newArticle = new Article({
            title,
            content,
            category,
            // CHỈ LƯU TÊN FILE: Giúp hệ thống nhất quán
            image: req.file.filename,
        });

        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);
    } catch (error) {
        console.error("LỖI KHI TẠO BÀI VIẾT:", error);
        res.status(400).json({ message: 'Dữ liệu không hợp lệ', error: error.message });
    }
});

/**
 * @route   PUT /api/articles/:id
 * @desc    (Admin) Cập nhật bài viết
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        const { title, content, category } = req.body;

        article.title = title || article.title;
        article.content = content || article.content;
        article.category = category || article.category;
        
        // Nếu có file ảnh mới, chỉ cập nhật tên file
        if (req.file) {
            article.image = req.file.filename;
        }
        
        const updatedArticle = await article.save();
        res.json(updatedArticle);
    } catch (error) {
        console.error("LỖI KHI CẬP NHẬT BÀI VIẾT:", error);
        res.status(400).json({ message: 'Dữ liệu không hợp lệ', error: error.message });
    }
});

/**
 * @route   DELETE /api/articles/:id
 * @desc    (Admin) Xóa bài viết
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }
        res.json({ message: 'Đã xóa bài viết' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' });
    }
});

module.exports = router;