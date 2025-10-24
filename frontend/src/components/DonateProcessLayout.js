import React from 'react';
import { Link } from 'react-router-dom';

const DonateProcessLayout = ({ children }) => {
    return (
        <>
            <section className="breadcrumb">
                <div className="content">
                    <p className="paragraph-p3"><Link to="/">Trang chủ</Link></p>
                    <p className="paragraph-p3">&gt;</p>
                    <p className="paragraph-p3">Ủng hộ</p>
                </div>
            </section>
            <section className="intro">
                <div className="content">
                    <h1 className="heading-h54">Ủng hộ</h1>
                    <p className="paragraph-p3">
                        Chúng tôi cần sự giúp đỡ của bạn! Mọi đóng góp đều trực tiếp góp
                        phần chi trả các chi phí hoạt động của FurEver.
                    </p>
                </div>
            </section>
            
            {/* Nội dung riêng của từng bước sẽ hiển thị ở đây */}
            {children}
        </>
    );
};

export default DonateProcessLayout;