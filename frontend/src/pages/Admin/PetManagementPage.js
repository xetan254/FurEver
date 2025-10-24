import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import PetFormModal from '../../components/PetFormModal';
import AuthContext from '../../context/AuthContext';
// import './PetManagementPage.css';
import './ManagementPage.css'; // THAY ĐỔI IMPORT
import searchIcon from '../../assets/img/search-icon.svg';


const EditIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#ff5b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#ff5b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const DeleteIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6H5H21" stroke="#ff5b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#ff5b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
// --- HÀM HỖ TRỢ LOGIC LỌC ---
const getAgeInMonths = (ageString) => {
    if (!ageString || typeof ageString !== 'string') return 0;
    const parts = ageString.toLowerCase().split(' ');
    const value = parseInt(parts[0], 10);
    if (isNaN(value)) return 0;
    if (parts.includes('năm') || parts.includes('year')) return value * 12;
    return value;
};

const PetManagementPage = () => {
    // State để điều khiển việc ẩn/hiện bộ lọc
    // const [showFilter, setShowFilter] = useState(false);

    // const [allPets, setAllPets] = useState([]);
    // const [displayPets, setDisplayPets] = useState([]);
    const timeSince = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " năm trước";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " tháng trước";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " ngày trước";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " giờ trước";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " phút trước";
        return "Vừa xong";
    };
    // State cho các giá trị filter
    const initialFilters = {
        species: [], gender: [], adoptionFee: [], age: [], 
        vaccinated: [], sterilized: []
    };
    // const [filters, setFilters] = useState(initialFilters);
    //state Sort
    const defaultSortConfig = { key: null, direction: 'asc' };
    const [sortConfig, setSortConfig] = useState(defaultSortConfig);
    // Các state khác
    const [showFilter, setShowFilter] = useState(false);
    const [allPets, setAllPets] = useState([]);
    const [displayPets, setDisplayPets] = useState([]);
    const [filters, setFilters] = useState({ species: [], gender: [], adoptionFee: [], age: [], vaccinated: [], sterilized: [] });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPet, setCurrentPet] = useState(null);
    const { userInfo } = useContext(AuthContext);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const petsPerPage = 9;
    // --- LOGIC LẤY VÀ HIỂN THỊ DỮ LIỆU ---

    const fetchPets = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/pets');
            setAllPets(data);
        } catch (error) { 
            console.error("Lỗi khi tải danh sách thú cưng:", error); 
        }
    };

    // Lấy danh sách pet khi component được mount lần đầu
    useEffect(() => { 
        fetchPets(); 
    }, []);

    // Lọc, tìm kiếm, và sắp xếp lại danh sách mỗi khi có sự thay đổi
    useEffect(() => {
        let results = [...allPets];

        // Tìm kiếm
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            results = results.filter(pet =>
                pet.name.toLowerCase().includes(lowercasedTerm) ||
                pet.breed.toLowerCase().includes(lowercasedTerm)
            );
        }

        // Lọc theo checkbox
        if (filters.species.length > 0) results = results.filter(pet => filters.species.includes(pet.species));
        if (filters.gender.length > 0) results = results.filter(pet => filters.gender.includes(pet.gender));
        if (filters.vaccinated.length > 0) results = results.filter(pet => filters.vaccinated.includes(String(pet.vaccinated)));
        if (filters.sterilized.length > 0) results = results.filter(pet => filters.sterilized.includes(String(pet.sterilized)));

        if (filters.adoptionFee.length > 0) {
            results = results.filter(pet => {
                return filters.adoptionFee.some(range => {
                    const [min, max] = range.split('-').map(Number);
                    return pet.adoptionFee >= min && pet.adoptionFee < max;
                });
            });
        }
        
        if (filters.age.length > 0) {
            results = results.filter(pet => {
                const ageInMonths = getAgeInMonths(pet.age);
                return filters.age.some(range => {
                    const [min, max] = range.split('-').map(Number);
                    return ageInMonths >= min && ageInMonths < max;
                });
            });
        }

        // Sắp xếp
        if (sortConfig.key) {
            results.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setDisplayPets(results);
        setCurrentPage(1); // Quay về trang đầu tiên sau mỗi lần lọc
    }, [allPets, filters, sortConfig, searchTerm]);
    
    // --- CÁC HÀM XỬ LÝ SỰ KIỆN (Handlers) ---

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
    
    const handleMainReset = () => {
        setFilters(initialFilters);
        setSearchInput('');
        setSearchTerm('');
        setSortConfig(defaultSortConfig);
    };
    const requestSort = (key) => { 
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' })); 
    };

    // --- XỬ LÝ MODAL (Thêm/Sửa) ---
    
    const handleOpenModal = (pet = null) => { 
        setCurrentPet(pet); 
        setIsModalOpen(true); 
    };

    const handleCloseModal = () => { 
        setIsModalOpen(false); 
        setCurrentPet(null); 
    };

    /**
     * Gửi request Thêm mới hoặc Cập nhật thông tin thú cưng.
     * @param {FormData} formData - Dữ liệu từ form modal.
     */
    const handleSavePet = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${userInfo.token}`, // Gửi token để xác thực
            },
        };

        try {
            if (currentPet) {
                // Chế độ Sửa (PUT request)
                const { data } = await axios.put(`http://localhost:5000/api/pets/${currentPet._id}`, formData, config);
                setAllPets(allPets.map((p) => (p._id === data._id ? data : p))); // Cập nhật pet trong danh sách
            } else {
                // Chế độ Thêm mới (POST request)
                const { data } = await axios.post('http://localhost:5000/api/pets', formData, config);
                setAllPets([data, ...allPets]); // Thêm pet mới vào đầu danh sách
            }
            handleCloseModal(); // Đóng modal sau khi thành công
        } catch (error) {
            console.error('Lỗi khi lưu thú cưng:', error.response ? error.response.data : error.message);
            alert('Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    };

    /**
     * Gửi request Xóa một thú cưng.
     * @param {string} petId - ID của thú cưng cần xóa.
     */
    const handleDeletePet = async (petId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thú cưng này không? Hành động này không thể hoàn tác.')) {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`, // Gửi token để xác thực
                },
            };

            try {
                await axios.delete(`http://localhost:5000/api/pets/${petId}`, config);
                setAllPets(allPets.filter((p) => p._id !== petId)); // Xóa pet khỏi danh sách
            } catch (error) {
                console.error('Lỗi khi xóa thú cưng:', error.response ? error.response.data : error.message);
                alert('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        }
    };

    // --- CÁC HÀM HỖ TRỢ HIỂN THỊ (Helpers & Pagination) ---

    const createCheckbox = (name, value, label) => (
        <label className="checkbox-label">
            <input
                type="checkbox"
                name={name}
                value={value}
                checked={filters[name]?.includes(value) || false}
                onChange={handleFilterChange}
            />
            <span className="custom-checkbox"></span> {label}
        </label>
    );

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

    // Logic phân trang
    const indexOfLastPet = currentPage * petsPerPage;
    const indexOfFirstPet = indexOfLastPet - petsPerPage;
    const currentPets = displayPets.slice(indexOfFirstPet, indexOfLastPet);
    const totalPages = Math.ceil(displayPets.length / petsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    // --- RENDER COMPONENT ---

    return (
        <div className="page-container"> {/* THAY ĐỔI CLASS */}
            <div className="page-header"> {/* THAY ĐỔI CLASS */}
                <div className="page-header-group"> {/* THAY ĐỔI CLASS */}
                    <div className="search-bar"> {/* THAY ĐỔI CLASS */}
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên, giống loài" 
                            value={searchInput} 
                            onChange={(e) => setSearchInput(e.target.value)} 
                            onKeyDown={(e) => { if (e.key === 'Enter') setSearchTerm(searchInput); }}
                        />
                        <button className="search-btn" onClick={() => setSearchTerm(searchInput)}>
                            <img src={searchIcon} alt="Search" />
                        </button>
                    </div>
                    <button className={`filter-toggle-btn ${showFilter ? 'active' : ''}`} onClick={() => setShowFilter(!showFilter)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke={showFilter ? "#FFF" : "#ff5b35"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div className="page-actions"> {/* THAY ĐỔI CLASS */}
                    <button className="action-btn-secondary" onClick={() => { handleMainReset() }}>Làm mới</button>
                    <button className="action-btn-primary" onClick={() => setIsModalOpen(true)}>+ Thêm thú cưng mới</button>
                </div>
            </div>

            {showFilter && (
                <div className="filter-form-container">
                    <div className="filter-grid">
                        <label className="group-label">Loài</label>
                        <div className="options">{createCheckbox('species', 'dog', 'Chó')} {createCheckbox('species', 'cat', 'Mèo')}</div>
                        <label className="group-label">Giới tính</label>
                        <div className="options">{createCheckbox('gender', 'Đực', 'Đực')} {createCheckbox('gender', 'Cái', 'Cái')}</div>
                        <label className="group-label">Phí nhận nuôi</label>
                        <div className="options">
                            {createCheckbox('adoptionFee', '0-500000', 'Dưới 500.000')}
                            {createCheckbox('adoptionFee', '500000-2000000', '500.000 - 2.000.000')}
                            {createCheckbox('adoptionFee', '2000000-Infinity', 'Trên 2.000.000')}
                        </div>
                        <label className="group-label">Tuổi</label>
                        <div className="options">
                            {createCheckbox('age', '0-3', 'Dưới 3 tháng')}
                            {createCheckbox('age', '3-6', '3-6 tháng')}
                            {createCheckbox('age', '6-12', '6-12 tháng')}
                            {createCheckbox('age', '12-Infinity', 'Trên 1 năm')}
                        </div>
                        <label className="group-label">Tiêm phòng</label>
                        <div className="options">{createCheckbox('vaccinated', 'true', 'Rồi')} {createCheckbox('vaccinated', 'false', 'Chưa')}</div>
                        <label className="group-label">Triệt sản</label>
                        <div className="options">{createCheckbox('sterilized', 'true', 'Rồi')} {createCheckbox('sterilized', 'false', 'Chưa')}</div>
                    </div>
                    <div className="filter-actions">
                        <button type="button" onClick={() => setFilters(initialFilters)} className="btn-reset">Đặt lại</button>
                        <button type="button" onClick={() => setShowFilter(false)} className="btn-apply">Áp dụng</button>
                    </div>
                </div>
            )}

            <div className="pm-sorters">
                <span>Sắp xếp theo</span>
                <div className="sorter-buttons">
                    <button onClick={() => requestSort('name')} className={sortConfig.key === 'name' ? 'active' : ''}>Thứ tự chữ cái {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</button>
                    <button onClick={() => requestSort('rescueDate')} className={sortConfig.key === 'rescueDate' ? 'active' : ''}>Ngày cứu trợ {sortConfig.key === 'rescueDate' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</button>
                    <button onClick={() => requestSort('age')} className={sortConfig.key === 'age' ? 'active' : ''}>Tuổi {sortConfig.key === 'age' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</button>
                    <button onClick={() => requestSort('adoptionFee')} className={sortConfig.key === 'adoptionFee' ? 'active' : ''}>Phí nhận nuôi {sortConfig.key === 'adoptionFee' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</button>
                </div>
            </div>
            
            <div className="pm-pet-list">
                {currentPets.map((pet) => (
                    <div className="pm-pet-card" key={pet._id}>
                        <img 
                            src={`http://localhost:5000/images/${pet.images[0] || 'default-pet.jpg'}`} 
                            alt={pet.name} 
                            className="pm-pet-image" 
                        />
                        <div className="pm-pet-content">
                            <div className="pm-pet-header">
                                <h4>{pet.name}</h4>
                                <span className="pm-pet-timestamp">{timeSince(pet.rescueDate)}</span>
                            </div>
                            <div className="pm-pet-details">
                                <p><strong>Giới tính:</strong> {pet.gender}</p>
                                <p><strong>Giống:</strong> {pet.breed}</p>
                                <p><strong>Ngày cứu trợ:</strong> {formatDate(pet.rescueDate)}</p>
                            </div>
                            <div className="pm-pet-actions">
                                <button onClick={() => handleOpenModal(pet)} title="Chỉnh sửa">
                                    <EditIcon />
                                </button>
                                <button onClick={() => handleDeletePet(pet._id)} title="Xóa">
                                    <DeleteIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {displayPets.length > 0 && (
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i + 1} onClick={() => paginate(i + 1)} className={currentPage === i + 1 ? 'active' : ''}>
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
            
            {displayPets.length === 0 && (
                <div className="pm-no-results">
                    <p>Không tìm thấy thú cưng nào phù hợp.</p>
                </div>
            )}

            {isModalOpen && <PetFormModal pet={currentPet} onSave={handleSavePet} onClose={handleCloseModal} />}
        </div>
    );
};

export default PetManagementPage;