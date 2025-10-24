// frontend/src/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { token } = useParams(); // Lấy token từ URL
    const navigate = useNavigate();
    console.log('Token từ URL khi trang tải:', token);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
        setError("Token không hợp lệ hoặc bị thiếu. Vui lòng thử lại từ link trong email.");
        return;
    }
        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp.');
            return;
        }
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const { data } = await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
            setMessage(data.message + ' Bạn sẽ được chuyển hướng đến trang đăng nhập.');
            setTimeout(() => {
                navigate('/login'); // Chuyển hướng sau khi thành công
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forget-password-container">
            <h2 className="heading-h32">Đặt lại mật khẩu mới</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                <label htmlFor="password" className="paragraph-p4">Mật khẩu mới:</label>
                <input
                    type="password"
                    id ="password"
                    value={password}
                    placeholder="Nhập mật khẩu mới" 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <label htmlFor="confirmPassword" className="paragraph-p4">Xác nhận mật khẩu mới:</label>
                <input
                    className="paragraph-p4"
                    id="confirmPassword"
                    placeholder="Nhập lại mật khẩu" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                </div>
                <button 
                 className="button button-primary" 
                 type="submit" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ResetPasswordPage;