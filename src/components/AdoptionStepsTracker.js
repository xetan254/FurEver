import React from 'react';
import { Link } from 'react-router-dom';

const AdoptionStepsTracker = ({ currentStep }) => {
    const steps = [
        { number: 1, name: 'Phương thức nhận nuôi' },
        { number: 2, name: 'Xác nhận thông tin' },
        { number: 3, name: 'Thanh toán' },
    ];

    const getStepClass = (stepNumber) => {
        if (stepNumber < currentStep) return 'visited';
        if (stepNumber === currentStep) return 'active';
        return 'unvisit';
    };

    return (
        <div className="step-container">
            <div className="steps">
                {steps.map(step => (
                    <div key={step.number} className={`step heading-h18 ${getStepClass(step.number)}`}>
                        <span className={`step-order ${getStepClass(step.number)}`}>{step.number}</span>
                        {step.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdoptionStepsTracker;