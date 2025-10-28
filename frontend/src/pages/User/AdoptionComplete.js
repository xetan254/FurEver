import React from 'react';
import { Link } from 'react-router-dom';
import successIcon from '../../assets/img/tick-square2.svg';
import footIcon from '../../assets/img/foot.svg';


const AdoptionComplete = () => {
    return (
        <main className="adoption-complete-page">
              <section className="breadcrumb">
                <div className="content">
                    <p className="paragraph-p3"><Link to="/">Trang chủ</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3"><Link to="/adoption">Nhận nuôi</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3"><Link to="/adoption-detail/1">Thông tin vật nuôi</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3">Thực hiện nhận nuôi</p>
                </div>
            </section>

            <section className="intro">
                 <div className="content">
                    <h1 className="heading-h54">Nhận nuôi</h1>
                    <p className="paragraph-p3">
                        Tìm kiếm vật nuôi yêu thích của bạn đơn giản hơn bao giờ hết với FurEver
                    </p>
                </div>
            </section>
            <div className="content">
                <div className="confirmation-message">
                    <div className="success-icon">
                        <img src={successIcon} alt="Success" />
                    </div>
                    <h2 className="heading-h32">Cảm ơn bạn đã nhận nuôi!</h2>
                    <p className="paragraph-p2">Yêu cầu nhận nuôi đã được xác nhận thành công!</p>
                    <div className="instructions">
                        <p className="paragraph-p4 instruction-left">Bạn vui lòng:</p>
                        <ul className="instruction-right">
                            <li className="paragraph-p4"><img src={footIcon} alt="foot icon" /> Chú ý điện thoại để giữ liên lạc với FurEver</li>
                            <li className="paragraph-p4"><img src={footIcon} alt="foot icon" /> Tham khảo các hướng dẫn chăm sóc cho thú nuôi của bạn</li>
                        </ul>
                    </div>
                    <div className="buttons">
                        <Link to="/guide" className="button button-primary guide-button">Xem hướng dẫn</Link>
                        <Link to="/" className="button button-secondary home-button">Về trang chủ</Link>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AdoptionComplete;