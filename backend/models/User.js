const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Định nghĩa một schema con cho địa chỉ
const addressSchema = mongoose.Schema({
    fullName: { type: String, required: true },

    phone: { type: String, required: true },
    street: { type: String, required: true }, // Số nhà, tên đường
    ward: { type: String, required: true },   // Phường/Xã
    district: { type: String, required: true },// Quận/Huyện
    city: { type: String, required: true },    // Tỉnh/Thành phố
    isDefault: { type: Boolean, default: false }
});

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    avatarUrl: { type: String, default: null },
    password: { type: String, required: true },
    email: {
    type: String,
    required: true,
  },
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin'],
      default: 'user',
    },
     resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // Thêm trường danh sách địa chỉ
    addresses: [addressSchema]
  },
  {
    timestamps: true,
  }
);

// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// So sánh mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;