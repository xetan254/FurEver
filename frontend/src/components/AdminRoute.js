import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AdminRoute = () => {
    // Lấy thông tin người dùng và trạng thái loading từ Context
    const { userInfo, loading } = useContext(AuthContext);

    // Nếu đang trong quá trình kiểm tra thông tin, hiển thị thông báo chờ
    if (loading) {
        return <div>Đang kiểm tra quyền truy cập...</div>;
    }

    // Sau khi kiểm tra xong, nếu có userInfo và role là 'admin' -> cho phép truy cập
    // <Outlet /> sẽ render ra các trang con (AdminPage, PetManagementPage,...)
    return userInfo && userInfo.role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;