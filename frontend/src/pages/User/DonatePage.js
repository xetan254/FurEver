import React from 'react';
import { Link } from 'react-router-dom';

// Import ảnh QR của bạn
import qrImage from '../../assets/img/qr.png'; 



const DonatePage = () => {
    return (
        <main className="donate-page">
            <div className="breadcrumb">
                 
            </div>
            <div className="donate-content">
                {/* Phần tiêu đề và mục đích */}
                <h1 className="donate-title">Chung Tay Cứu Trợ Thú Cưng</h1>
                <p className="donate-purpose">
                    Mọi đóng góp của bạn, dù lớn hay nhỏ, đều là nguồn động lực quý giá giúp chúng tôi thực hiện sứ mệnh **cứu hộ, chữa trị và chăm sóc** những chú chó, mèo bị bỏ rơi và mal-treated. Cùng nhau, chúng ta hãy mang đến cho các bé một mái ấm và cơ hội có một cuộc sống tốt đẹp hơn.
                </p>

                {/* Mã QR */}
                <div className="qr-code-container">
                    <img src={qrImage} alt="Mã QR ủng hộ" className="qr-code-image" />
                    <p className="qr-instruction">
                        Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử của bạn để ủng hộ.
                    </p>
                </div>

                {/* Lời cảm ơn */}
                <p className="thank-you-message">
                    Thay mặt những người bạn bốn chân, chúng tôi xin chân thành cảm ơn tấm lòng hảo tâm của bạn! ❤️
                </p>
            </div>
        </main>
    );
};

export default DonatePage;