import React, { useContext } from 'react'; // 1. Thêm useContext
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './AdminLayout.css';
import logo from '../assets/img/logo.svg';
import AuthContext from '../context/AuthContext'; // 2. Import AuthContext

const AdminLayout = () => {
    const navigate = useNavigate();
    // 3. Lấy userInfo và hàm logout từ context
    const { userInfo, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <NavLink to="/" end>
                        <img src={logo} alt="FurEver Logo" />
                    </NavLink>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/admin" end>Trang chủ</NavLink>
                    <NavLink to="/admin/pets-management">Thú cưng</NavLink>
                    <NavLink to="/admin/articles-management">Tin tức</NavLink>
                    <NavLink to="/admin/users-management">Người dùng</NavLink>
                    <NavLink to="/admin/orders-management">Đơn hàng</NavLink>
                </nav>
                <div className="sidebar-footer">
                    {/* 4. Hiển thị tên người dùng nếu có */}
                    {userInfo && (
                        <NavLink to={`/profile/${userInfo._id}`} className="sidebar-user-profile">
                           {userInfo.name}
                        </NavLink>
                    )}
                    <button onClick={handleLogout} className="sidebar-logout-btn">Đăng xuất</button>
                </div>
            </aside>
            <main className="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;