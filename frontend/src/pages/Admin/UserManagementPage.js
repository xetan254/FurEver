import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './ManagementPage.css'; // File CSS riêng cho trang này
import searchIcon from '../../assets/img/search-icon.svg';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const { userInfo } = useContext(AuthContext);

    // Hàm để tải danh sách người dùng từ API
    const fetchUsers = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`, // Gửi token của admin
                },
            };
            const { data } = await axios.get('http://localhost:5000/api/users', config);
            setUsers(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách người dùng:", error);
            alert('Không thể tải danh sách người dùng. Bạn có phải là admin không?');
        }
    };

    // Tải dữ liệu khi component được render lần đầu
    useEffect(() => {
        if (userInfo && userInfo.token) {
            fetchUsers();
        }
    }, [userInfo]);

    
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-group">
                <div className="search-bar">
                    <input type="text" placeholder="Tìm kiếm theo tên, SĐT, email..." />
                    <button className="search-btn">
                        <img src={searchIcon} alt="Search" />   
                    </button>
                </div>
                </div>
                <div className="page-actions">
                    <button className="action-btn-secondary" onClick={fetchUsers}>Làm mới</button>
                </div>
            </div>

            <table className="user-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Họ và Tên</th>
                        <th>Số điện thoại</th>
                        <th>Email</th>
                        <th>Ngày tham gia</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user._id}>
                            <td>{index + 1}</td>
                            <td>{user.name}</td>
                            <td>{user.phone}</td>
                            <td>{user.email}</td> 
                            <td>{formatDate(user.createdAt)}</td>          
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementPage;