import React from 'react';
import { Link } from 'react-router-dom';

// Import hình ảnh
import dogIconSmall from '../assets/img/dog-icon-small.svg';
import xIcon from '../assets/img/x-icon.svg';
import tickIcon from '../assets/img/tick-icon.svg';

// QUAN TRỌNG: Import file CSS mới mà chúng ta sẽ tạo
import './PetCard.css'; 

const PetCard = ({ pet }) => {
    const imageUrl = pet.images && pet.images.length > 0
        ? `http://localhost:5000/images/${pet.images[0]}`
        : `http://localhost:5000/images/default-pet.jpg`;

    return (
        // Đã đổi tên class
        <Link to={`/adoption-detail/${pet._id}`} className="iso-pet-card">
            
            {/* Đã đổi tên class */}
            <img 
              src={imageUrl} 
              alt={pet.name}
              className="iso-pet-image" 
            />
            
            {/* Đã đổi tên class */}
            <div className="iso-pet-name">
                <img src={dogIconSmall} alt="dog icon" />
                {/* Giữ lại utility class heading-h22 của bạn */}
                <h3 className="heading-h22">{pet.name}</h3>
            </div>
            
            {/* Đã đổi tên class */}
            <div className="iso-pet-details">

                {/* Giá */}
                <div className="iso-info-row">
                    {/* Giữ lại utility class paragraph-p4 */}
                    <p className="paragraph-p4"><strong>Giá: </strong>{(pet.adoptionFee || 0).toLocaleString('vi-VN')} VNĐ</p>
                </div>
                
                {/* Giới tính */}
                <div className="iso-info-row">
                    <p className="paragraph-p4"><strong>Giới tính: </strong>{pet.gender}</p>
                </div>
                
                {/* Tuổi */}
                <div className="iso-info-row">
                    <p className="paragraph-p4"><strong>Tuổi: </strong>{pet.age}</p>
                </div>
                
                {/* Tiêm phòng */}
                <div className="iso-info-row">
                    <p className="paragraph-p4"><strong>Tiêm phòng: </strong></p>
                    <img src={pet.vaccinated ? tickIcon : xIcon} alt="vaccination status" />
                </div>
                
                {/* Triệt sản */}
                <div className="iso-info-row">
                    <p className="paragraph-p4"><strong>Triệt sản: </strong></p>
                    <img src={pet.sterilized ? tickIcon : xIcon} alt="sterilization status" />
                </div>
                
                {/* Giống */}
                <div className="iso-info-row">
                    <p className="paragraph-p4"><strong>Giống: </strong>{pet.breed}</p>
                </div>
            </div>
        </Link>
    );
};

export default PetCard;