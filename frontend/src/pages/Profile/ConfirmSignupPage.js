import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ConfirmSignupPage = () => {
    // Hooks để lấy token từ URL và để điều hướng
    const { token } = useParams();
    const navigate = useNavigate();

    // State để quản lý trạng thái của trang
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dùng useEffect để tự động chạy hàm xác thực MỘT LẦN khi trang được tải
    useEffect(() => {
        const verifyAccount = async () => {
            // Nếu không có token trên URL, báo lỗi ngay
            if (!token) {
                setError('Đường dẫn xác thực không hợp lệ.');
                setLoading(false);
                return;
            }

            try {
                // Gọi API backend để xác thực token và tạo tài khoản
                const { data } = await axios.post(
                    'http://localhost:5000/api/auth/verify-and-register',
                    { token }
                );

                // Nếu thành công, backend sẽ trả về thông tin người dùng và token đăng nhập
                setSuccess('Xác thực thành công! Đang tự động đăng nhập...');

                // 1. Lưu thông tin người dùng vào localStorage để duy trì đăng nhập
                localStorage.setItem('userInfo', JSON.stringify(data));

                // 2. Chờ 2 giây để người dùng đọc thông báo, sau đó chuyển về trang chủ
                setTimeout(() => {
                    // Dùng window.location.href để tải lại toàn bộ trang và cập nhật trạng thái Header
                    window.location.href = '/'; 
                }, 2000);

            } catch (err) {
                // Nếu token hết hạn hoặc không hợp lệ, backend sẽ báo lỗi
                setError(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        verifyAccount();
    }, [token, navigate]); // Dependency array, chỉ chạy lại nếu token hoặc navigate thay đổi

    // Giao diện sẽ thay đổi tùy thuộc vào trạng thái (loading, error, success)
    const renderContent = () => {
        if (loading) {
            return <p className="paragraph-p3">Đang xác thực tài khoản của bạn, vui lòng chờ...</p>;
        }
        if (error) {
            return (
                <>
                    <p className="paragraph-p3" style={{ color: 'green' }}>{error}</p>
                    <Link to="/login" className="button button-primary" style={{ textDecoration: 'none' }}>
                        Hoàn thành
                    </Link>
                </>
            );
        }
        if (success) {
            return <p className="paragraph-p3" style={{ color: 'green' }}>{success}</p>;
        }
        return null;
    };

    return (
        <main className="confirm-page">
            <div className="verification-container" style={{ textAlign: 'center' }}>
                <h2 className="heading-h32"><b>{renderContent()}</b></h2>
            </div>
        </main>
    );
};

export default ConfirmSignupPage;