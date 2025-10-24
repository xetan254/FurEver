const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load data
const pets = require('./data/pets');

// Load Models
const Pet = require('./models/Pet');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

// Import data into DB
const importData = async () => {
  try {
    // Xóa dữ liệu cũ
    await Pet.deleteMany();

    // Thêm dữ liệu mới
    await Pet.insertMany(pets);

    console.log('Dữ liệu đã được thêm thành công!');
    process.exit();
  } catch (error) {
    console.error(`Lỗi: ${error}`);
    process.exit(1);
  }
};

// Destroy data from DB
const destroyData = async () => {
  try {
    await Pet.deleteMany();

    console.log('Dữ liệu đã được xóa thành công!');
    process.exit();
  } catch (error) {
    console.error(`Lỗi: ${error}`);
    process.exit(1);
  }
};

// Kiểm tra argument từ dòng lệnh
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}