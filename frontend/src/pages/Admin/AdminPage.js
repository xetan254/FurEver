import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // File CSS riêng cho dashboard
import './AdminDashboard.css'; // File này ở cùng thư mục nên giữ nguyên
import AuthContext from '../../context/AuthContext'; // Đi lên 2 cấp (ra khỏi Admin, ra khỏi pages) rồi vào context

// Import hình ảnh
// Đường dẫn cũng cần đi lên 2 cấp (ra khỏi Admin, ra khỏi pages) rồi vào assets/img
import userIcon from '../../assets/img/user.svg';
import petIcon from '../../assets/img/pet-ellipse1.svg';
import donationIcon from '../../assets/img/donate-icon.jpg';
const AdminPage = () => {
    const { userInfo } = useContext(AuthContext); // <-- added
    const [stats, setStats] = useState({ pets: 0, users: 0, articles: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = userInfo?.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};

                // Gọi đồng thời 3 API
                const [petResponse, usersResponse, articlesResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/pets'),
                    axios.get('http://localhost:5000/api/users', config), // có thể cần token
                    axios.get('http://localhost:5000/api/articles')
                ]);

                const userCount = Array.isArray(usersResponse.data) ? usersResponse.data.length : (usersResponse.data.count || 0);
                const articleCount = Array.isArray(articlesResponse.data) ? articlesResponse.data.length : (articlesResponse.data.count || 0);

                setStats({
                    pets: Array.isArray(petResponse.data) ? petResponse.data.length : 0,
                    users: userCount,
                    articles: articleCount
                });
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu thống kê:", error);
            }
        };
        fetchStats();
    }, [userInfo]);
    return (
        <div className="admin-dashboard">
            <h1>Thông tin tổng quát</h1>
            <div className="dashboard-summary">
                <div className="summary-card-new">
                    <div className="card-image-wrapper">
                         <img src={userIcon} alt="Người dùng" />
                    </div>
                    <div className="card-info">
                        <span className="card-number">{stats.users}</span>
                        <span className="card-title">Người dùng</span>
                        <p>Tổng số tài khoản người dùng đang hoạt động</p>
                    </div>
                </div>
                <div className="summary-card-new">
                     <div className="card-image-wrapper">
                         <img src={petIcon} alt="Thú nuôi" />
                    </div>
                    <div className="card-info">
                        <span className="card-number">{stats.pets}</span>
                        <span className="card-title">Thú nuôi</span>
                         <p>Tổng số thú nuôi đã được đăng tải lên hệ thống</p>
                    </div>
                </div>
                <div className="summary-card-new">
                     <div className="card-image-wrapper">
                         <img src={donationIcon} alt="Ủng hộ" />
                    </div>
                    <div className="card-info">
                        <span className="card-number">{stats.articles}</span>
                        <span className="card-title">Bài viết</span>
                        <p>Tổng số bài viết đã được đăng tải lên hệ thống</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;