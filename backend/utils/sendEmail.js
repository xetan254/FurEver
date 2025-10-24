// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // Ví dụ: smtp.gmail.com
        port: process.env.SMTP_PORT, // Ví dụ: 587 hoặc 465
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL, // Email của bạn
            pass: process.env.SMTP_PASSWORD, // Mật khẩu email hoặc App Password
        },
    });

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // Tên và email người gửi
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html // Có thể dùng HTML thay cho text
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;