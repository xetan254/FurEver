import React, { useState } from 'react';
import axios from 'axios';
// Gợi ý: Đảm bảo bạn đã import file CSS cho component này
// import './ForgotPassword.css'; 

const ForgotPasswordPage = () => {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            // SỬA LỖI: Backend của bạn mong đợi một key là 'phone'
            const { data } = await axios.post('http://localhost:5000/api/auth/forgotpassword', { phone: emailOrPhone });
            setMessage(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };
    
    // Hàm xử lý khi người dùng nhập liệu
    const handleInputChange = (e) => {
        setEmailOrPhone(e.target.value);
        // Xóa thông báo lỗi/thành công cũ khi người dùng bắt đầu nhập lại
        if (error) setError('');
        if (message) setMessage('');
    };

    return (
        // Các className này cần được định nghĩa trong file CSS của bạn
        <div className="forget-password-container">
            <h2 className="heading-h32">
                Quên Mật khẩu
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label 
                        htmlFor="emailOrPhone" 
                        className="paragraph-p3"
                    >
                        Nhập số điện thoại đã đăng ký:
                    </label>
                    <input
                        type="text"
                        id="emailOrPhone"
                        value={emailOrPhone}
                        onChange={handleInputChange} // Cải thiện UX
                        placeholder="Số điện thoại"
                        required
                        className="paragraph-p4"
                    />
                </div>
                <button 
                    type="submit" 
                    className="button button-primary" 
                    disabled={loading}
                >
                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
            </form>
            {/* Tin nhắn thông báo */}
            {message && <p className="message">{message}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default ForgotPasswordPage;