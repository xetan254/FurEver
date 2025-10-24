import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AdoptionStepsTracker from '../../components/AdoptionStepsTracker';
import AuthContext from '../../context/AuthContext'; // Import AuthContext
import axios from 'axios'; // Import axios
import qrImage from '../../assets/img/qr.png'; // Sử dụng ảnh QR tĩnh

// === HELPER FUNCTIONS ===
const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'N/A';
    if (value === 0) return 'Miễn phí';
    try {
        const numberValue = Number(value);
        if (isNaN(numberValue)) return 'N/A';
        return numberValue.toLocaleString('vi-VN') + ' VNĐ';
    } catch (e) {
        console.error("Lỗi định dạng tiền tệ:", e);
        return 'N/A';
    }
};

// === COMPONENT CHÍNH ===
const AdoptionStep3 = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Lấy thông tin từ AuthContext (theo file AuthContext.js của bạn)
    const { userInfo } = useContext(AuthContext); 
    // Lấy token từ bên trong userInfo
    const token = userInfo?.token; 
    // Tự định nghĩa backendUrl
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

    // Lấy dữ liệu thô từ Step 2
    const { petDetails, adoptionMethod, selectedAddress, totalFee } = location.state || {};

    // State để lưu đơn hàng đã tạo (bao gồm orderCode)
    const [createdOrder, setCreatedOrder] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); // Bắt đầu loading để tạo đơn hàng
    const [error, setError] = useState('');

    // useEffect này sẽ chạy MỘT LẦN khi trang tải để TẠO ĐƠN HÀNG
    useEffect(() => {
        // 1. Kiểm tra dữ liệu đầu vào
        if (!petDetails || !adoptionMethod) {
            console.warn("Không tìm thấy petDetails hoặc adoptionMethod, đang chuyển hướng...");
            navigate('/adoption');
            return;
        }
        if (!token) {
             setError('Bạn phải đăng nhập để tạo đơn hàng.');
             setIsLoading(false);
             return;
        }

        // 2. Định nghĩa hàm tạo đơn hàng
        const createOrder = async () => {
            setIsLoading(true);
            setError('');
            
            // Tính toán lại chi phí để đảm bảo
            const petFee = petDetails.adoptionFee || 0;
            const shippingFee = adoptionMethod === 'delivery' ? 25000 : 0; 
            const calculatedTotalFee = petFee + shippingFee;

            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Gọi API POST /api/orders (Backend sẽ tự động sinh mã đơn hàng)
                const { data } = await axios.post(
                    `${backendUrl}/api/orders`, 
                    {
                        petDetails,
                        adoptionMethod,
                        selectedAddress: adoptionMethod === 'delivery' ? selectedAddress : null,
                        totalFee: calculatedTotalFee,
                        shippingFee: shippingFee
                    }, 
                    config
                );
                
                setCreatedOrder(data); // Lưu đơn hàng đã tạo (chứa orderCode, _id, ...)

            } catch (err) {
                console.error("Lỗi khi tạo đơn hàng:", err.response?.data || err);
                setError(err.response?.data?.message || 'Không thể tạo đơn hàng, vui lòng thử lại.');
            } finally {
                setIsLoading(false);
            }
        };

        // 3. Gọi hàm
        createOrder();
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy 1 lần duy nhất khi component mount

    // Hàm xử lý khi bấm "Đã thanh toán"
    const handleConfirmPayment = async () => {
        setIsLoading(true); // Bắt đầu loading cho nút bấm
        setError('');

        if (!token || !createdOrder) {
            setError('Lỗi đơn hàng. Vui lòng thử lại.');
            setIsLoading(false);
            return;
        }
        
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Gọi API để chuyển trạng thái sang "processing"
            await axios.put(
                `${backendUrl}/api/orders/${createdOrder._id}/confirm-payment`, 
                {}, // Không cần body
                config
            );
            
            // Chuyển sang trang hoàn tất, mang theo orderCode
            navigate('/adoption-complete', { 
                state: { orderCode: createdOrder.orderCode } 
            });

        } catch (err) {
            console.error("Lỗi khi xác nhận thanh toán:", err.response?.data || err);
            setError(err.response?.data?.message || 'Không thể xác nhận thanh toán, vui lòng thử lại.');
            setIsLoading(false);
        }
    };


    // --- RENDER LOGIC ---

    // Giao diện Loading (khi đang tạo đơn hàng)
    if (isLoading && !createdOrder) {
        return (
            <main className="adoption-step-page step-3">
                 <div className="content" style={{textAlign: 'center', padding: '100px'}}>
                    <p className="heading-h22">Đang tạo đơn hàng, vui lòng chờ...</p>
                 </div>
            </main>
        );
    }
    
    // Giao diện Lỗi (nếu tạo đơn hàng thất bại)
    if (error) {
         return (
             <main className="adoption-step-page step-3">
                 <div className="content" style={{textAlign: 'center', padding: '100px'}}>
                    <p className="heading-h22" style={{color: 'red'}}>Đã xảy ra lỗi</p>
                    <p className="paragraph-p3" style={{color: '#000'}}>{error}</p>
                    <Link 
                        to="/adoption-step-2" // Quay lại Step 2
                        state={location.state} // Gửi lại state cũ
                        className="button button-secondary back-button"
                        style={{marginTop: '20px', display: 'inline-flex'}}
                    >
                        Thử lại
                    </Link>
                 </div>
            </main>
         );
    }
    
    // Nếu không có đơn hàng (ví dụ: lỗi logic, state bị mất)
    if (!createdOrder) {
        // Chuyển hướng về trang chủ nếu không có đơn hàng (do useEffect ở trên)
        return null; 
    }

    // Giao diện chính khi đã tạo đơn hàng thành công
    return (
        <main className="adoption-step-page step-3">
              <section className="breadcrumb">
                <div className="content">
                    <p className="paragraph-p3"><Link to="/">Trang chủ</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3"><Link to="/adoption">Nhận nuôi</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3"><Link to={`/adoption-detail/${createdOrder.pet}`}>{createdOrder.petName}</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3">Thực hiện nhận nuôi</p>
                </div>
            </section>

            <section className="intro">
                 <div className="content">
                    <h1 className="heading-h54">Thanh toán</h1>
                    <p className="paragraph-p3">
                        Quét mã QR để hoàn tất phí cho đơn hàng <strong>{createdOrder.orderCode}</strong>.
                    </p>
                </div>
            </section>
            
            <div className="content">
                <AdoptionStepsTracker currentStep={3} />
                <div className="payment-guide">
                     {/* Giao diện hiển thị QR */}
                     <div className="payment-qr">
                        <h3 className="heading-h18">Mã thanh toán QR</h3>
                        
                        {/* Sử dụng ảnh QR tĩnh đã import */}
                        <img 
                            src={qrImage} 
                            alt="Mã QR Code thanh toán" 
                            className="qr-image" 
                            style={{width: '256px', height: 'auto', borderRadius: '8px'}}
                        />
                        
                        <p style={{marginTop: '15px', color: '#555', fontSize: '0.9rem'}}>Nội dung chuyển khoản (bắt buộc):</p>
                        {/* Hiển thị mã đơn hàng từ state */}
                        <strong style={{color: '#b53518', fontSize: '1.2rem', letterSpacing: '1px'}}>{createdOrder.orderCode}</strong>

                        <p className="heading-h22" style={{color: '#b53518', marginTop: '20px'}}>
                            Tổng cộng: {formatCurrency(createdOrder.totalFee)}
                        </p>
                        
                        {/* Nút bấm */}
                        <div className="payment-buttons">
                            <Link 
                                to="/adoption-step-2" 
                                // Gửi lại state cho Step 2 (bao gồm cả createdOrder)
                                state={{ ...location.state, createdOrder }} 
                                className="button button-secondary back-button"
                            >
                                Trở lại
                            </Link>
                            {/* Nút "Đã thanh toán" gọi hàm handleConfirmPayment */}
                            <button 
                                onClick={handleConfirmPayment}
                                className="button button-primary confirm-payment-button"
                                disabled={isLoading} // Vô hiệu hóa khi đang xử lý
                            >
                                {isLoading ? 'Đang xử lý...' : 'Đã thanh toán'}
                            </button>
                        </div>
                    </div>

                    {/* Hướng dẫn thanh toán */}
                     <div className="payment-instructions">
                         <h2 className="heading-h22">Hướng dẫn thanh toán</h2>
                         <div className="payment-instructions-method">
                             <p className="paragraph-p4 title"><strong>Thanh toán qua chuyển khoản</strong></p>
                             <p className="paragraph-p4">Ngân hàng: <strong>MB Bank (Ví dụ)</strong></p>
                             <p className="paragraph-p4">Số tài khoản: <strong>0987654321</strong></p>
                             <p className="paragraph-p4">Chủ tài khoản: <strong>FurEver</strong></p>
                         </div>
                         <div className="payment-instructions-method account">
                            <p className="paragraph-p4 note-import">Vui lòng nhập chính xác nội dung chuyển khoản là MÃ ĐƠN HÀNG của bạn (ví dụ: {createdOrder.orderCode}) để chúng tôi có thể xác nhận.</p>
                            <p className="paragraph-p4">Sau khi chuyển khoản, vui lòng nhấn nút "Đã thanh toán". Đội ngũ của chúng tôi sẽ xác nhận đơn hàng của bạn trong thời gian sớm nhất.</p>
                         </div>
                     </div>
                </div>
            </div>
        </main>
    );
};

export default AdoptionStep3;