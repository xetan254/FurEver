import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ConfirmPasswordPage = () => {
    // Logic tương tự trang ConfirmSignupPage, có thể tái sử dụng component sau
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [countdown, setCountdown] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (isResending && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            setIsResending(false);
        }
        return () => clearTimeout(timer);
    }, [countdown, isResending]);

    const handleResendCode = () => {
        setIsResending(true);
        setCountdown(60);
        console.log("Resending OTP for password reset...");
    };

    const handleConfirm = () => {
        console.log("Confirming password reset OTP:", otp.join(""));
        navigate('/reset-password');
    };

    return (
        <main className="confirm-page">
            <div className="verification-container">
                <h2 className="heading-h32">Quên mật khẩu</h2>
                <p className="paragraph-p3">
                    Nhập mã OTP đã được gửi vào số điện thoại ******405
                </p>
                <div className="otp-inputs">
                    {/* OTP input fields */}
                </div>
                {isResending && <p className="resend-message">Gửi lại mã sau {countdown}s</p>}
                <div className="buttons">
                    <button onClick={handleConfirm} className="button button-primary">Xác nhận</button>
                    <button onClick={handleResendCode} disabled={isResending} className="button button-secondary btn-resend">
                        Gửi lại mã
                    </button>
                </div>
            </div>
        </main>
    );
};

export default ConfirmPasswordPage;
