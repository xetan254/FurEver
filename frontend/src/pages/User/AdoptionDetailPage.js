import React, { useState, useEffect, useContext } from 'react'; // Thêm useContext
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'; // Thêm useNavigate, useLocation
import axios from 'axios'; // Import axios
import  AuthContext  from '../../context/AuthContext';
// Import các hình ảnh cần thiết (icon)
import dogIconSmall from '../../assets/img/dog-icon-small.svg';
import catIconSmall from '../../assets/img/cat-icon.svg'; // Thêm icon mèo nếu có
import tickIcon from '../../assets/img/tick-icon.svg';
import xIcon from '../../assets/img/x-icon.svg';

// Import Component PetCard (để hiển thị thú cưng liên quan)
import PetCard from '../../components/PetCard';

// === HÀM HỖ TRỢ ===
// Định dạng ngày tháng (dd/mm/yyyy)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        console.error("Lỗi định dạng ngày:", e);
        return 'N/A';
    }
};

// Định dạng tiền tệ (thêm dấu chấm, hiển thị "Miễn phí")
const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'N/A';
    if (value === 0) return 'Miễn phí';
    try {
        return value.toLocaleString('vi-VN') + ' VNĐ';
    } catch (e) {
        console.error("Lỗi định dạng tiền tệ:", e);
        return 'N/A';
    }
};

// === COMPONENT CHÍNH ===
const AdoptionDetailPage = () => {
    // --- STATE MANAGEMENT ---
    const { id } = useParams(); // Lấy ID từ URL
    const [pet, setPet] = useState(null); // Thông tin chi tiết của thú cưng
    const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
    const [error, setError] = useState(null); // Lưu trữ lỗi nếu có
    const [relatedPets, setRelatedPets] = useState([]); // Danh sách thú cưng liên quan
    const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Index của ảnh đang hiển thị

    const { userInfo } = useContext(AuthContext); // Lấy 'user' (hoặc 'isAuthenticated') từ Context
    const navigate = useNavigate(); // Hook để điều hướng
    const location = useLocation();
    // --- LOGIC FETCH DỮ LIỆU ---

    // 1. Fetch dữ liệu chi tiết thú cưng dựa trên ID từ URL
    useEffect(() => {
        const fetchPetDetails = async () => {
            // Kiểm tra ID hợp lệ trước khi gọi API
            if (!id) {
                setError("ID thú cưng không hợp lệ.");
                setLoading(false);
                return;
            }

            setLoading(true); // Bắt đầu tải
            setError(null); // Reset lỗi cũ
            try {
                const { data } = await axios.get(`http://localhost:5000/api/pets/${id}`);
                // Nếu API trả về thành công nhưng không có dữ liệu
                if (!data) {
                    setError("Không tìm thấy thú cưng.");
                    setPet(null);
                } else {
                    setPet(data); // Lưu dữ liệu vào state
                    setSelectedImageIndex(0); // Reset về ảnh đầu tiên
                }
            } catch (err) {
                console.error("Lỗi khi tải chi tiết thú cưng:", err);
                // Xử lý lỗi cụ thể (ví dụ: 404 Not Found)
                if (err.response && err.response.status === 404) {
                    setError("Không tìm thấy thú cưng với ID này.");
                } else {
                    setError("Không thể tải thông tin thú cưng. Vui lòng thử lại.");
                }
                setPet(null); // Đảm bảo pet là null khi có lỗi
            } finally {
                setLoading(false); // Kết thúc tải (dù thành công hay lỗi)
            }
        };
        fetchPetDetails();
    }, [id]); // Phụ thuộc vào ID, fetch lại nếu ID thay đổi

    // 2. Fetch danh sách thú cưng liên quan (cùng loài, khác ID)
    useEffect(() => {
        const fetchRelatedPets = async () => {
            // Chỉ fetch khi đã có thông tin pet hiện tại và pet có ID
            if (!pet?._id) return;
            try {
                const { data } = await axios.get('http://localhost:5000/api/pets');
                // Lọc ra các thú cưng cùng loài, khác ID, lấy tối đa 3 con đầu
                const otherPets = data
                    .filter(p => p.species === pet.species && p._id !== pet._id)
                    .slice(0, 3);
                setRelatedPets(otherPets);
            } catch (error) {
                console.error("Lỗi khi tải thú cưng liên quan:", error);
                // Không set lỗi ở đây để tránh ghi đè lỗi fetch chính
            }
        };
        fetchRelatedPets();
    }, [pet]); // Phụ thuộc vào pet, fetch lại nếu pet thay đổi

    // --- HÀM XỬ LÝ CHUYỂN ẢNH ---
    const handleNextImage = () => {
        if (!pet || !pet.images || pet.images.length <= 1) return;
        setSelectedImageIndex((prevIndex) => (prevIndex + 1) % pet.images.length);
    };

    const handlePrevImage = () => {
        if (!pet || !pet.images || pet.images.length <= 1) return;
        setSelectedImageIndex((prevIndex) => (prevIndex - 1 + pet.images.length) % pet.images.length);
    };

    const handleThumbnailClick = (index) => {
        setSelectedImageIndex(index);
    };

        const handleAdoptClick = () => {
                if (!userInfo) {
                    navigate('/login', { state: { from: location.pathname } });
                } else {
                    navigate('/adoption-step', { state: { petId: pet._id } });
                }
            };

    // --- XỬ LÝ TRẠNG THÁI LOADING VÀ ERROR ---
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>Đang tải...</div>;
    }
    if (error) {
        return <div style={{ textAlign: 'center', padding: '50px', color: 'red', fontSize: '1.2rem' }}>{error}</div>;
    }
    if (!pet) {
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>Không tìm thấy thông tin thú cưng.</div>;
    }

    // --- CHUẨN BỊ DỮ LIỆU ĐỂ RENDER ---
    const speciesIcon = pet.species === 'cat' ? catIconSmall : dogIconSmall;
    const allImages = (pet.images && pet.images.length > 0) ? pet.images : ['default-pet.jpg'];
    const mainImage = `http://localhost:5000/images/${allImages[selectedImageIndex]}`;
    // Lấy tối đa 3 ảnh thumbnail
    const thumbnailImages = allImages.slice(0, 3); 

    // --- RENDER GIAO DIỆN ---
    return (
        // Sử dụng className chính của trang
        <main className="adoption-detail-page">
            <section className="breadcrumb">
                <div className="content">
                    {/* ... breadcrumb links ... */}
                    <p className="paragraph-p3"><Link to="/">Trang chủ</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3"><Link to="/adoption">Nhận nuôi</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3">{pet.name}</p>
                </div>
            </section>

            {/* Sử dụng class .intro của trang */}
            <section className="intro">
                 <div className="content">
                     <h1 className="heading-h54">Thông Tin Chi Tiết</h1>
                     <p className="paragraph-p3">
                         Tìm hiểu thêm về {pet.name} và quyết định xem bé có phù hợp với gia đình bạn không nhé!
                     </p>
                 </div>
            </section>

            {/* Profile Section với class .pet-profile */}
            <section className="pet-profile">
                {/* Sử dụng class .content bên trong */}
                <div className="content">
                    {/* Class .top-pet-profile cho phần ảnh và thông tin */}
                    <div className="top-pet-profile">

                        {/* Class .pet-images cho khối ảnh */}
                        <div className="pet-images">
                            {/* Class .main-image cho ảnh chính */}
                            <div className="main-image">
                                <img src={mainImage} alt={pet.name} />
                                {/* Có thể thêm nút prev/next vào đây nếu CSS của bạn hỗ trợ */}
                            </div>
                            {/* Class .sub-image-slider cho khu vực ảnh nhỏ */}
                            {allImages.length > 1 && (
                                <div className="sub-image-slider">
                                    <button onClick={handlePrevImage} className="prev" aria-label="Ảnh trước">
                                        {/* SVG Prev Icon */}
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
                                    </button>
                                    {/* Class .sub-image chứa các ảnh nhỏ */}
                                    <div className="sub-image">
                                        {thumbnailImages.map((img, index) => (
                                            <img
                                                key={index}
                                                src={`http://localhost:5000/images/${img}`}
                                                alt={`${pet.name} thumbnail ${index + 1}`}
                                                onClick={() => handleThumbnailClick(index)}
                                                // Thêm class active nếu cần style riêng cho ảnh đang chọn
                                                className={index === selectedImageIndex ? 'active' : ''}
                                                style={{ border: index === selectedImageIndex ? '2px solid #ff5b35' : '2px solid transparent' }} // Ví dụ style inline
                                            />
                                        ))}
                                    </div>
                                    <button onClick={handleNextImage} className="next" aria-label="Ảnh tiếp theo">
                                        {/* SVG Next Icon */}
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Class .pet-info cho khối thông tin */}
                        <div className="pet-info">
                            {/* Class .pet-name */}
                            <h2 className="pet-name heading-h40">
                                <img src={speciesIcon} alt={pet.species} />{pet.name}
                            </h2>
                            {/* Sử dụng class .paragraph-p3 cho các dòng thông tin */}
                            <p className="rescue-date paragraph-p3"><strong>Ngày cứu trợ:</strong> {formatDate(pet.rescueDate)}</p>
                            <p className="pet-gender paragraph-p3"><strong>Giới tính:</strong> {pet.gender || 'N/A'}</p>
                            <p className="pet-age paragraph-p3"><strong>Tuổi:</strong> {pet.age || 'N/A'}</p>
                            <p className="pet-breed paragraph-p3"><strong>Giống:</strong> {pet.breed || 'N/A'}</p>
                            {pet.color && <p className="pet-color paragraph-p3"><strong>Màu sắc:</strong> {pet.color}</p>}
                            {pet.weight && <p className="pet-weight paragraph-p3"><strong>Cân nặng:</strong> {pet.weight} kg</p>}
                            {pet.medicalHistory && <p className="pet-medical-history paragraph-p3"><strong>Tiền sử bệnh lý:</strong> {pet.medicalHistory}</p>}
                            <p className="pet-sterilization paragraph-p3">
                                <strong>Triệt sản:</strong> <img src={pet.sterilized ? tickIcon : xIcon} alt={pet.sterilized ? "Đã triệt sản" : "Chưa triệt sản"} />
                            </p>
                            <p className="pet-vaccination paragraph-p3">
                                <strong>Tiêm phòng:</strong> <img src={pet.vaccinated ? tickIcon : xIcon} alt={pet.vaccinated ? "Đã tiêm phòng" : "Chưa tiêm phòng"}/>
                            </p>
                            <p className="adoption-fee paragraph-p3"><strong>Phí nhận nuôi:</strong> {formatCurrency(pet.adoptionFee)}</p>
                            {/* Class .adopt-button */}
                            <button 
                                onClick={handleAdoptClick}
                                className="button button-primary adopt-button"
                            >
                                Nhận nuôi
                            </button>
                            {/* <Link 
                                to="/adoption-step" 
                                state={{ petId: pet._id }} 
                                className="button button-primary adopt-button"
                            >
                                Nhận nuôi {pet.name}
                            </Link> */}
                        </div>
                    </div>

                    {/* Class .pet-description */}
                    {pet.description && (
                        <div className="pet-description">
                           <h3 className="heading-h32">Mô tả chi tiết</h3>
                           <p className="paragraph-p3">{pet.description}</p>
                        </div>
                    )}

                    {/* Class .adopter-requirements */}
                     {pet.requirements && pet.requirements.length > 0 && (
                        <div className="adopter-requirements">
                            <h3 className="heading-h32">Yêu cầu chủ nuôi</h3>
                            <ul>
                                {pet.requirements.map((req, index) => (
                                    // Giữ class .paragraph-p3 nếu CSS yêu cầu
                                    <li key={index} className="paragraph-p3">{req}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </section>

            {/* Class .related-pets */}
            {relatedPets.length > 0 && (
                <section className="related-pets">
                   <h2 className="heading-h40">Xem thêm các bé cùng loài</h2>
                   {/* Class .slider-container */}
                   <div className="slider-container content">
                       {/* Class .slider */}
                       <div className="slider">
                           {relatedPets.map(relatedPet => (
                               <PetCard key={relatedPet._id} pet={relatedPet} />
                           ))}
                       </div>
                   </div>
                </section>
            )}
        </main>
    );
};

export default AdoptionDetailPage;

