import React, { useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AdoptionStepsTracker from '../../components/AdoptionStepsTracker';
import AuthContext from '../../context/AuthContext'; // Import AuthContext

// Import hình ảnh
import dogIconSmall from '../../assets/img/dog-icon-small.svg';
import catIconSmall from '../../assets/img/cat-icon.svg';
import tickIcon from '../../assets/img/tick-icon.svg';
import xIcon from '../../assets/img/x-icon.svg';

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
const AdoptionStep2 = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userInfo} = useContext(AuthContext); // Lấy userInfo và backendUrl
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    // Lấy dữ liệu đầy đủ được truyền từ Step 1
    const { 
        petDetails, 
        adoptionMethod, 
        selectedAddress 
    } = location.state || {};

    // --- KIỂM TRA DỮ LIỆU ĐẦU VÀO ---
    // Hook này phải được gọi ở cấp cao nhất
    useEffect(() => {
        // Nếu không có petDetails (ví dụ: người dùng reload trang),
        // chuyển hướng họ về trang nhận nuôi.
        if (!petDetails) {
            console.warn("Không tìm thấy petDetails, đang chuyển hướng về /adoption");
            navigate('/adoption');
        }
    }, [petDetails, navigate]); // Phụ thuộc vào petDetails và navigate

    // "Early return" - Rất quan trọng
    // Nếu không có petDetails, không render gì cả và chờ useEffect chuyển hướng
    if (!petDetails) {
        return null; 
    }
    // --- KẾT THÚC KIỂM TRA ---


    // --- Tính toán chi phí ---
    const petFee = petDetails.adoptionFee || 0;
    // Giả sử phí vận chuyển, bạn có thể thay đổi
    const shippingFee = adoptionMethod === 'delivery' ? 25000 : 0; 
    const totalFee = petFee + shippingFee;

    // --- Chuẩn bị dữ liệu hiển thị ---
    const speciesIcon = petDetails.species === 'cat' ? catIconSmall : dogIconSmall;
    const petImage = petDetails.images && petDetails.images.length > 0 
        ? `${backendUrl}/images/${petDetails.images[0]}` 
        : `${backendUrl}/images/default-pet.jpg`;

    // 1. Thông tin khách hàng (Họ tên, SĐT)
    let customerInfo = {
        name: 'Không rõ',
        phone: 'Không rõ'
    };
    if (adoptionMethod === 'delivery' && selectedAddress) {
        customerInfo.name = selectedAddress.fullName;
        customerInfo.phone = selectedAddress.phone;
    } else if (adoptionMethod === 'direct' && userInfo) {
        customerInfo.name = userInfo.name;
        customerInfo.phone = userInfo.phone;
    } else if (userInfo) { // Fallback cho trường hợp 'direct' nhưng không có SĐT
         customerInfo.name = userInfo.name;
    }


    // 2. Thông tin địa chỉ (Nơi nhận)
    let displayAddress;
    if (adoptionMethod === 'direct') {
        displayAddress = {
            title: "Địa chỉ nhận thú cưng",
            name: "Trung tâm cứu hộ FurEver",
            fullAddress: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
        };
    } else if (selectedAddress) {
        displayAddress = {
            title: "Địa chỉ giao hàng",
            name: `${selectedAddress.fullName} | ${selectedAddress.phone}`,
            fullAddress: `${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`
        };
    } else {
         displayAddress = {
             title: "Địa chỉ giao hàng",
             name: "Lỗi: Không tìm thấy địa chỉ đã chọn.",
             fullAddress: ""
         };
    }

    return (
        <main className="adoption-step-page step-2">
              <section className="breadcrumb">
                <div className="content">
                    <p className="paragraph-p3"><Link to="/">Trang chủ</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3"><Link to="/adoption">Nhận nuôi</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3"><Link to={`/adoption-detail/${petDetails._id}`}>{petDetails.name}</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3">Thực hiện nhận nuôi</p>
                </div>
            </section>

            <section className="intro">
                 <div className="content">
                    <h1 className="heading-h54">Nhận nuôi</h1>
                    <p className="paragraph-p3">
                        Vui lòng xác nhận lại thông tin nhận nuôi {petDetails.name}
                    </p>
                </div>
            </section>
            
            {/* Sử dụng div.content để bao bọc các phần tử theo CSS */}
            <div className="content">
                <AdoptionStepsTracker currentStep={2} />
                
                {/* Áp dụng cấu trúc CSS bạn cung cấp */}
                <div className="step-container">
                    {/* --- 1. Thông tin xác nhận --- */}
                    <div className="confirmation-container">
                        <h2 className="confirmation-title heading-h32">Xác nhận thông tin</h2>
                        <span className="confirmation-code paragraph-p4">Mã đơn: (sẽ được tạo ở bước sau)</span>
                        
                        <div className="confirmation-content">
                            {/* --- Cột trái: Thông tin người nhận & Địa chỉ --- */}
                            <div className="location-info">
                                <h3 className="heading-h18" style={{color: '#e74f2c'}}>Thông tin người nhận</h3>
                                <p className="location-phone">
                                    <strong>Họ tên:</strong> {customerInfo.name}
                                </p>
                                <p className="location-phone">
                                    <strong>Số điện thoại:</strong> {customerInfo.phone}
                                </p>

                                <br/>
                                <h3 className="heading-h18" style={{color: '#e74f2c'}}>{displayAddress.title}</h3>
                                {/* Chỉ hiển thị tên nếu là địa chỉ giao hàng */}
                                
                                <p className="location-phone">
                                    {displayAddress.fullAddress}
                                </p>
                            </div>

                            {/* --- Cột phải: Thông tin thú cưng (Chi tiết) --- */}
                            <div className="time-info">
                                 <h3 className="heading-h18" style={{color: '#e74f2c'}}>Thông tin thú cưng</h3>
                                 <div style={{display: 'flex', gap: '15px', alignItems: 'flex-start'}}>
                                     
                                     <div className="pet-confirmation-details">
                                        <h4 style={{display: 'flex', alignItems: 'center', gap: '5px', margin: 0}}>
                                            <img src={speciesIcon} alt={petDetails.species} style={{width: '20px'}}/> {petDetails.name}
                                        </h4>
                                        <p className="paragraph-p4" style={{margin: '3px 0'}}><strong>Giống:</strong> {petDetails.breed}</p>
                                        <p className="paragraph-p4" style={{margin: '3px 0'}}><strong>Tuổi:</strong> {petDetails.age}</p>
                                        <p className="paragraph-p4" style={{margin: '3px 0'}}><strong>Giới tính:</strong> {petDetails.gender}</p>
                                        <p className="paragraph-p4" style={{margin: '3px 0'}}><strong>Cân nặng:</strong> {petDetails.weight ? `${petDetails.weight} kg` : 'N/A'}</p>
                                        <p className="paragraph-p4" style={{margin: '3px 0', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                            <strong>Tiêm phòng:</strong> <img src={petDetails.vaccinated ? tickIcon : xIcon} alt="status" style={{width: '14px', height: '14px'}} />
                                        </p>
                                         <p className="paragraph-p4" style={{margin: '3px 0', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                            <strong>Triệt sản:</strong> <img src={petDetails.sterilized ? tickIcon : xIcon} alt="status" style={{width: '14px', height: '14px'}} />
                                        </p>
                                     </div>
                                     <img 
                                        src={petImage} 
                                        alt={petDetails.name} 
                                        style={{width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0}}
                                        onError={(e) => {e.target.onerror = null; e.target.src=`${backendUrl}/images/default-pet.jpg`}}
                                    />
                                 </div>
                            </div>
                        </div>
                    </div>

                    {/* --- 2. Tổng chi phí --- */}
                    <div className="payment-summary">
                        <div className="payment-method-label">
                            <div className="payment-left">
                                <h2 className="label-left heading-h22">Chi phí</h2>
                                <div className="payment-info">
                                    <div className="payment-detail">
                                        <p className="paragraph-p4">Phí nhận nuôi:</p>
                                        <p className="paragraph-p4"><strong>{formatCurrency(petFee)}</strong></p>
                                    </div>
                                    <div className="payment-detail">
                                        <p className="paragraph-p4">Phí vận chuyển <em>({adoptionMethod === 'direct' ? 'Trực tiếp' : 'Tại nhà'})</em>:</p>
                                        <p className="paragraph-p4"><strong>{formatCurrency(shippingFee)}</strong></p>
                                    </div>
                                    <div className="divider" style={{marginTop: '20px'}}></div>
                                    <div className="payment-total">
                                        <p className="paragraph-p4">Tổng cộng</p>
                                        <h2 className="heading-h22">{formatCurrency(totalFee)}</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="payment-right">
                                 {/* Để trống theo CSS */}
                            </div>
                        </div>
                    </div>

                    {/* --- 3. Nút bấm --- */}
                    <div className="confirmation-buttons" style={{justifyContent: 'flex-end', marginTop: '40px'}}>
                        <Link 
                            to="/adoption-step" 
                            // Quan trọng: Phải gửi state petId TRỞ LẠI trang Step 1
                            state={{ petId: petDetails._id }} 
                            className="button button-secondary back-button"
                        >
                            Trở lại
                        </Link>
                        <Link 
                            to="/adoption-step-3" 
                            // Truyền tất cả dữ liệu cần thiết sang Step 3
                            state={{ 
                                petDetails, 
                                adoptionMethod, 
                                selectedAddress, // Gửi cả địa chỉ đầy đủ
                                totalFee // Gửi tổng phí
                            }} 
                            className="button button-primary confirm-button"
                        >
                            Xác nhận
                        </Link>
                    </div>
                </div>

            </div>
        </main>
    );
};

export default AdoptionStep2;

