import React from 'react';
import { Link } from 'react-router-dom';

// Import các hình ảnh cần thiết
import aboutUs1 from '../../assets/img/about-us1.png';
import aboutUs2 from '../../assets/img/about-us2.png';
import aboutUs3 from '../../assets/img/about-us3.svg';

const AboutUsPage = () => {
    return (
        <main className="about-us">
            <section className="breadcrumb">
                <div className="content">
                    <p className="paragraph-p3"><Link to="/">Trang chủ</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3">Giới thiệu</p>
                </div>
            </section>

            <section className="intro">
                <div className="content">
                    <h1 className="heading-h54">Về FurEver</h1>
                    <p className="paragraph-p3">
                        Chào mừng đến với FurEver – nơi mỗi chú chó, mỗi chú mèo đều xứng
                        đáng có một mái nhà ấm áp và đầy tình yêu thương
                    </p>
                </div>
            </section>

            <div className="furever-description">
                <div className="description-content">
                    <h3 className="heading-h54">FurEver là gì?</h3>
                    <p className="paragraph-p3">
                        FurEver là một hội nhóm người yêu thú cưng được thành lập năm 2012
                        tại Hà Nội, với hoạt động chủ yếu là cứu trợ các chú chó mèo lang
                        thang ngoài đường và chăm sóc, tìm chủ mới cho các bé. Sau 4 năm đầu
                        hoạt động trực tiếp, chúng tôi đã có đủ tài nguyên để xây dựng nên
                        FurEver.vn - nền tảng số dành riêng cho những người yêu thú cưng,
                        đặc biệt là những ai mong muốn nhận nuôi và chăm sóc chó mèo.
                    </p>
                    <p className="paragraph-p3">
                        Chúng tôi không chỉ kết nối những sinh vật bốn chân cần tình thương
                        với các gia đình mới, mà còn cam kết mang lại sự hỗ trợ toàn diện
                        cho quá trình nhận nuôi, chăm sóc và huấn luyện.
                    </p>
                </div>
                <div className="description-image">
                    <img src={aboutUs1} alt="FurEver là gì?" className="description-image" />
                </div>
            </div>

            <div className="furever-misson">
                <div className="misson-content">
                    <h3 className="heading-h54">Sứ mệnh</h3>
                    <p className="paragraph-p3">
                        Tại FurEver, chúng tôi tin rằng mỗi con vật đều có quyền có một mái
                        nhà yêu thương và an toàn.
                    </p>
                    <p className="paragraph-p3">
                        Sứ mệnh của chúng tôi là cứu hộ, cưu mang tạm thời những chú chó mèo
                        cơ nhỡ, tạo ra cơ hội nhận nuôi cho chó mèo, cung cấp thông tin,
                        kiến thức và lời khuyên về chăm sóc sức khỏe, dinh dưỡng, và huấn
                        luyện cho thú cưng cũng như nâng cao nhận thức cộng đồng, vì một
                        tương lai không còn những chú chó mèo bị bỏ rơi.
                    </p>
                </div>
                <div className="misson-image">
                    <img src={aboutUs2} alt="Sứ mệnh của FurEver" className="misson-image" />
                </div>
            </div>

            <div className="why-choose-furever">
                <h2 className="heading-h54">Vì sao chọn FurEver?</h2>
                <div className="reasons">
                    <div className="reason">
                        <div className="number-reason heading-h40">1</div>
                        <div className="reason-content">
                            <div className="title-card heading-h22">Cam kết trách nhiệm</div>
                            <p className="paragraph-p3">
                                Chúng tôi luôn làm việc với tiêu chí uy tín đặt hàng đầu, đảm
                                bảo rằng mỗi chú chó mèo đều được chăm sóc tốt trước khi được
                                nhận nuôi.
                            </p>
                        </div>
                    </div>
                    <div className="reason">
                        <div className="number-reason heading-h40">2</div>
                        <div className="reason-content">
                            <div className="title-card heading-h22">Cộng đồng thân thiện</div>
                            <p className="paragraph-p3">
                                FurEver không chỉ là một trang web nhận nuôi, mà còn là một cộng
                                đồng hỗ trợ, nơi bạn có thể tìm thấy những người có cùng niềm
                                đam mê và chia sẻ tình yêu với thú cưng.
                            </p>
                        </div>
                    </div>
                    <div className="reason">
                        <div className="number-reason heading-h40">3</div>
                        <div className="reason-content">
                            <div className="title-card heading-h22">Thông tin cập nhật</div>
                            <p className="paragraph-p3">
                                Chúng tôi luôn cung cấp các bài viết mới nhất về chăm sóc, huấn
                                luyện và sức khỏe thú cưng để bạn có thể là người chủ tốt nhất.
                            </p>
                        </div>
                    </div>
                </div>
                <img src={aboutUs3} alt="Why Choose FurEver Background" />
            </div>

            <section className="support-cta">
                <div className="content">
                    <h1 className="heading-h54">Sẵn sàng để ủng hộ?</h1>
                    <p className="paragraph-p3">
                        Mỗi sự đóng góp của bạn - dù lớn hay nhỏ - đều là một hành động nhân
                        ái, giúp các chú chó mèo có cơ hội tìm được ngôi nhà an toàn và ấm
                        áp.
                    </p>
                    <Link to="/donate" className="button button-primary">Ủng hộ</Link>
                </div>
            </section>
        </main>
    );
};

export default AboutUsPage;