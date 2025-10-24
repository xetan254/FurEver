const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail'); // Import hàm gửi email
const crypto = require('crypto');
// Hàm tạo token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

router.post('/pre-register', async (req, res) => {
    const { name, phone, email, password } = req.body;

    try {
        // Kiểm tra xem phone hoặc email đã tồn tại chưa
        const userExists = await User.findOne({ $or: [{ phone }] });
        if (userExists) {
            return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
        }

        // Tạo token tạm thời chứa thông tin đăng ký, hết hạn sau 10 phút
        const registrationToken = jwt.sign(
            { name, phone, email, password },
            process.env.JWT_SECRET, 
            { expiresIn: '10m' }
        );

        // Tạo link xác thực
        const confirmationUrl = `http://localhost:3000/confirm-signup/${registrationToken}`;

        const message = `
            Chào bạn,
            Vui lòng nhấp vào liên kết bên dưới để hoàn tất đăng ký tài khoản của bạn.
            Liên kết này chỉ có hiệu lực trong 10 phút.
            
            ${confirmationUrl}
            
            Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.
        `;

        // Gửi email
        await sendEmail({
            email: email,
            subject: 'Xác thực đăng ký tài khoản',
            message,
        });

        res.status(200).json({ message: 'Email xác thực đã được gửi. Vui lòng kiểm tra hộp thư của bạn.' });

    } catch (error) {
        console.error('Pre-register error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// ROUTE 2: XÁC THỰC TOKEN VÀ TẠO TÀI KHOẢN
router.post('/verify-and-register', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Không có token xác thực' });
    }

    try {
        // Giải mã token để lấy thông tin
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { name, phone, email, password } = decoded;

        // Kiểm tra lại lần nữa để chắc chắn
        const userExists = await User.findOne({ $or: [{ phone }] });
        if (userExists) {
            return res.status(400).json({ message: 'Số điện thoại đã được đăng ký' });
        }

        // Tạo người dùng mới trong database
        const user = await User.create({ name, phone, email, password });

        if (user) {
            // Trả về thông tin và token đăng nhập
            res.status(201).json({
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
            });
        } else {
            res.status(400).json({ message: 'Không thể tạo người dùng' });
        }
    } catch (error) {
        // Nếu token sai hoặc hết hạn, jwt.verify sẽ báo lỗi
        console.error('Verify and register error:', error);
        res.status(400).json({ message: 'Đăng kí thành công' });
    }
});

// POST /api/auth/login - Đăng nhập
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email : user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Số điện thoại hoặc mật khẩu không hợp lệ' });
  }
});

router.post('/forgotpassword', async (req, res) => {
  const { phone } = req.body; // Assuming users identify by phone for login/reset

  try {
    const user = await User.findOne({ phone });

    // IMPORTANT: Always send a success-like response, even if user not found,
    // to prevent attackers from guessing which phones are registered.
    if (!user) {
      console.log(`Password reset requested for non-existent phone: ${phone}`);
      return res.json({ message: 'Nếu số điện thoại này tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' });
    }

    // --- Generate Token ---
    const resetToken = crypto.randomBytes(20).toString('hex');

    // --- Hash token and set expiry (e.g., 1 hour) ---
    // Storing the hash is slightly more secure if DB is compromised, but storing plain is often simpler.
    // Choose one approach. Here we store plain for simplicity.
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in milliseconds

    await user.save();

    // --- Send Email ---
    // Replace with your actual frontend URL
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`; 

    const message = `
      Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
      Vui lòng nhấp vào liên kết sau hoặc dán vào trình duyệt để hoàn tất quá trình (liên kết có hiệu lực trong 1 giờ):
      \n\n
      ${resetUrl}
      \n\n
      Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.
    `;

    try {
      // Find user email if needed (assuming email is stored, otherwise adapt to send SMS if possible)
      // This part needs adjustment based on whether you store emails or rely solely on phone
      const userEmail = user.email; // ASSUMPTION: You have an email field in your User model
       if (!userEmail) {
           console.error(`User with phone ${phone} has no associated email.`);
           // Handle this case: maybe log it, or inform the user differently if possible.
           // For now, we still return the generic success message.
            return res.json({ message: 'Nếu số điện thoại này tồn tại trong hệ thống và có liên kết email, bạn sẽ nhận được hướng dẫn.' });
       }

      await sendEmail({
        email: userEmail,
        subject: 'Yêu cầu đặt lại mật khẩu',
        message,
      });

      console.log(`Password reset email sent to user associated with phone: ${phone}`);
      res.json({ message: 'Nếu số điện thoại này tồn tại trong hệ thống và có liên kết email, bạn sẽ nhận được hướng dẫn.' });

    } catch (err) {
      console.error('Error sending password reset email:', err);
      // Clear token if email fails to prevent unusable tokens
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res.status(500).json({ message: 'Lỗi khi gửi email. Vui lòng thử lại.' });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
});


/**
 * @route   PUT /api/users/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
router.put('/reset-password/:token', async (req, res) => {
  const resetPasswordToken = req.params.token;
  const { password } = req.body;

  if (!password) {
      return res.status(400).json({ message: 'Vui lòng nhập mật khẩu mới.' });
  }

  try {
    // Find user by the token AND check if it hasn't expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }, // Check if expiry date is greater than now
    });

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    // --- Set new password ---
    user.password = password; // Hashing will be done by pre('save') hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Optionally: Log the user in automatically or send a confirmation email
    // For simplicity, we just confirm success.

    res.json({ message: 'Đặt lại mật khẩu thành công!' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
});

module.exports = router;
