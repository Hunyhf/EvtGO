import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import Step1Info from './Step1Info';
import styles from './CreateEvent.module.scss';

const cx = classNames.bind(styles);

const STEPS = [
    { id: 1, label: 'Thông tin sự kiện' },
    { id: 2, label: 'Thời gian & Loại vé' },
    { id: 3, label: 'Cài đặt' },
    { id: 4, label: 'Thông tin thanh toán' }
];

const CreateEvent = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        eventType: 'offline',
        locationName: '',
        province: '',
        district: '',
        ward: '',
        addressDetail: '',
        genreId: '',
        description: '',
        poster: null
    });

    const [errors, setErrors] = useState({});

    const validateStep1 = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên sự kiện';
        if (!formData.genreId) newErrors.genreId = 'Vui lòng chọn thể loại';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateStep1()) return;

        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            alert('Tiến hành gọi API tạo sự kiện!');
        }
    };

    const handleSaveDraft = () => {
        alert('Đã lưu nháp!');
    };

    return (
        <div className={cx('layout')}>
            {/* TOP HEADER */}
            <div className={cx('header')}>
                <div className={cx('stepper')}>
                    {STEPS.map(step => (
                        <div
                            key={step.id}
                            className={cx('step', {
                                activeStep: currentStep === step.id,
                                passedStep: currentStep > step.id
                            })}
                        >
                            <div className={cx('stepCircle')}>{step.id}</div>
                            <span className={cx('stepLabel')}>
                                {step.label}
                            </span>
                            {step.id !== 4 && (
                                <div className={cx('stepLine')}></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={cx('headerActions')}>
                    <button
                        className={cx('btnOutline')}
                        onClick={handleSaveDraft}
                    >
                        Lưu nháp
                    </button>
                    <button className={cx('btnPrimary')} onClick={handleNext}>
                        {currentStep === 4 ? 'Hoàn tất' : 'Tiếp tục'}
                    </button>
                </div>
            </div>

            {/* BODY CONTENT */}
            <div className={cx('content')}>
                {currentStep === 1 && (
                    <Step1Info
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                    />
                )}
                {currentStep === 2 && (
                    <div className={cx('stepPlaceholder')}>
                        <h2>Giao diện Bước 2 đang xây dựng...</h2>
                        <button onClick={() => setCurrentStep(1)}>
                            Quay lại bước 1
                        </button>
                    </div>
                )}
                {currentStep === 3 && (
                    <div className={cx('stepPlaceholder')}>
                        <h2>Giao diện Bước 3...</h2>
                    </div>
                )}
                {currentStep === 4 && (
                    <div className={cx('stepPlaceholder')}>
                        <h2>Giao diện Bước 4...</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateEvent;
