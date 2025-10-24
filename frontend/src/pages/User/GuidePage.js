import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Import hình ảnh
import guide1 from '../../assets/img/guide-1.png';
import guide2 from '../../assets/img/guide-2.png';
import aboutUs1 from '../../assets/img/about-us1.png';
import guide4 from '../../assets/img/guide-4.png';
import guide5 from '../../assets/img/guide-5.png';
import guide6 from '../../assets/img/guide-6.png';

const slideData = [
    { img: guide1, title: 'Tìm kiếm bé yêu', text: 'Hãy bắt đầu hành trình tìm kiếm người bạn bốn chân của bạn tại FurEver...' },
    { img: guide2, title: 'Đọc thông tin', text: 'Sau khi tìm thấy bé yêu tiềm năng, hãy dành thời gian đọc kỹ thông tin chi tiết về bé...' },
    { img: aboutUs1, title: 'Đăng ký nhận nuôi', text: 'Bạn đã tìm thấy "bé yêu" của mình? Hãy nhấn vào nút "Nhận nuôi"...' },
    { img: guide4, title: 'Hoàn tất thông tin & Thanh toán', text: 'Lựa chọn phương thức nhận nuôi và hoàn tất thanh toán...' },
    { img: guide5, title: 'Chờ xét duyệt', text: 'Sau khi hoàn tất, đội ngũ của chúng tôi sẽ tiến hành xét duyệt...' },
    { img: guide6, title: 'Đón bé về nhà', text: 'Chúc mừng bạn! Yêu cầu nhận nuôi của bạn đã được chấp thuận...' },
];

const GuidePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slideData.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slideData.length) % slideData.length);
    };
    
    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 5000);
        return () => clearInterval(slideInterval);
    }, []);

    return (
        <main className="guide">
            <section className="breadcrumb">
                <div className="content">
                    <p className="paragraph-p3"><Link to="/">Trang chủ</Link> &gt; Hướng dẫn nhận nuôi</p>
                </div>
            </section>
            <section className="intro">
                <div className="content">
                    <h1 className="heading-h54">Hướng dẫn</h1>
                    <p className="paragraph-p3">Tìm kiếm vật nuôi yêu thích của bạn đơn giản hơn bao giờ hết với FurEver</p>
                </div>
            </section>

            <section className="adoption-process">
                <h2 className="heading-h40 content">Quy trình nhận nuôi</h2>
                <div className="slider-container">
                    <div className="slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {slideData.map((slide, index) => (
                            <div className={`slide ${index === currentSlide ? 'active' : ''}`} key={index}>
                                <img src={slide.img} alt={`Slide ${index + 1}`} />
                                <div className="slide-content">
                                    <h3 className="heading-h32">{slide.title}</h3>
                                    <p className="paragraph-p3">{slide.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="slider-bottom">
                        <button onClick={prevSlide} className="prev">{/* SVG for prev */}</button>
                        <div className="dots-container">
                            {slideData.map((_, index) => (
                                <span 
                                    key={index} 
                                    className={`dot ${index === currentSlide ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(index)}
                                />
                            ))}
                        </div>
                        <button onClick={nextSlide} className="next">{/* SVG for next */}</button>
                    </div>
                </div>
            </section>
        

            <section className="faq-section">
                {/* ... Toàn bộ nội dung FAQ ... */}
            </section>
        </main>
    );
};

export default GuidePage;