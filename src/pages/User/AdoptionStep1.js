import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdoptionStepsTracker from '../../components/AdoptionStepsTracker';
import AuthContext from '../../context/AuthContext'; // Import AuthContext

// Import necessary images/icons
import dogIconSmall from '../../assets/img/dog-icon-small.svg';
import catIconSmall from '../../assets/img/cat-icon.svg'; 
import locationIcon from '../../assets/img/location1.svg';

// Helper Functions 
const formatDate = (dateString) => {
    try {
        if (!dateString || isNaN(new Date(dateString))) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'N/A';
    }
};
const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'N/A';
    if (value === 0) return 'Miễn phí';
    try {
        const numberValue = Number(value);
        if (isNaN(numberValue)) return 'N/A';
        return numberValue.toLocaleString('vi-VN') + ' VNĐ';
    } catch (e) {
        console.error("Error formatting currency:", e);
        return 'N/A';
    }
};

// Main Component
const AdoptionStep1 = () => {
    console.log("--- AdoptionStep1 Component Rendering ---"); // DEBUG: Component started rendering

    const location = useLocation();
    const navigate = useNavigate();
    const { userInfo } = useContext(AuthContext);
    const token = userInfo?.token; 
    const backendUrl = 'http://localhost:5000'; 
   

    // Get petId from state passed via Link
    console.log("Location State received:", location.state); // DEBUG: Check location state
    const petId = location.state?.petId;
    console.log("Extracted petId:", petId); // DEBUG: Check extracted petId

    // --- STATES ---
    const [petDetails, setPetDetails] = useState(null); 
    const [addresses, setAddresses] = useState([]); 
    const [adoptionMethod, setAdoptionMethod] = useState(null); 
    const [selectedAddressId, setSelectedAddressId] = useState(null); 
    const [loadingPet, setLoadingPet] = useState(true);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [error, setError] = useState('');
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    // --- EFFECTS ---
    // 1. Fetch Pet Details based on petId from location state
    useEffect(() => {
        console.log("--- useEffect: fetchPet ---"); // DEBUG: Entering fetchPet useEffect
        const fetchPet = async () => {
            if (!petId) {
                console.error("fetchPet: petId is missing!"); // DEBUG
                setError('Không tìm thấy thông tin thú cưng để nhận nuôi. Đang chuyển hướng...');
                setLoadingPet(false);
                setTimeout(() => navigate('/adoption'), 3000); 
                return;
            }
            if (!backendUrl) {
                 console.error("fetchPet: backendUrl is missing!"); // DEBUG
                 setError("Lỗi cấu hình máy chủ.");
                 setLoadingPet(false);
                 return;
            }

            setLoadingPet(true);
            console.log(`fetchPet: Attempting to fetch pet with ID: ${petId}`); // DEBUG
            try {
                const { data } = await axios.get(`${backendUrl}/api/pets/${petId}`);
                console.log("fetchPet: API response data:", data); // DEBUG
                if (!data) { 
                     console.warn("fetchPet: API returned success but no data."); // DEBUG
                     setError('Không tìm thấy thông tin thú cưng.');
                     setPetDetails(null);
                } else {
                    setPetDetails(data);
                }
            } catch (err) {
                console.error("fetchPet: Error fetching pet details:", err.response?.data || err.message); // DEBUG
                 if (err.response && err.response.status === 404) {
                     setError('Không tìm thấy thú cưng với ID này.');
                 } else {
                    setError('Không thể tải thông tin thú cưng.');
                 }
                 setPetDetails(null);
            } finally {
                setLoadingPet(false);
                console.log("fetchPet: Finished fetching pet details."); // DEBUG
            }
        };
        fetchPet();
    }, [petId, backendUrl, navigate]);

    // 2. Fetch User Addresses only when 'delivery' method is selected and user is logged in
    useEffect(() => {
         console.log("--- useEffect: fetchAddresses ---", { adoptionMethod, tokenExists: !!token }); // DEBUG
        const fetchAddresses = async () => {
            if (token && backendUrl) {
                setLoadingAddresses(true);
                setError(''); 
                console.log("fetchAddresses: Attempting to fetch addresses..."); // DEBUG
                try {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const { data } = await axios.get(`${backendUrl}/api/users/addresses`, config);
                    console.log("fetchAddresses: API response data:", data); // DEBUG
                    data.sort((a, b) => b.isDefault - a.isDefault); 
                    setAddresses(data);
                    
                    const defaultAddress = data.find(addr => addr.isDefault);
                    if (defaultAddress) {
                        setSelectedAddressId(defaultAddress._id);
                         console.log("fetchAddresses: Auto-selected default address:", defaultAddress._id); // DEBUG
                    } else if (data.length > 0) {
                        setSelectedAddressId(data[0]._id); 
                         console.log("fetchAddresses: Auto-selected first address:", data[0]._id); // DEBUG
                    } else {
                         setSelectedAddressId(null); 
                         console.log("fetchAddresses: No addresses found."); // DEBUG
                    }
                } catch (err) {
                    console.error("fetchAddresses: Error fetching addresses:", err.response?.data || err.message); // DEBUG
                    setError('Không thể tải danh sách địa chỉ của bạn.');
                    setAddresses([]); 
                    setSelectedAddressId(null);
                } finally {
                    setLoadingAddresses(false);
                     console.log("fetchAddresses: Finished fetching addresses."); // DEBUG
                }
            } else {
                console.log("fetchAddresses: Conditions not met (not delivery method or missing token/backendUrl). Clearing addresses."); // DEBUG
                setAddresses([]); 
                setSelectedAddressId(null); 
            }
        };

        if (adoptionMethod === 'delivery') {
            fetchAddresses();
        } else {
             setAddresses([]);
             setSelectedAddressId(null);
             setLoadingAddresses(false); 
        }
    }, [adoptionMethod, token, backendUrl]); 

    // --- HANDLERS ---
    const handleSelectMethod = (method) => {
        console.log("handleSelectMethod: Selected method:", method); // DEBUG
        setAdoptionMethod(method);
        setDropdownOpen(false);
        setError(''); 
    };

    const handleSelectAddress = (addressId) => {
        console.log("handleSelectAddress: Selected address ID:", addressId); // DEBUG
        setSelectedAddressId(addressId);
        setError(''); 
    };

    // --- RENDER LOGIC ---
    console.log("--- AdoptionStep1 Before Return ---", { loadingPet, error, petDetailsExists: !!petDetails }); // DEBUG: Check state before rendering

    if (loadingPet) return <div className="loading-message content">Đang tải thông tin thú cưng...</div>;
    if (error && !petDetails) return <div className="error-message content">{error}</div>; 
    if (!petDetails) return <div className="error-message content">Không có thông tin thú cưng để hiển thị.</div>; 

    const speciesIcon = petDetails.species === 'cat' ? catIconSmall : dogIconSmall;
    const canContinue = adoptionMethod && (adoptionMethod === 'direct' || (adoptionMethod === 'delivery' && selectedAddressId));
    const selectedAddressObject = adoptionMethod === 'delivery' ? addresses.find(a => a._id === selectedAddressId) : null;

    return (
    <main className="adoption-step-page step-1">
          <section className="breadcrumb">
              <div className="content">
                  <p className="paragraph-p3"><Link to="/">Trang chủ</Link></p>
                  <p className="paragraph-p3">&gt;</p>
                  <p className="paragraph-p3"><Link to="/adoption">Nhận nuôi</Link></p>
                  <p className="paragraph-p3">&gt;</p>
                  <p className="paragraph-p3"><Link to={`/adoption-detail/${petId}`}>{petDetails.name}</Link></p> 
                  <p className="paragraph-p3">&gt;</p>
                  <p className="paragraph-p3">Thực hiện nhận nuôi</p>
              </div>
          </section>
        
          <section className="intro"> 
              <div className="content">
                  <h1 className="heading-h54">Nhận nuôi</h1>
                  <p className="paragraph-p3">Hoàn tất các bước để đón {petDetails.name} về nhà!</p>
              </div>
          </section>
          
        <div className="content">
            <AdoptionStepsTracker currentStep={1} /> 
            <div className="step-detail">
                <h2 className="heading-h22">Bạn đang nhận nuôi:</h2>
                {/* Pet Info Display JSX */}
                <div className="adoption-info">
                    <img 
                        src={petDetails.images && petDetails.images.length > 0 ? `${backendUrl}/images/${petDetails.images[0]}` : `${backendUrl}/images/default-pet.jpg`} 
                        alt={petDetails.name} 
                        className="pet-image" 
                        onError={(e) => {e.target.onerror = null; e.target.src=`${backendUrl}/images/default-pet.jpg`}}
                     />
                    <div className="pet-summary">
                         <h3 className="pet-name heading-h18">
                            <img src={speciesIcon} alt={petDetails.species} /> {petDetails.name}
                         </h3>
                         <p className="paragraph-p4"><strong>Giống:</strong> {petDetails.breed}</p>
                         <p className="paragraph-p4"><strong>Tuổi:</strong> {petDetails.age}</p>
                         <p className="paragraph-p4"><strong>Giới tính:</strong> {petDetails.gender}</p>
                         <p className="paragraph-p4"><strong>Phí nhận nuôi:</strong> {formatCurrency(petDetails.adoptionFee)}</p>
                    </div>
                </div>

                {/* Adoption Method Selection JSX */}
                <div className="adoption-method">
                    <h3 className="heading-h18">Phương thức nhận nuôi</h3>
                    <div className="adoption-method-right">
                        <div className="custom-select">
                            <div className={`select-selected ${!adoptionMethod ? 'placeholder' : ''}`} onClick={() => setDropdownOpen(!isDropdownOpen)}>
                                {adoptionMethod === 'direct' && <span>Nhận nuôi trực tiếp</span>}
                                {adoptionMethod === 'delivery' && <span>Nhận nuôi tại nhà</span>}
                                {!adoptionMethod && <span className="option-select">Chọn phương thức</span>}
                                <svg className={`arrow ${isDropdownOpen ? 'open' : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="#ff5b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                            {/* === FIX CHO DROPDOWN === */}
                            <div className={`select-items ${isDropdownOpen ? 'show' : ''}`}>
                                <div className="select-item" onClick={() => handleSelectMethod('direct')}>
                                    <span className="title-select">Nhận nuôi trực tiếp</span><br />
                                    <span className="description-select">Bạn sẽ đến cơ sở FurEver để đón thú cưng.</span>
                                </div>
                                <div className="select-item" onClick={() => handleSelectMethod('delivery')}>
                                    <span className="title-select">Nhận nuôi tại nhà</span><br />
                                    <span className="description-select">FurEver vận chuyển thú cưng đến địa chỉ của bạn (có phí).</span>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
                {/* Direct Pickup Address JSX */}
                {adoptionMethod === 'direct' && (
                    <div className="adoption-address direct">
                       <h4 className="heading-h18"><img src={locationIcon} alt="location"/>Địa chỉ nhận nuôi trực tiếp:</h4>
                       <p className="heading-h18">Km10 Đ. Nguyễn Trãi, P. Mộ Lao, Hà Đông, Hà Nội</p>
                       <p className="paragraph-p4 note">Vui lòng liên hệ hotline 0123456789 để xác nhận thời gian đến nhận.</p>
                    </div>
                )}

                {/* Delivery Address Selection JSX */}
                {adoptionMethod === 'delivery' && (
                    <div className="adoption-address delivery">
                       <h4 className="heading-h18">Chọn địa chỉ giao hàng</h4>
                       {loadingAddresses && <p className="loading-message">Đang tải địa chỉ...</p>}
                       {!loadingAddresses && error && error.includes('địa chỉ') && <p className="status-message error">{error}</p>} 
                       {!loadingAddresses && addresses.length === 0 && (
                           <p className="paragraph-p3 empty-list-message">Bạn chưa có địa chỉ nào. <Link to={`/profile/${userInfo?._id}?tab=address`} className="add-link">Thêm địa chỉ ngay</Link></p>
                       )}
                       {addresses.length > 0 && (
                           <div className="address-selection-list">
                               {addresses.map((addr) => (
                                   <label key={addr._id} className={`address-radio-item ${selectedAddressId === addr._id ? 'selected' : ''}`}>
                                       <input
                                           type="radio"
                                           name="deliveryAddress"
                                           value={addr._id}
                                           checked={selectedAddressId === addr._id}
                                           onChange={() => handleSelectAddress(addr._id)}
                                       />
                                       <div className="address-content">
                                            <span className="address-name">{addr.fullName} | {addr.phone} {addr.isDefault && <span className="default-tag">(Mặc định)</span>}</span>
                                            <span className="address-details">{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`}</span>
                                       </div>
                                   </label>
                               ))}
                           </div>
                        )}
                        <div className="fee-container">
                            <span className="fee-adoption heading-h18" id="adoption-fee-display">
                                Phí vận chuyển: <strong>25.000 VNĐ</strong>
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Continue Button & Error Messages JSX */}
                <div className="continue-container">
                    <Link 
                        to={canContinue ? "/adoption-step-2" : '#'} 
                        state={{ 
                            adoptionMethod, 
                            selectedAddressId, 
                            selectedAddress: selectedAddressObject, 
                            petDetails 
                        }} 
                        className={`button button-primary continue-button ${!canContinue ? 'disabled' : ''}`}
                        onClick={(e) => {
                            if (!canContinue) {
                                e.preventDefault(); // Chặn chuyển trang

                                // Kiểm tra và hiển thị pop-up lỗi tương ứng
                                if (!adoptionMethod) {
                                    alert('Vui lòng chọn phương thức nhận nuôi.');
                                } else if (adoptionMethod === 'delivery' && !selectedAddressId) {
                                    if (addresses.length === 0) {
                                        alert('Bạn chưa có địa chỉ. Vui lòng thêm địa chỉ giao hàng để tiếp tục.');
                                    } else {
                                        alert('Vui lòng chọn địa chỉ giao hàng.');
                                    }
                                }
                            }
                        }} 
                        aria-disabled={!canContinue}
                    >
                        Tiếp tục
                    </Link>
                     
                     {/* === FIX LOGIC HIỂN THỊ LỖI === */}
                     
                </div>
            </div>
        </div>
    </main>
);
};

export default AdoptionStep1;

