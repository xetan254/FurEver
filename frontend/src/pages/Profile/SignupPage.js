import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // State mới để quản lý trạng thái sau khi gửi form thành công
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            navigate('/');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (error) setError(''); // Xóa lỗi khi người dùng bắt đầu nhập lại
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu nhập lại không khớp!");
            return;
        }
        
        setLoading(true);
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
            };

            // GỌI API MỚI: `/pre-register` để yêu cầu gửi mail xác thực
            await axios.post(
                'http://localhost:5000/api/auth/pre-register', // <-- THAY ĐỔI ROUTE
                { 
                    name: `${formData.lastname} ${formData.firstname}`,
                    phone: formData.phone,
                    email: formData.email, // <-- GỬI THÊM EMAIL
                    password: formData.password
                },
                config
            );
            
            // Cập nhật state để hiển thị thông báo thành công
            setIsSubmitted(true);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Đã có lỗi xảy ra khi đăng ký');
        } finally {
            setLoading(false);
        }
    };
    return (
        <main className="signup-page" style={{ paddingTop: '120px', paddingBottom: '50px' }}>
            <div className="signup-form">
                <div className="signup-form-left">
                    <h2 className="heading-h32">Đăng ký</h2>
                    {isSubmitted ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p className="paragraph-p3" style={{color: 'green'}}>Yêu cầu đăng ký thành công!</p>
                            <p>Một email xác thực đã được gửi đến <strong>{formData.email}</strong>.</p>
                            <p>Vui lòng kiểm tra hộp thư và làm theo hướng dẫn để hoàn tất đăng ký.</p>
                        </div>
                    ) : (
                        <>
                    <p className="paragraph-p3">
                        Gia nhập cộng đồng yêu chó mèo tại FurEver ngay hôm nay!
                    </p>

                    {/* Hiển thị thông báo lỗi nếu có */}
                    {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
                    
                    <form onSubmit={handleSignup}>
                        <div className="row">
                            <div className="form-signup-group">
                                <label htmlFor="firstname" className="paragraph-p4">Tên</label>
                                <input type="text" id="firstname" placeholder="Tên" value={formData.firstname} onChange={handleChange} required />
                            </div>
                            <div className="form-signup-group">
                                <label htmlFor="lastname" className="paragraph-p4">Họ</label>
                                <input type="text" id="lastname" placeholder="Họ" value={formData.lastname} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-signup-group">
                            <label htmlFor="phone" className="paragraph-p4">Số điện thoại</label>
                            <input type="text" id="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className="form-signup-group">
                            <label htmlFor="email" className="paragraph-p4">Email</label>
                            <input type="email" id="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="form-signup-group password">
                            <label htmlFor="password" className="paragraph-p4">Mật khẩu</label>
                            <input type="password" id="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="form-signup-group password">
                            <input type="password" id="confirmPassword" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} required />
                        </div>
                         <label className="option-container">
                            <input type="checkbox" name="agree" required />
                            <span className="checkmark"></span>
                            Tôi đồng ý với các điều khoản và chính sách bảo mật
                        </label>
                        <button type="submit" className="signup-button button button-primary">Đăng ký</button>
                    </form>
                    <div className="login-link paragraph-p4">
                        Đã có tài khoản?
                        <Link to="/login"><strong>Đăng nhập</strong></Link>
                    </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};
export default SignupPage;