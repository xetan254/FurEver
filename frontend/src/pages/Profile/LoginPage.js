import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext'; // Import AuthContext


const LoginPage = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { userInfo, login } = useContext(AuthContext); // Lấy hàm login và userInfo từ context

    // Nếu người dùng đã đăng nhập, tự động chuyển hướng họ
    useEffect(() => {
        if (userInfo) {
            navigate(userInfo.role === 'admin' ? '/admin' : '/');
        }
    }, [userInfo, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { phone, password });
            
            // Gọi hàm login từ context để cập nhật trạng thái toàn cục
            login(data);

            // Phân luồng dựa trên vai trò mà không cần reload
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đã có lỗi xảy ra');
        }
    };

    return (
        <main className="login-page" style={{ paddingTop: '120px', paddingBottom: '50px' }}>
            <div className="login-form">
                <div className="login-form-left">
                    <h2 className="heading-h32">Đăng nhập</h2>
                    <p className="paragraph-p3">Chào mừng bạn trở lại với FurEver!</p>
                    
                    {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

                    <form onSubmit={handleLogin}>
                         <div className="form-login-group">
                            <label htmlFor="phone" className="paragraph-p4">Số điện thoại</label>
                            <input
                                type="text"
                                id="phone"
                                placeholder="Số điện thoại"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-login-group password">
                            <label htmlFor="password" className="paragraph-p4">Mật khẩu</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="login-bottom-group">
                            <label className="option-container">
                                <input type="checkbox" name="remember" />
                                <span className="checkmark"></span>
                                Nhớ mật khẩu
                            </label>
                            <Link to="/forgot-password" className="paragraph-p4">Quên mật khẩu?</Link>
                        </div>
                        <button type="submit" className="login-button button button-primary">Đăng nhập</button>
                    </form>
                    <div className="register-link paragraph-p4">
                        Chưa có tài khoản?
                        <Link to="/signup"><strong>Đăng ký</strong></Link>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;