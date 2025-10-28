import React from 'react';
import { Link } from 'react-router-dom';
import successIcon from '../../assets/img/tick-square2.svg';

const CompleteSignupPage = () => {
    return (
        <main className="complete-signup">
            <div className="complete-signup-container">
                <img src={successIcon} alt="Success" />
                <h2 className="heading-h32">Đăng ký thành công!</h2>
                <p className="paragraph-p3">Chào mừng bạn đến với FurEver!</p>
                <Link to="/login" className="button button-primary">Đăng nhập</Link>
            </div>
        </main>
    );
};

export default CompleteSignupPage;
