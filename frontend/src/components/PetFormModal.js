import React, { useState, useEffect } from 'react';
import './PetFormModal.css';

// --- CÁC HÀM HỖ TRỢ ĐỊNH DẠNG SỐ ---

// Hàm để định dạng số thành chuỗi có dấu chấm (1000000 -> "1.000.000")
const formatNumber = (value) => {
    if (!value) return '';
    // Xóa các ký tự không phải số, sau đó thêm dấu chấm
    return value.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Hàm để chuyển chuỗi có dấu chấm về lại chuỗi số ("1.000.000" -> "1000000")
const parseNumber = (value) => {
    if (!value) return '';
    return value.toString().replace(/\./g, "");
};


// --- COMPONENT CHÍNH ---

const PetFormModal = ({ pet, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '', rescueDate: '', age: '', breed: '',
        color: '', weight: '', medicalHistory: '', adoptionFee: '',
        species: 'dog', gender: 'Đực', vaccinated: 'false', sterilized: 'false',
        description: '', requirements: '', status: 'available'
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        if (pet) {
            const formattedDate = pet.rescueDate ? new Date(pet.rescueDate).toISOString().split('T')[0] : '';
            setFormData({
                name: pet.name || '',
                rescueDate: formattedDate,
                age: pet.age || '',
                breed: pet.breed || '',
                color: pet.color || '',
                weight: pet.weight || '',
                medicalHistory: pet.medicalHistory || '',
                adoptionFee: pet.adoptionFee || '',
                species: pet.species || 'dog',
                gender: pet.gender || 'Đực',
                vaccinated: String(pet.vaccinated),
                sterilized: String(pet.sterilized),
                description: pet.description || '',
                requirements: Array.isArray(pet.requirements) ? pet.requirements.join(', ') : '',
                status: pet.status || 'available',
            });
            if (pet.images && pet.images.length > 0) {
                setImagePreviews(pet.images.map(img => `http://localhost:5000/images/${img}`));
            }
        }
    }, [pet]);

    // Xử lý thay đổi cho hầu hết các input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // Xử lý thay đổi RIÊNG cho ô phí nhận nuôi để định dạng
    const handleFeeChange = (e) => {
        const rawValue = parseNumber(e.target.value);
        // Chỉ cho phép nhập số và cập nhật state
        if (!isNaN(rawValue)) {
            setFormData(prev => ({ ...prev, adoptionFee: rawValue }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
        const newImagePreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(newImagePreviews);
    };
    
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
        };
    }, [imagePreviews]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = new FormData();
        for (const key in formData) {
            dataToSubmit.append(key, formData[key]);
        }
        if (imageFiles.length > 0) {
            for (let i = 0; i < imageFiles.length; i++) {
                dataToSubmit.append('images', imageFiles[i]);
            }
        }
        onSave(dataToSubmit);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content new-design">
                <h2>{pet ? 'Chỉnh sửa thú cưng' : 'Thêm thú cưng mới'}</h2>
                <form onSubmit={handleSubmit} className="pet-form">
                    <div className="form-grid">
                        <div className="form-column">
                            <div className="form-group"><label>Tên</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Tuổi</label><input type="text" name="age" value={formData.age} onChange={handleChange} /></div>
                            <div className="form-group"><label>Màu sắc</label><input type="text" name="color" value={formData.color} onChange={handleChange} /></div>
                            <div className="form-group"><label>Tiền sử bệnh lý</label><input type="text" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} /></div>
                        </div>
                        <div className="form-column">
                            <div className="form-group"><label>Ngày cứu hộ</label><input type="date" name="rescueDate" value={formData.rescueDate} onChange={handleChange} /></div>
                            <div className="form-group"><label>Giống</label><input type="text" name="breed" value={formData.breed} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Cân nặng (kg)</label><input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} /></div>
                            <div className="form-group">
                                <label>Phí nhận nuôi</label>
                                <div className="input-with-unit">
                                    <input 
                                        type="text" // Đổi type thành "text"
                                        name="adoptionFee" 
                                        value={formatNumber(formData.adoptionFee)} // Hiển thị giá trị đã định dạng
                                        onChange={handleFeeChange} // Dùng hàm xử lý riêng
                                        placeholder="Nhập số tiền" 
                                        required 
                                    />
                                    <span>VND</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-radio-section">
                        <label className="group-label">Loài</label>
                        <div className="options">
                            <label className="radio-label"><input type="radio" name="species" value="dog" checked={formData.species === 'dog'} onChange={handleChange}/><span className="custom-radio"></span> Chó</label>
                            <label className="radio-label"><input type="radio" name="species" value="cat" checked={formData.species === 'cat'} onChange={handleChange}/><span className="custom-radio"></span> Mèo</label>
                        </div>
                        
                        <label className="group-label">Giới tính</label>
                        <div className="options">
                            <label className="radio-label"><input type="radio" name="gender" value="Đực" checked={formData.gender === 'Đực'} onChange={handleChange}/><span className="custom-radio"></span> Đực</label>
                            <label className="radio-label"><input type="radio" name="gender" value="Cái" checked={formData.gender === 'Cái'} onChange={handleChange}/><span className="custom-radio"></span> Cái</label>
                        </div>

                        <label className="group-label">Tiêm phòng</label>
                        <div className="options">
                            <label className="radio-label"><input type="radio" name="vaccinated" value="true" checked={formData.vaccinated === 'true'} onChange={handleChange}/><span className="custom-radio"></span> Rồi</label>
                            <label className="radio-label"><input type="radio" name="vaccinated" value="false" checked={formData.vaccinated === 'false'} onChange={handleChange}/><span className="custom-radio"></span> Chưa</label>
                        </div>

                        <label className="group-label">Triệt sản</label>
                        <div className="options">
                            <label className="radio-label"><input type="radio" name="sterilized" value="true" checked={formData.sterilized === 'true'} onChange={handleChange}/><span className="custom-radio"></span> Rồi</label>
                            <label className="radio-label"><input type="radio" name="sterilized" value="false" checked={formData.sterilized === 'false'} onChange={handleChange}/><span className="custom-radio"></span> Chưa</label>
                        </div>
                    </div>
                    
                    <div className="form-group"><label>Mô tả</label><textarea name="description" value={formData.description} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Yêu cầu cho chủ nuôi</label><textarea name="requirements" value={formData.requirements} onChange={handleChange} placeholder="VD: Có sân vườn (cách nhau bởi dấu phẩy)"/></div>
                    
                  <div className="form-group">
    <label>Ảnh</label>
    <div className="image-upload-container">
        {/* Nút bấm để chọn ảnh */}
        <div className="image-upload-box">
            <input 
                type="file" 
                id="imageUpload" 
                name="images" 
                onChange={handleFileChange} 
                multiple 
                accept="image/*" 
            />
            <label htmlFor="imageUpload" className="upload-label">+</label>
        </div>
        
        {/* Hiển thị các ảnh đã chọn ngay tại đây */}
        {imagePreviews.map((previewUrl, index) => (
            <img 
                key={index} 
                src={previewUrl} 
                alt={`Xem trước ${index + 1}`} 
                className="image-preview" 
            />
        ))}
    </div>
</div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel new-design">Hủy</button>
                        <button type="submit" className="btn-save new-design">Hoàn thành</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PetFormModal;