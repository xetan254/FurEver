import React, { createContext, useState, useEffect } from 'react';

// Tạo Context để chứa thông tin xác thực
const AuthContext = createContext();

// Tạo component Provider để bọc toàn bộ ứng dụng
export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true); // State để theo dõi quá trình tải dữ liệu

    // Khi ứng dụng khởi động, kiểm tra xem có thông tin người dùng trong localStorage không
    useEffect(() => {
        try {
            const storedUserInfo = localStorage.getItem('userInfo');
            if (storedUserInfo) {
                setUserInfo(JSON.parse(storedUserInfo));
            }
        } catch (error) {
            console.error("Lỗi khi đọc userInfo từ localStorage", error);
        } finally {
            setLoading(false); // Đánh dấu đã tải xong, dù thành công hay thất bại
        }
    }, []);

    // Hàm để xử lý đăng nhập: cập nhật state và localStorage
    const login = (userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUserInfo(userData);
    };

    // Hàm để xử lý đăng xuất
    const logout = () => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
    };

    return (
        <AuthContext.Provider value={{ userInfo, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;