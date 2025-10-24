import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext'; // Import AuthContext

// Import hình ảnh
import logo from '../assets/img/logo.svg';
import userIcon from '../assets/img/user.svg';
import logoutIcon from '../assets/img/logout.svg';

const Header = () => {
    const navigate = useNavigate();
    // Lấy userInfo và hàm logout trực tiếp từ context
    const { userInfo, logout } = useContext(AuthContext);

    const logoutHandler = () => {
        logout(); // Gọi hàm logout từ context, nó sẽ xóa cả state và localStorage
        navigate('/login');
    };

    return (
        <header className="header" id="header">
            <div className="content">
                <nav className="main-nav">
                    <div className="nav-left">
                        <Link to="/" className="logo">
                            <img src={logo} alt="FurEver Logo" />
                        </Link>
                        <ul className="nav-links">
                            <li><NavLink to="/">Trang chủ</NavLink></li>
                            <li><NavLink to="/adoption">Nhận nuôi</NavLink></li>
                            <li><NavLink to="/news">Tin tức</NavLink></li>
                            <li><NavLink to="/about-us">Về chúng tôi</NavLink></li>
                            
                        </ul>
                    </div>
                    <div className="nav-actions nav-right">
                        <Link to="/donate" className="button button-secondary">Ủng hộ</Link>
                        
                        {userInfo ? (
                            // Giao diện khi đã đăng nhập
                            <div className="user" style={{ display: 'flex' }}>
                                <img src={userIcon} alt="User" />
                                <p className="heading-h18">{userInfo.name}</p>
                                <div className="user-dropdown">
                                    <Link to={`/profile/${userInfo._id}`}>Tài khoản của tôi</Link>
                                    <button onClick={logoutHandler} className="logout" style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', width: '100%', padding: '23px 27px', textAlign: 'left' }}>
                                        <img src={logoutIcon} alt="Logout" />Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Giao diện khi chưa đăng nhập
                            <div className="auth-links">
                                <Link to="/login">Đăng nhập</Link>
                                <span>/</span>
                                <Link to="/signup">Đăng ký</Link>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;