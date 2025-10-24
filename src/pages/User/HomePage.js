import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Import component PetCard
import PetCard from '../../components/PetCard';

// Import các hình ảnh cần thiết
import slider1 from '../../assets/img/slider1.png';
import slider2 from '../../assets/img/slider2.png';
import slider3 from '../../assets/img/slider3.png';
import dogIcon from '../../assets/img/dog-icon.svg';
import catIcon from '../../assets/img/cat-icon.svg';
import step1Img from '../../assets/img/step1.png';
import step2Img from '../../assets/img/step2.png';
import step3Img from '../../assets/img/step3.png';

const heroSlides = [slider1, slider2, slider3];

const HomePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [featuredPets, setFeaturedPets] = useState([]);

    // Logic cho Hero Slider
    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000); // Tự động chuyển slide sau mỗi 5 giây

        return () => clearInterval(slideInterval); // Dọn dẹp interval khi component unmount
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

    // Logic để lấy dữ liệu thú cưng nổi bật từ API
    useEffect(() => {
        const fetchFeaturedPets = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/pets');
                // Lấy 3 thú cưng đầu tiên làm thú cưng nổi bật
                setFeaturedPets(data.slice(0, 3));
            } catch (error) {
                console.error("Không thể tải dữ liệu thú cưng nổi bật:", error);
            }
        };
        fetchFeaturedPets();
    }, []);

    return (
        <main className="home">
            <section className="hero">
                <div className="hero__content">
                    <h1 className="heading-h54">Bạn Đã Sẵn Sàng Cho Một Người Bạn Mới?</h1>
                    <p className="paragraph-p3">
                        Tại FurEver, chúng tôi tin rằng mỗi thú cưng đều xứng đáng có một
                        mái nhà yêu thương. Chúng tôi kết nối những người bạn bốn chân đáng
                        yêu với những gia đình đang tìm kiếm một thành viên mới...
                    </p>
                </div>
                <div className="hero__action">
                    <Link to="/donate" className="button button-primary heading-h18">Ủng hộ</Link>
                    <Link to="/about-us" className="button button-primary">Về chúng tôi</Link>
                </div>
                <div className="hero__image-slider">
                    <div className="slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {heroSlides.map((slide, index) => (
                            <div className="slide" key={index}>
                                <img src={slide} alt={`Slide ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hero__pagination">
                    <button onClick={prevSlide} className="prev">{/* SVG Prev */}</button>
                    <div className="dot">
                        {heroSlides.map((_, index) => (
                           <span key={index} className={currentSlide === index ? 'active' : ''} onClick={() => setCurrentSlide(index)}></span>
                        ))}
                    </div>
                    <button onClick={nextSlide} className="next">{/* SVG Next */}</button>
                </div>
            </section>

            <section className="adoption-intro">
                <div className="content">
                    <h1 className="heading-h54">Nhận nuôi thật dễ dàng!</h1>
                    <p className="paragraph-p2">
                        Chọn thú cưng của bạn trong hơn <strong className="heading-h40">1000</strong> con vật đang cần được tìm nhà mới tại FurEver
                    </p>
                    <div className="pet-types">
                        {/* SỬA 2 DÒNG DƯỚI ĐÂY */}
                        <Link to="/adoption?species=dog"><img src={dogIcon} alt="Dog icon" /></Link>
                        <Link to="/adoption?species=cat"><img src={catIcon} alt="Cat icon" /></Link>
                    </div>
                </div>
            </section>

            <section className="featured-pets">
                <h1 className="heading-h54">Ưu tiên nhận nuôi</h1>
                <div className="pet-carousel">
                    <div className="pet-cards">
                        {/* Hiển thị danh sách thú cưng nổi bật từ API */}
                        {featuredPets.map(pet => (
                            <PetCard key={pet._id} pet={pet} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="adoption-stats">
                <div className="content">
                    <div className="stat"><strong>2578</strong><span>ca cứu hộ</span></div>
                    <div className="stat"><strong>53.7 triệu VNĐ</strong><span>quyên góp</span></div>
                    <div className="stat"><strong>1563</strong><span>thú nuôi đã có chủ</span></div>
                    <div className="stat"><strong>1000+</strong><span>thú nuôi cần tìm chủ</span></div>
                </div>
            </section>

            <section className="support-cta">
                <div className="content">
                    <h1 className="heading-h54">Sẵn sàng để ủng hộ?</h1>
                    <p className="paragraph-p3">
                        Mỗi sự đóng góp của bạn - dù lớn hay nhỏ - đều là một hành động nhân ái, giúp các chú chó mèo có cơ hội tìm được ngôi nhà an toàn và ấm áp.
                    </p>
                    <Link to="/donate" className="button button-primary">Ủng hộ</Link>
                </div>
            </section>

            <section className="adoption-guide">
                <div className="content">
                    <h1 className="heading-h54">Hướng dẫn</h1>
                    <p className="paragraph-p2">
                        Chưa biết bắt đầu từ đâu? Xem hướng dẫn về quy trình nhận nuôi tại FurEver
                    </p>
                    <div className="guide-steps">
                        <div className="step">
                            <Link to="/guide">
                                <div className="step-number heading-h40">1</div>
                                <div className="step-content">
                                    <h3 className="heading-h18">Chọn vật nuôi</h3>
                                    <img src={step1Img} alt="Step 1" />
                                    <p className="paragraph-p4">Xem danh sách vật nuôi tại FurEver, dễ dàng tìm kiếm vật nuôi yêu thích của bạn với bộ lọc theo từng đặc điểm.</p>
                                    <span className="button button-secondary step-button">Xem thêm</span>
                                </div>
                            </Link>
                        </div>
                        <div className="step step2">
                            <Link to="/guide">
                                <div className="step-number heading-h40">2</div>
                                <div className="step-content">
                                    <h3 className="heading-h18">Thủ tục</h3>
                                    <img src={step2Img} alt="Step 2" />
                                    <p className="paragraph-p4">Thủ tục nhận nuôi tại FurEver dễ dàng hơn bao giờ hết với thông tin chi tiết về quy trình nhận nuôi, các yêu cầu và giấy tờ cần thiết.</p>
                                     <span className="button button-secondary step-button">Xem thêm</span>
                                </div>
                            </Link>
                        </div>
                        <div className="step step3">
                            <Link to="/guide">
                                <div className="step-number heading-h40">3</div>
                                <div className="step-content">
                                    <h3 className="heading-h18">Chăm sóc</h3>
                                    <img src={step3Img} alt="Step 3" />
                                    <p className="paragraph-p4">FurEver cung cấp các thông tin về chế độ ăn uống, cách chăm sóc sức khỏe, cách huấn luyện và các kỹ năng cần thiết.</p>
                                     <span className="button button-secondary step-button">Xem thêm</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default HomePage;