// 1. Chuyển tất cả sang cú pháp CommonJS (require)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db.js');

// Import các file routes
const authRoutes = require('./routes/auth.js');
const petRoutes = require('./routes/pets.js');
const articleRoutes = require('./routes/articles.js');
const eventRoutes = require('./routes/events.js');
const uploadRoutes = require('./routes/uploadRoutes.js');
const userRoutes = require('./routes/users.js');
const orderRoutes = require('./routes/orders.js');

// Cấu hình và đọc các biến môi trường từ tệp .env
dotenv.config();

// Thực hiện kết nối tới cơ sở dữ liệu MongoDB
connectDB();

const app = express();

// Middleware (phần mềm trung gian)
app.use(cors());
app.use(express.json());



// Cấu hình để phục vụ các file tĩnh
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Định nghĩa các API Routes chính của ứng dụng
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Backend server đang chạy trên cổng ${PORT}`));