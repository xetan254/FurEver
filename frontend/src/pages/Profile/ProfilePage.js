import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

// Import AuthContext từ file context chung của bạn
import AuthContext from '../../context/AuthContext'; 

import './ProfilePage.css'; // File CSS của bạn
import userIcon from '../../assets/img/user.svg'; // Ảnh mặc định

// === HELPER FUNCTIONS ===
const formatDate = (dateString) => {
    try {
        if (!dateString || isNaN(new Date(dateString))) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch { return 'N/A'; }
}
const formatCurrency = (value) => (value === 0) ? 'Miễn phí' : (value || 0).toLocaleString('vi-VN') + ' VNĐ';


// === COMPONENT CON CHO CÁC TAB ===

// --- Password Change Section ---
const PasswordChangeSection = () => {
    const { userInfo } = useContext(AuthContext); 
    const token = userInfo?.token; 
    const backendUrl = 'http://localhost:5000'; 
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ message: '', type: '' });

    // Hàm xử lý việc gửi yêu cầu đổi mật khẩu
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setStatus({ message: '', type: '' });

        if (!token) { setStatus({ message: "Bạn cần đăng nhập để đổi mật khẩu.", type: 'error' }); return; }
        if (!backendUrl) { setStatus({ message: "Lỗi cấu hình máy chủ.", type: 'error' }); return; }
        if (newPassword !== confirmPassword) { setStatus({ message: "Mật khẩu mới không khớp.", type: 'error' }); return; }
        if (newPassword.length < 6) { setStatus({ message: "Mật khẩu mới cần ít nhất 6 ký tự.", type: 'error' }); return; }
        if (!userInfo?.email) { setStatus({ message: "Chức năng này yêu cầu tài khoản có email.", type: 'error' }); return; }

        setStatus({ message: "Đang xử lý...", type: 'info' });
        try {
             const config = { headers: { Authorization: `Bearer ${token}` } };
             // Gọi API đổi mật khẩu ở backend
             await axios.put(`${backendUrl}/api/users/password`, { currentPassword, newPassword }, config);
             setStatus({ message: "Đổi mật khẩu thành công!", type: 'success' });
             // Reset form
             setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
             setTimeout(() => setStatus({ message: '', type: '' }), 5000);
        } catch (error) {
            console.error("Lỗi đổi mật khẩu:", error.response?.data || error);
            setStatus({ message: error.response?.data?.message || "Đổi mật khẩu thất bại.", type: 'error' });
        }
    };

    // Giao diện hiển thị nếu người dùng không có email
    if (!userInfo?.email) {
        return (
             <div className="profile-content-section">
                <div className="password-section">
                    <h3 className="heading-h22">Đổi mật khẩu</h3>
                    <p className="paragraph-p4" style={{ color: '#777' }}>Chức năng này yêu cầu tài khoản được liên kết với email.</p>
                </div>
            </div>
         );
    }

    // Giao diện chính của form đổi mật khẩu
    return (
        <div className="profile-content-section">
            <div className="password-section">
                <h3 className="heading-h22">Đổi mật khẩu</h3>
                {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
                  <form onSubmit={handleChangePassword} className="profile-form password-grid-form"> {/* Thêm class mới */}
                     {/* Bọc label và input vào div.form-grid-item */}
                     <div className="form-grid-item">
                         <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                         <input type="password" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                     </div>
                     <div className="form-grid-item">
                         <label htmlFor="newPassword">Mật khẩu mới</label>
                         <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                     </div>
                     <div className="form-grid-item">
                         <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                         <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                     </div>
                     {/* Nút bấm nằm ngoài grid hoặc span qua 2 cột */}
                    <div className="form-actions password-actions"> {/* Thêm class riêng */}
                        <button type="submit" className="save-button">Lưu mật khẩu mới</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- 1. TAB THÔNG TIN CÁ NHÂN ---
const UserInfoTab = () => {
    // Lấy userInfo và hàm login (để cập nhật localStorage) từ Context
    const { userInfo, login } = useContext(AuthContext); 
    // Lấy token từ userInfo
    const token = userInfo?.token; 
    const backendUrl = 'http://localhost:5000';

    const [isEditing, setIsEditing] = useState(false);
    // Khởi tạo state formData dựa trên userInfo
    const [formData, setFormData] = useState({ 
        name: userInfo?.name || '', 
        phone: userInfo?.phone || '', 
        email: userInfo?.email || '' 
    });
    const [status, setStatus] = useState({ message: '', type: '' });
    const fileInputRef = useRef(null);

    // Cập nhật form khi userInfo thay đổi (vd: sau khi upload avatar)
    useEffect(() => {
        if (userInfo) {
            setFormData({ 
                name: userInfo.name || '', 
                phone: userInfo.phone || '', 
                email: userInfo.email || '' 
            });
        }
    }, [userInfo]);

    // Hàm xử lý lưu thông tin người dùng
    const handleSave = async () => {
        if (!token) { setStatus({ message: 'Vui lòng đăng nhập để lưu.', type: 'error' }); return; } 
        if (!backendUrl) { setStatus({ message: 'Lỗi cấu hình máy chủ.', type: 'error' }); return; }
        
        setStatus({ message: 'Đang lưu...', type: 'info' });
        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
            // Gọi API cập nhật profile (PUT /api/users/profile)
            const { data } = await axios.put(`${backendUrl}/api/users/profile`, formData, config);
            
            // Cập nhật AuthContext và localStorage thông qua hàm login
            // Giữ lại token cũ và cập nhật các trường khác từ response 'data'
            const updatedUserInfo = { ...userInfo, ...data, token: token }; 
            login(updatedUserInfo); // Cập nhật state VÀ localStorage
            
            setStatus({ message: 'Cập nhật thành công!', type: 'success' });
            setIsEditing(false);
            setTimeout(() => setStatus({ message: '', type: '' }), 3000);
        } catch (error) {
            console.error("Lỗi cập nhật profile:", error.response?.data || error.message);
            // Hiển thị lỗi từ backend (vd: "Số điện thoại đã tồn tại")
            setStatus({ message: error.response?.data?.message || 'Cập nhật thất bại!', type: 'error' });
        }
    };

    // Hàm hủy bỏ chỉnh sửa
    const handleCancel = () => { 
         // Reset form về giá trị hiện tại trong userInfo
         setFormData({ 
             name: userInfo?.name || '', 
             phone: userInfo?.phone || '', 
             email: userInfo?.email || '' 
         });
         setIsEditing(false);
         setStatus({ message: '', type: '' });
     };
    
     // Mở cửa sổ chọn file khi click ảnh đại diện
    const handleAvatarClick = () => { fileInputRef.current.click(); };

    // Hàm xử lý upload ảnh đại diện mới
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file || !token || !backendUrl) return; 
        
        const uploadFormData = new FormData();
        uploadFormData.append('avatarImage', file); // 'avatarImage' phải khớp backend
        setStatus({ message: 'Đang tải ảnh lên...', type: 'info' });
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            // Gọi API upload avatar (POST /api/users/avatar)
            const { data } = await axios.post(`${backendUrl}/api/users/avatar`, uploadFormData, config);
            
            // Cập nhật AuthContext và localStorage
            const updatedUserInfo = { ...userInfo, avatarUrl: data.avatarUrl }; 
            login(updatedUserInfo); // Gọi hàm login để cập nhật state VÀ localStorage
            
            setStatus({ message: data.message || 'Tải ảnh lên thành công!', type: 'success' });
             setTimeout(() => setStatus({ message: '', type: '' }), 3000);
        } catch (error) {
            console.error("Lỗi upload avatar:", error.response?.data || error);
            setStatus({ message: error.response?.data?.message || 'Tải ảnh lên thất bại!', type: 'error' });
        }
        // Reset input file
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Giao diện khi chưa có thông tin user
    if (!userInfo) return <div className="tab-content"><p>Đang tải thông tin...</p></div>; 
    
    // Xác định URL ảnh đại diện
    const avatarDisplayUrl = userInfo.avatarUrl && backendUrl ? `${backendUrl}${userInfo.avatarUrl}` : userIcon;

    // Giao diện chính của Tab Thông tin cá nhân
    return (
        <div className="profile-content-section">
            <div className="info-section">
                <h3 className="heading-h22">Thông tin cá nhân</h3>
                 {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}
                <div className="profile-avatar-section">
                    <img src={avatarDisplayUrl} alt="Avatar" className="profile-avatar editable" onClick={handleAvatarClick} onError={(e) => { e.target.onerror = null; e.target.src = userIcon; }}/>
                    <p className="avatar-edit-hint">Nhấn vào ảnh để thay đổi</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                </div>
                <div className="profile-form">
                    <div className="form-group"><label>Họ và Tên</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={!isEditing} /></div>
                    <div className="form-group"><label>Số điện thoại</label><input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={!isEditing} /></div>
                    <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={!isEditing} /></div>
                    {!isEditing ? ( 
                        // Sử dụng class edit-button như yêu cầu
                        <button className="edit-button" onClick={() => { setIsEditing(true); setStatus({ message: '', type: '' }); }}>Chỉnh sửa</button> 
                    ) : ( 
                        <div className="form-actions">
                            <button className="cancel-button" onClick={handleCancel}>Hủy</button>
                            <button className="save-button" onClick={handleSave}>Lưu</button>
                        </div> 
                    )}
                </div>
            </div>
        </div>
    );
};


// Component hiển thị nội dung cho Tab  Địa Chỉ
const AddressTab = () => {
    const { userInfo } = useContext(AuthContext); 
    const token = userInfo?.token; 
    const backendUrl = 'http://localhost:5000';
    
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', phone: '', street: '', ward: '', district: '', city: '', isDefault: false });
    const [status, setStatus] = useState({ message: '', type: '' });

    // Hàm fetch danh sách địa chỉ
    const fetchAddresses = useCallback(async () => {
        if (!token || !backendUrl) { setIsLoading(false); return; } 
        setIsLoading(true); setStatus({ message: '', type: '' });
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${backendUrl}/api/users/addresses`, config);
            data.sort((a, b) => b.isDefault - a.isDefault);
            setAddresses(data);
        } catch (error) { console.error("Lỗi khi tải địa chỉ:", error); setStatus({ message: 'Lỗi tải danh sách địa chỉ.', type: 'error' }); }
        finally { setIsLoading(false); }
    }, [token, backendUrl]);

    useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

    // Hàm xử lý lưu địa chỉ (thêm mới hoặc cập nhật)
    const handleSave = async () => { 
        if (!token || !backendUrl) return; 
        setStatus({ message: 'Đang lưu...', type: 'info' });
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (editingAddress) await axios.put(`${backendUrl}/api/users/addresses/${editingAddress._id}`, formData, config); 
            else await axios.post(`${backendUrl}/api/users/addresses`, formData, config); 
            setShowForm(false); setEditingAddress(null); fetchAddresses(); 
            setStatus({ message: editingAddress ? 'Cập nhật thành công!' : 'Thêm thành công!', type: 'success' });
            setTimeout(() => setStatus({ message: '', type: '' }), 3000);
        } catch (error) { 
            console.error("Lỗi lưu địa chỉ:", error.response?.data || error);
            setStatus({ message: error.response?.data?.message || 'Lưu thất bại!', type: 'error' });
         }
    };
    
    // Hàm xử lý xóa địa chỉ
    const handleDelete = async (id) => { 
        if (!token || !backendUrl) return; 
         if (window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
             setStatus({ message: 'Đang xóa...', type: 'info' });
             try { 
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`${backendUrl}/api/users/addresses/${id}`, config); 
                setStatus({ message: 'Xóa địa chỉ thành công!', type: 'success' });
                fetchAddresses(); 
                setTimeout(() => setStatus({ message: '', type: '' }), 3000);
             } 
             catch (error) { 
                console.error("Lỗi xóa địa chỉ:", error.response?.data || error);
                setStatus({ message: 'Xóa thất bại!', type: 'error' });
             }
         }
    };
    
    // Hàm xử lý đặt làm địa chỉ mặc định
    const handleSetDefault = async (idToSetDefault) => { 
        if (!token || !backendUrl) return; 
        setStatus({ message: 'Đang cập nhật...', type: 'info' });
         try { 
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${backendUrl}/api/users/addresses/${idToSetDefault}/default`, {}, config); 
            fetchAddresses(); 
            setStatus({ message: 'Đặt làm mặc định thành công!', type: 'success' });
            setTimeout(() => setStatus({ message: '', type: '' }), 3000);
         } 
         catch (error) { 
            console.error("Lỗi đặt mặc định:", error.response?.data || error);
            setStatus({ message: 'Lỗi khi đặt làm mặc định!', type: 'error' });
          }
    };
    
    // Mở form để chỉnh sửa địa chỉ đã chọn
     const handleEditClick = (address) => {
        setFormData({...address}); 
        setEditingAddress(address); 
        setShowForm(true); 
        setStatus({ message: '', type: '' });
     };
    
    // Đóng form chỉnh sửa/thêm mới
     const handleCancelForm = () => {
        setShowForm(false);
        setEditingAddress(null); 
        setStatus({ message: '', type: '' });
     };

    // Giao diện khi đang tải
    if (isLoading) return <div className="tab-content"><p>Đang tải địa chỉ...</p></div>;

    // Giao diện chính của Tab Sổ Địa Chỉ
    return (
        <div className="profile-content-section">
            <div className="tab-content address-section">
                <div className="section-header">
                    <h3 className="heading-h22">Địa chỉ</h3>
                    {/* Luôn hiển thị nút Thêm mới */}
                    <button className="add-address-btn" onClick={() => { setFormData({ fullName: '', phone: '', street: '', ward: '', district: '', city: '', isDefault: false }); setEditingAddress(null); setShowForm(true); setStatus({message:'', type:''}); }}>+ Thêm địa chỉ mới</button>
                </div>

                {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}

                {/* Form Thêm/Sửa Địa chỉ */}
                {showForm && (
                     <div className="address-form-modal"> 
                         <h4>{editingAddress ? 'Sửa địa chỉ' : 'Địa chỉ mới'}</h4>
                         <div className="form-group"><label>Họ và tên</label><input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required/></div>
                         <div className="form-group"><label>Số điện thoại</label><input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required/></div>
                         <div className="form-group"><label>Số nhà, tên đường</label><input type="text" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} required/></div>
                         <div className="form-group"><label>Phường/Xã</label><input type="text" value={formData.ward} onChange={(e) => setFormData({...formData, ward: e.target.value})} required/></div>
                         <div className="form-group"><label>Quận/Huyện</label><input type="text" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} required/></div>
                         <div className="form-group"><label>Tỉnh/Thành phố</label><input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required/></div>
    
                         <div className="form-actions">
                             <button className="cancel-button" onClick={handleCancelForm}>Hủy</button>
                             <button className="save-button" onClick={handleSave}>Lưu</button>
                         </div>
                     </div>
                )}

                {/* Danh sách các địa chỉ đã lưu */}
                <div className="address-list">
                    {!isLoading && addresses.length === 0 && !showForm && <p className="empty-list-message">Bạn chưa có địa chỉ nào được lưu.</p>}
                    {addresses.map(addr => (
                        <div className="address-item" key={addr._id}>
                            <div className="address-info">
                                <p className="address-name">{addr.fullName} | {addr.phone}</p>
                                <p className="address-details">{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`}</p>
                                {addr.isDefault && <span className="address-default">Mặc định</span>}
                            </div>
                            <div className="address-actions">
                                <div className="action-buttons-top"> {/* Nhóm Sửa và Xóa */}
                                    <button onClick={() => handleEditClick(addr)}>Chỉnh sửa</button>
                                    <button onClick={() => handleDelete(addr._id)} className="delete-btn">Xóa</button>
                                </div>
                                {!addr.isDefault && (
                                    <button onClick={() => handleSetDefault(addr._id)} className="set-default-btn">Đặt làm mặc định</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Component hiển thị nội dung cho Tab Lịch Sử Nhận Nuôi
const OrderHistoryTab = () => {
     const { userInfo } = useContext(AuthContext); 
     const token = userInfo?.token; 
     const backendUrl = 'http://localhost:5000';

     const [orders, setOrders] = useState([]);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState('');

     // Hàm fetch lịch sử đơn hàng
     useEffect(() => {
         const fetchOrders = async () => {
             if (!token || !backendUrl) { setIsLoading(false); return; } 
             setIsLoading(true); setError('');
             try {
                 const config = { headers: { Authorization: `Bearer ${token}` } };
                 const { data } = await axios.get(`${backendUrl}/api/users/orders`, config);
                 data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                 setOrders(data);
             } catch (err) { console.error("Lỗi tải lịch sử đơn hàng:", err); setError("Không thể tải lịch sử đơn hàng."); }
             finally { setIsLoading(false); }
         };
         fetchOrders();
     }, [token, backendUrl]);

    // Giao diện khi đang tải hoặc có lỗi
    if (isLoading) return <div className="tab-content"><p>Đang tải lịch sử...</p></div>;
    if (error) return <div className="tab-content status-message error">{error}</div>;

    // Giao diện chính của Tab Lịch Sử Nhận Nuôi
    return (
        <div className="profile-content-section">
            <div className="tab-content order-history-section">
                 <div className="section-header"><h3 className="heading-h22">Lịch sử nhận nuôi</h3></div>
                 <div className="order-list">
                    {!isLoading && orders.length === 0 && <p className="empty-list-message">Bạn chưa có đơn nhận nuôi nào.</p>}
                    {orders.map(order => (
                        <div className="order-item" key={order._id}>
                            <img
                                 src={order.petImage && backendUrl ? `${backendUrl}${order.petImage}`: `https://placehold.co/80x80/f1f1f1/b53518?text=Pet`}
                                 alt={order.petName} className="order-pet-image"
                                 onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/80x80/f1f1f1/b53518?text=Error`; }}
                            />
                            <div className="order-details">
                                <h4>{order.petName || 'N/A'}</h4>
                                <p>Mã đơn hàng: #{order._id.substring(0, 8)}</p>
                                <p>Ngày nhận nuôi: {formatDate(order.createdAt)}</p>
                                <p>Phí nhận nuôi: {formatCurrency(order.adoptionFee)}</p>
                            </div>
                            <div className="order-status">
                                <span>{order.status || 'Đang xử lý'}</span>
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
        </div>
     );
};


// === COMPONENT CHÍNH CỦA TRANG PROFILE ===
const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('info');
    // Sử dụng context chỉ để lấy userInfo và loading ban đầu
    const { userInfo, loading: loadingAuth } = useContext(AuthContext); 
    const { id } = useParams();
    // Tự định nghĩa backendUrl ở đây nếu AuthContext không cung cấp
    const backendUrl = 'http://localhost:5000'; 


    // --- RENDER LOGIC ---
    if (loadingAuth) {
        return <main className="profile-page-container"><p style={{textAlign: 'center', padding: '50px'}}>Đang tải...</p></main>;
    }
    if (!userInfo) {
       return ( 
            <main className="profile-page-container">
                <div className="profile-content" style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Vui lòng đăng nhập để xem thông tin.</p>
                    <Link to="/login" className="login-link-button">Đăng nhập ngay</Link>
                </div>
            </main>
       );
    }
    // Bảo mật: Kiểm tra ID trên URL
    if (userInfo._id !== id) {
        return ( 
             <main className="profile-page-container">
                <div className="profile-content" style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Bạn không có quyền truy cập vào trang này.</p>
                </div>
            </main>
        );
    }

    // Xác định URL ảnh đại diện
    const sidebarAvatar = userInfo.avatarUrl && backendUrl ? `${backendUrl}${userInfo.avatarUrl}` : userIcon;

    // Giao diện chính của trang Profile
    return (
        <main className="profile-page-container">
            {/* Sidebar */}
            <div className="profile-sidebar">
                <div className="profile-user-summary">
                    <img src={sidebarAvatar} alt="Avatar" onError={(e) => { e.target.onerror = null; e.target.src=userIcon; }}/>
                    <p>{userInfo.name || 'Người dùng'}</p>
                </div>
                <nav className="profile-nav">
                    <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>Thông tin cá nhân</button>
                    {userInfo.email && <button className={activeTab === 'password' ? 'active' : ''} onClick={() => setActiveTab('password')}>Đổi mật khẩu</button>}
                    <button className={activeTab === 'address' ? 'active' : ''} onClick={() => setActiveTab('address')}>Địa chỉ</button>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Lịch sử nhận nuôi</button>
                </nav>
            </div>
            {/* Khu vực hiển thị nội dung của tab đang được chọn */}
            <div className="profile-content">
                {activeTab === 'info' && <UserInfoTab />}
                {activeTab === 'password' && <PasswordChangeSection />} 
                {activeTab === 'address' && <AddressTab />}
                {activeTab === 'orders' && <OrderHistoryTab />}
            </div>
        </main>
    );
}

// Export ProfilePage là default
export default ProfilePage; 

