const mongoose = require('mongoose');

// Định nghĩa cấu trúc (Schema) cho một "Pet" trong database
const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên không được để trống'],
        trim: true
    },
    species: {
        type: String,
        required: true,
        enum: ['dog', 'cat']
    },
    breed: {
        type: String,
        required: true,
    },
    age: String,
    gender: String,
    color: { // <-- TRƯỜNG MỚI
        type: String,
    },
    weight: { // <-- TRƯỜNG MỚI
        type: Number, // Sử dụng Number cho cân nặng
    },
    medicalHistory: { // <-- TRƯỜNG MỚI
        type: String,
        default: 'Không có',
    },
    description: {
        type: String,
        required: true,
    },
    vaccinated: {
        type: Boolean,
        default: false,
    },
    sterilized: {
        type: Boolean,
        default: false,
    },
    adoptionFee: {
        type: Number,
        required: true,
    },
    images: {
        type: [String],
        default: [],
    },
    requirements: { // <-- TRƯỜNG MỚI
        type: [String], // Mảng chứa các yêu cầu
        default: [],
    },
    status: {
        type: String,
        enum: ['available', 'pending', 'adopted'],
        default: 'available',
    },
    rescueDate: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;