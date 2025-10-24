import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import logo from '../assets/img/logo.svg'; // Import hình ảnh
import phoneIcon from '../assets/img/phone-icon.svg';
import mailIcon from '../assets/img/mail-icon.svg';
import addressIcon from '../assets/img/address-icon.svg';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="content">
                <div className="footer-content">
                    <div className="footer-logo">
                        <img src={logo} alt="FurEver logo" />
                    </div>
                    <p className="footer-description paragraph-p4">
                        Chuyên kết nối người yêu động vật với thú cưng. Cam kết mang đến
                        những cơ hội để mỗi động vật có thể tìm được một ngôi nhà yêu
                        thương.
                    </p>
                </div>
                <nav className="footer-nav">
                    <ul>
                        <li><Link to="/">Trang chủ</Link></li>
                        <li><Link to="/adoption">Nhận nuôi</Link></li>
                        <li><Link to="/news">Tin tức</Link></li>
                        <li><Link to="/guide">Hướng dẫn</Link></li>
                        <li><Link to="/about-us">Về chúng tôi</Link></li>
                        <li><Link to="/donate">Ủng hộ</Link></li>
                    </ul>
                </nav>
                <div className="footer-contact">
                    <div className="title-contact">
                        <h3 className="heading-h18">Liên hệ</h3>
                        {/* SVG icons không cần thay đổi */}
                    </div>
                    <div className="contact-info">
                        <div className="contact-icon">
                            <img src={phoneIcon} alt="Phone" />
                        </div>
                        <p className="paragraph-p4">(+84)123456789</p>
                    </div>
                    <div className="contact-info">
                        <div className="contact-icon">
                            <img src={mailIcon} alt="Mail" />
                        </div>
                        <p className="paragraph-p4">furever.vn@gmail.com</p>
                    </div>
                    <div className="contact-info">
                        <div className="contact-icon">
                            <img src={addressIcon} alt="Address" />
                        </div>
                        <p className="paragraph-p4">
                            Km 10 đường Nguyễn Trãi, phường Mộ Lao, quận Hà Đông, Hà Nội, Việt
                            Nam
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;