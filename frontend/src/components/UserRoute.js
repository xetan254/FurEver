import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import  AuthContext  from '../context/AuthContext';

const UserRoute = () => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        // Hiển thị một trạng thái tải trong khi chờ xác thực
        return <div>Loading...</div>;
    }

    // Nếu người dùng đã đăng nhập (tồn tại), cho phép truy cập.
    // Nếu chưa, chuyển hướng đến trang đăng nhập.
    return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default UserRoute;