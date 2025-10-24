import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext'; // Import AuthContext
import './ManagementPage.css'; // Import file CSS chung
import searchIcon from '../../assets/img/search-icon.svg';
// Bỏ Link vì chúng ta sẽ dùng button
// import { Link } from 'react-router-dom'; 

// --- Định nghĩa URL Backend ---
// (Lấy từ context hoặc định nghĩa cứng)
const BACKEND_URL = 'http://localhost:5000'; 

// --- Icon Chỉnh sửa ---
const EditIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#ff5b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#ff5b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// ========================================================================
// ===                      COMPONENT MODAL CHỈNH SỬA                   ===
// ========================================================================
const OrderEditModal = ({ order, onSave, onClose }) => {
    // State cho các trường trong form
    const [status, setStatus] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const { userInfo } = useContext(AuthContext); 
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '', phone: '', fullAdress: ''
    });

    // Nạp dữ liệu của đơn hàng vào form khi modal mở
   useEffect(() => {
        if (order) {
            setStatus(order.status || 'pending');
            setAdminNotes(order.adminNotes || '');
            
            // Gộp địa chỉ từ dữ liệu 'order' gốc
            if (order.shippingAddress) {
                const { fullName, phone, street, ward, district, city } = order.shippingAddress;
                
                // Gộp các thành phần địa chỉ lại, bỏ qua các giá trị rỗng
                const combinedAddress = [street, ward, district, city]
                    .filter(Boolean) // Loại bỏ các giá trị (null, undefined, '')
                    .join(', '); // Nối chúng bằng dấu phẩy

                setShippingAddress({
                    fullName: fullName || '',
                    phone: phone || '',
                    fullAdress: combinedAddress // Sử dụng địa chỉ đã gộp
                });
            }
        }
    }, [order]); // Chạy lại khi 'order' thay đổi

    // Hàm xử lý khi bấm nút "Lưu"
    const handleSubmit = (e) => {
        e.preventDefault();
        // Gom dữ liệu cần cập nhật
        const updatedData = {
            status,
            adminNotes,
            shippingAddress: order.adoptionMethod === 'delivery' ? shippingAddress : order.shippingAddress,
        };
        onSave(order._id, updatedData); // Gọi hàm onSave từ cha
    };

    // Hàm xử lý khi thay đổi input địa chỉ
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!order) return null; // Không render gì nếu không có order

    return (
        <div className="modal-overlay">
            <div className="modal-content new-design">
                <h2>Chỉnh sửa đơn hàng</h2>
                <form onSubmit={handleSubmit} className="article-form"> 
                        <h4 className="heading-h18" style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee', color: '#b53518'}}>Thông tin tài khoan</h4>
                        <label>Chủ tài khoản: {userInfo?.name}</label>
                        <label>Số điện thoại: {userInfo?.phone}</label>
                     
                    {/* Chỉ hiển thị form địa chỉ nếu là "delivery" */}
                    {order.adoptionMethod === 'delivery' && (
                        <>  
                            <h4 className="heading-h18" style={{marginTop: '20px', color: '#b53518'}}>Thông tin giao hàng</h4>
                            <div className="form-group">
                                <label>Họ tên người nhận</label>
                                <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleAddressChange} />
                            </div>
                             <div className="form-group">
                                <label>Số điện thoại</label>
                                <input type="text" name="phone" value={shippingAddress.phone} onChange={handleAddressChange} />
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ</label>
                                <input type="text" name="fullAdress" value={shippingAddress.fullAdress} onChange={handleAddressChange} />
                            </div>
                            {/* Bạn có thể thêm các trường ward, district, city nếu muốn admin sửa */}
                        </>
                    )}
                        {/* === THÔNG TIN VẬT NUÔI & CHI PHÍ === */}
                        <h4 className="heading-h18" style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee', color: '#b53518'}}>Thông tin đơn hàng</h4>
                        <label>Tên vật nuôi: {order.petName || 'Không rõ'}</label>
                        <label>Hình thức nhận: {order.adoptionMethod === 'delivery' ? 'Giao hàng' : 'Nhận trực tiếp'}</label>
                        <label>Phí nhận nuôi: {formatCurrency(order.adoptionFee)}</label>
                        <label>Phí vận chuyển: {formatCurrency(order.shippingFee)}</label>
                        <label>Tổng phí: {formatCurrency(order.totalFee)}</label>
                    {/* === KẾT THÚC THÔNG TIN VẬT NUÔI === */}
                       {/* Trường Trạng thái */}
                    <div className="form-group">
                        <label>Mã đơn hàng: {order.orderCode}</label>
                        <label>Trạng thái đơn hàng</label>
                        <select 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)}
                            className={`status-dropdown status-${status}`} // Áp dụng style màu
                        >
                            <option value="pending">Chờ thanh toán</option>
                            <option value="processing">Chờ xử lý</option>
                            <option value="completed">Đã hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>

                    {/* Trường Ghi chú của Admin */}
                    <div className="form-group">
                        <label>Ghi chú (Admin)</label>
                        <textarea 
                            value={adminNotes} 
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows="4"
                            placeholder="Thêm ghi chú nội bộ..."
                        ></textarea>
                    </div>

                    {/* Nút bấm */}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel new-design">Hủy</button>
                        <button type="submit" className="btn-save new-design">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ========================================================================
// ===                      COMPONENT CHÍNH CỦA TRANG                     ===
// ========================================================================
const OrderManagementPage = () => {
    const [allOrders, setAllOrders] = useState([]); 
    const [displayOrders, setDisplayOrders] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userInfo } = useContext(AuthContext); 
    
    // --- STATE CHO MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null); // Đơn hàng đang được chọn để sửa

    const token = userInfo?.token; 
    const backendUrl = BACKEND_URL; // Dùng biến toàn cục đã định nghĩa

    // Hàm tải danh sách đơn hàng từ API
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${backendUrl}/api/orders`, config); 
            setAllOrders(data);
            setDisplayOrders(data); 
        } catch (err) {
            console.error("Lỗi khi tải danh sách đơn hàng:", err);
            setError('Không thể tải danh sách đơn hàng. Bạn có phải là admin không?');
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component được render
    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]); 

    // Lọc danh sách đơn hàng khi searchTerm thay đổi
    useEffect(() => {
        if (!searchTerm) {
            setDisplayOrders(allOrders); 
            return;
        }
        const lowerCaseSearch = searchTerm.toLowerCase().trim();
        const filtered = allOrders.filter(order => {
            const orderCodeMatch = order.orderCode.toLowerCase().includes(lowerCaseSearch);
            const phoneMatch = order.adoptionMethod === 'delivery' && 
                               order.shippingAddress?.phone?.includes(lowerCaseSearch);
            return orderCodeMatch || phoneMatch;
        });
        setDisplayOrders(filtered);
    }, [searchTerm, allOrders]);

    
    // Hàm xử lý khi Admin đổi trạng thái (trên bảng)
    const handleStatusChange = async (orderId, newStatus) => {
         if (!token) { alert('Phiên đăng nhập đã hết hạn.'); return; }
         try {
             const config = { headers: { Authorization: `Bearer ${token}` } };
             await axios.put(`${backendUrl}/api/orders/${orderId}`, { status: newStatus }, config);
             setAllOrders(prevOrders => 
                 prevOrders.map(order => 
                    order._id === orderId ? { ...order, status: newStatus } : order
                 )
             );
         } catch (error) {
              console.error("Lỗi khi cập nhật trạng thái:", error);
              alert('Cập nhật trạng thái thất bại.');
              fetchOrders(); // Tải lại nếu lỗi
         }
    };

    // --- CÁC HÀM XỬ LÝ MODAL ---
    
    // Mở modal
    const handleOpenModal = (order) => {
        setCurrentOrder(order);
        setIsModalOpen(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentOrder(null);
    };

    // Lưu thay đổi từ modal
    const handleSaveOrder = async (orderId, updatedData) => {
        if (!token) { alert('Phiên đăng nhập đã hết hạn.'); return; }
         try {
             const config = { headers: { Authorization: `Bearer ${token}` } };
             // Gọi API PUT /api/orders/:id (cần admin)
             const { data: savedOrder } = await axios.put(`${backendUrl}/api/orders/${orderId}`, updatedData, config);
             
             // Cập nhật lại state local
             setAllOrders(prevOrders => 
                 prevOrders.map(order => 
                    order._id === orderId ? savedOrder : order
                 )
             );
             handleCloseModal(); // Đóng modal
         } catch (error) {
              console.error("Lỗi khi lưu đơn hàng:", error);
              alert('Lưu đơn hàng thất bại.');
              // Không đóng modal khi lỗi để user có thể thử lại
         }
    };

    // Định dạng ngày tháng
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');
    

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-group">
                <div className="search-bar">
                    <input 
                        type="text" 
                        placeholder="Tìm theo Mã đơn hàng hoặc SĐT..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="search-btn">
                        <img src={searchIcon} alt="Search" />   
                    </button>
                </div>
                </div>
                <div className="page-actions">
                    <button className="action-btn-secondary" onClick={fetchOrders} disabled={loading}>
                        {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>
                </div>
            </div>

            {error && <p className="status-message error" style={{textAlign: 'center'}}>{error}</p>}

            <table className="user-table order-table">
                <thead>
                    <tr>
                        <th>Mã Đơn Hàng</th>
                        <th>Vật Nuôi</th>
                        <th>Khách Hàng</th>
                        <th>SĐT Giao Hàng</th>
                        <th>Tổng Phí</th>
                        <th>Trạng Thái</th>
                        <th>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="7" style={{textAlign: 'center'}}>Đang tải...</td></tr>
                    ) : displayOrders.length > 0 ? (
                        displayOrders.map((order) => (
                            <tr key={order._id}>
                                <td><strong>{order.orderCode}</strong></td>
                                <td className="pet-column">
                                    <img 
                                        src={order.petImage ? `${backendUrl}${order.petImage}` : `https://placehold.co/60x60/f1f1f1/b53518?text=Pet`} 
                                        alt={order.petName} 
                                        className="pet-image-thumbnail"
                                        onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/60x60/f1f1f1/b53518?text=Error`; }}
                                    />
                                    <div className="pet-info">
                                        <strong>{order.petName}</strong>
                                        <span className="pet-id">ID: {order.pet.toString().substring(0, 6)}...</span>
                                    </div>
                                </td>
                                <td>{order.user?.name || 'Không rõ'}</td> 
                                <td>{order.shippingAddress?.phone || '(Trực tiếp)'}</td>
                                <td>{formatCurrency(order.totalFee)}</td>
                                <td>
                                    <select 
                                        className={`status-dropdown status-${order.status}`}
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    >
                                        <option value="pending">Chờ thanh toán</option>
                                        <option value="processing">Chờ xử lý</option>
                                        <option value="completed">Đã hoàn thành</option>
                                        <option value="cancelled">Đã hủy</option>
                                    </select>
                                </td>
                                <td className="order-actions">
                                    {/* SỬA LẠI: Nút Chỉnh sửa giờ sẽ mở modal */}
                                    <button onClick={() => handleOpenModal(order)} className="action-button edit">
                                        <EditIcon />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                         <tr><td colSpan="7" style={{textAlign: 'center'}}>Không tìm thấy đơn hàng nào.</td></tr>
                    )}
                </tbody>
            </table>
            
             {/* Hiển thị Modal nếu isModalOpen là true */}
             {isModalOpen && (
                <OrderEditModal 
                    order={currentOrder} 
                    onSave={handleSaveOrder} 
                    onClose={handleCloseModal} 
                />
            )}
        </div>
    );
};

// Hàm helper định dạng tiền (nếu cần)
const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'N/A';
    if (value === 0) return 'Miễn phí';
    try {
        return Number(value).toLocaleString('vi-VN') + ' VNĐ';
    } catch (e) { return 'N/A'; }
};


export default OrderManagementPage;

