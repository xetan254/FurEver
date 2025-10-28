import React, { useState, useEffect } from 'react';
import { Link,useLocation } from 'react-router-dom';
import axios from 'axios';
import PetCard from '../../components/PetCard';
import Pagination from '../../components/Pagination';
import searchIcon from '../../assets/img/search-icon.svg';
function useQuery() {
    return new URLSearchParams(useLocation().search);
}
const AdoptionPage = () => {
    // --- STATE MANAGEMENT ---
    const [allPets, setAllPets] = useState([]); // Danh sách gốc từ API
    const [filteredPets, setFilteredPets] = useState([]); // Danh sách sau khi lọc/sắp xếp
    const [searchTerm, setSearchTerm] = useState(''); // State cho thanh tìm kiếm
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    // State cho Sắp xếp
    const [sortConfig, setSortConfig] = useState({ key: 'rescueDate', direction: 'desc' });
    
    // State cho Lọc chi tiết
    const initialFilters = { species: [], gender: [], age: [], adoptionFee: [], vaccinated: [], sterilized: [] };
    const [filters, setFilters] = useState(initialFilters);
    const [showFilters, setShowFilters] = useState(false); // State để ẩn/hiện bộ lọc
    // 2. Sử dụng hook để đọc URL
    const query = useQuery();

    // 3. Cập nhật useEffect để tự động lọc khi có tham số từ URL
    useEffect(() => {
        const fetchAllPets = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/pets');
                if (Array.isArray(data)) {
                    setAllPets(data);
                    
                    // KIỂM TRA VÀ ÁP DỤNG BỘ LỌC TỪ URL
                    const speciesFromUrl = query.get('species');
                    if (speciesFromUrl === 'dog' || speciesFromUrl === 'cat') {
                        // Cập nhật state của bộ lọc
                        setFilters(prevFilters => ({
                            ...prevFilters,
                            species: [speciesFromUrl] 
                        }));
                    }
                }
            } catch (err) {
                // ... xử lý lỗi
            } finally {
                setLoading(false);
            }
        };
        fetchAllPets();
    }, []); // Chỉ chạy 1 lần khi tải trang
    
    // --- DATA FETCHING & LOGIC ---

    // 1. Lấy tất cả thú cưng 1 lần khi tải trang
    useEffect(() => {
        const fetchAllPets = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/pets');
                if (Array.isArray(data)) {
                    setAllPets(data);
                    setFilteredPets(data); // Khởi tạo danh sách hiển thị
                }
            } catch (err) {
                setError('Không thể tải danh sách thú cưng.');
                console.error("Lỗi khi tải thú cưng:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllPets();
    }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

    // Hàm hỗ trợ so sánh tuổi (tính theo tháng)
    const getAgeInMonths = (ageString) => {
        if (!ageString) return 0;
        const parts = ageString.toLowerCase().split(' ');
        const value = parseInt(parts[0], 10);
        if (isNaN(value)) return 0;
        if (parts.includes('năm') || parts.includes('year')) return value * 12;
        return value;
    };

    // 2. useEffect trung tâm: Chạy lại mỗi khi Tìm kiếm, Lọc, hoặc Sắp xếp thay đổi
    useEffect(() => {
        let results = [...allPets];

        // Bước A: Lọc theo từ khóa tìm kiếm (real-time)
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            results = results.filter(pet =>
                pet.name.toLowerCase().includes(lowercasedTerm) ||
                pet.breed.toLowerCase().includes(lowercasedTerm) ||
                pet.species.toLowerCase().includes(lowercasedTerm)
            );
        }

        // Bước B: Lọc theo tiêu chí chi tiết (checkbox)
        if (filters.species.length > 0) results = results.filter(pet => filters.species.includes(pet.species));
        if (filters.gender.length > 0) results = results.filter(pet => filters.gender.includes(pet.gender));
        if (filters.vaccinated.length > 0) results = results.filter(pet => filters.vaccinated.includes(String(pet.vaccinated)));
        if (filters.sterilized.length > 0) results = results.filter(pet => filters.sterilized.includes(String(pet.sterilized)));
        
        if (filters.age.length > 0) {
            results = results.filter(pet => {
                const ageInMonths = getAgeInMonths(pet.age);
                return filters.age.some(range => {
                    const [min, max] = range.split('-').map(val => val === 'Infinity' ? Infinity : Number(val));
                    return ageInMonths >= min && ageInMonths < max;
                });
            });
        }
        
        if (filters.adoptionFee.length > 0) {
            results = results.filter(pet => {
                return filters.adoptionFee.some(range => {
                    const [min, max] = range.split('-').map(val => val === 'Infinity' ? Infinity : Number(val));
                    return pet.adoptionFee >= min && pet.adoptionFee < max;
                });
            });
        }

        // Bước C: Sắp xếp danh sách
        if (sortConfig.key) {
            results.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];
                if (sortConfig.key === 'age') {
                    valA = getAgeInMonths(a.age);
                    valB = getAgeInMonths(b.age);
                }
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFilteredPets(results);
        setCurrentPage(1); // Quay về trang 1 sau mỗi lần lọc/sắp xếp
    }, [allPets, searchTerm, filters, sortConfig]);

    // --- EVENT HANDLERS ---

    // Xử lý thay đổi Sắp xếp (dropdown)
    const handleSortChange = (e) => {
        const [key, direction] = e.target.value.split('-');
        setSortConfig({ key, direction });
    };

    // Xử lý thay đổi Lọc (checkbox)
    const handleFilterChange = (e) => {
        const { name, value, checked } = e.target;
        setFilters(prev => {
            const currentValues = prev[name] || [];
            if (checked) {
                return { ...prev, [name]: [...currentValues, value] };
            } else {
                return { ...prev, [name]: currentValues.filter(item => item !== value) };
            }
        });
    };

    // --- RENDER HELPERS ---

    // === SỬA HÀM HELPER CHECKBOX ===
    // Helper tạo checkbox KHỚP VỚI CSS MỚI CỦA BẠN
    const createCheckbox = (name, value, label) => (
        <label className="option-container"> {/* Class từ CSS mới */}
            {label}
            <input
                type="checkbox"
                name={name}
                value={value}
                checked={filters[name]?.includes(value) || false}
                onChange={handleFilterChange}
            />
            <span className="checkmark"></span> {/* Class từ CSS mới */}
        </label>
    );

    // Logic phân trang
    const petsPerPage = 9;
    const indexOfLastPet = currentPage * petsPerPage;
    const indexOfFirstPet = indexOfLastPet - petsPerPage;
    const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);
    const totalPages = Math.ceil(filteredPets.length / petsPerPage);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;

    // --- RENDER ---
    return (
        <main className="adoption-page">
            <section className="breadcrumb">
                <div className="content">
                    <p className="paragraph-p3"><Link to="/">Trang chủ</Link> &gt; Nhận nuôi</p>
                </div>
            </section>
            <section className="intro">
                <div className="content">
                    <h1 className="heading-h54">Nhận nuôi</h1>
                    <p className="paragraph-p3">Tìm kiếm vật nuôi yêu thích của bạn đơn giản hơn bao giờ hết với FurEver</p>
                </div>
            </section>

            <div className="search-container-filter">
                <form onSubmit={(e) => e.preventDefault()} className="search-container">
                    <div className="search-box">
                        <input type="text" placeholder="Tìm kiếm theo tên, giống loài..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} />
                        <button type="submit" className="search-icon"><img src={searchIcon} alt="Search" /></button>
                    </div>
                </form>
                {/* Nút bật/tắt bộ lọc */}
                <button className={`filter-toggle-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
            </div>

            <div className="content">
                
                {/* === SỬA GIAO DIỆN BỘ LỌC === */}
                {/* Sử dụng class .filter-form và .hidden */}
                <div className={`filter-form ${!showFilters ? 'hidden' : ''}`}> 
                    {/* Sử dụng cấu trúc .filter-group, .filter-label, .filter-options */}
                    <div className="filter-group">
                        <span className="filter-label">Loài</span>
                        <div className="filter-options">
                            {createCheckbox('species', 'dog', 'Chó')}
                            {createCheckbox('species', 'cat', 'Mèo')}
                        </div>
                    </div>

                    <div className="filter-group">
                        <span className="filter-label">Giới tính</span>
                        <div className="filter-options">
                            {createCheckbox('gender', 'Đực', 'Đực')}
                            {createCheckbox('gender', 'Cái', 'Cái')}
                        </div>
                    </div>

                    <div className="filter-group">
                        <span className="filter-label">Tuổi</span>
                        <div className="filter-options">
                            {createCheckbox('age', '0-3', '< 3 tháng')}
                            {createCheckbox('age', '3-6', '3-6 tháng')}
                            {createCheckbox('age', '6-12', '6-12 tháng')}
                            {createCheckbox('age', '12-Infinity', '> 1 năm')}
                        </div>
                    </div>
                    
                    <div className="filter-group">
                        <span className="filter-label">Phí nhận nuôi</span>
                        <div className="filter-options">
                            {createCheckbox('adoptionFee', '0-500000', 'Dưới 500.000')}
                            {createCheckbox('adoptionFee', '500000-2000000', '500.000 - 2 triệu')}
                            {createCheckbox('adoptionFee', '2000000-Infinity', 'Trên 2 triệu')}
                        </div>
                    </div>
                    
                    <div className="filter-group">
                        <span className="filter-label">Sức khỏe</span>
                        <div className="filter-options">
                            {createCheckbox('vaccinated', 'true', 'Đã tiêm phòng')}
                            {createCheckbox('vaccinated', 'false', 'Chưa tiêm phòng')}
                            {createCheckbox('sterilized', 'true', 'Đã triệt sản')}
                            {createCheckbox('sterilized', 'false', 'Chưa triệt sản')}
                        </div>
                    </div>

                    {/* Sử dụng class nút bấm .filter-button */}
                    {/* (Loại bỏ nút Đặt lại và chỉ giữ nút Áp dụng theo CSS) */}
                     <div className="filter-actions"> 
                            <button onClick={() => setFilters(initialFilters)} className="btn-reset">Đặt lại</button>
                            <button onClick={() => setShowFilters(false)} className="btn-apply">Xem {filteredPets.length} kết quả</button>
                        </div>
                </div>
                {/* === KẾT THÚC BỘ LỌC === */}


                {/* Thanh Sắp xếp và Kết quả */}
                <div className="results-and-sort-container">
                    <p className="search-results-info">
                        Hiển thị <strong>{currentPets.length}</strong> trên tổng số <strong>{filteredPets.length}</strong> kết quả
                    </p>
                    <div className="sort-bar">
                        <span className="sort-label">Sắp xếp theo</span>
                        <select className="sort-dropdown" onChange={handleSortChange} defaultValue="rescueDate-desc">
                            <option value="rescueDate-desc">Ngày cứu trợ (Mới nhất)</option>
                            <option value="rescueDate-asc">Ngày cứu trợ (Cũ nhất)</option>
                            <option value="name-asc">Thứ tự chữ cái (A-Z)</option>
                            <option value="name-desc">Thứ tự chữ cái (Z-A)</option>
                            <option value="age-asc">Tuổi (Tăng dần)</option>
                            <option value="age-desc">Tuổi (Giảm dần)</option>
                            <option value="adoptionFee-asc">Phí nhận nuôi (Thấp - Cao)</option>
                            <option value="adoptionFee-desc">Phí nhận nuôi (Cao - Thấp)</option>
                        </select>
                    </div>
                </div>

                {/* Danh sách thú cưng */}
                <div className="pet-lists">
                    <div className="pet-container">
                        <div className="pet-cards">
                            {currentPets.length > 0 ? (
                                currentPets.map(pet => <PetCard key={pet._id} pet={pet} />)
                            ) : (
                                <p>Không tìm thấy thú cưng nào phù hợp với tiêu chí của bạn.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Phân trang */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </main>
    );
};

export default AdoptionPage;

