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

    // === THÊM BIẾN TRIGGER ĐỂ KÍCH HOẠT LẠI VALIDATE ===
    const [validateTrigger, setValidateTrigger] = useState(0);

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
        poster: null,
        organizerName: '',
        organizerLogo: null
    });

    const [errors, setErrors] = useState({});

    const validateStep1 = () => {
        let newErrors = {};
        if (!formData.poster) newErrors.poster = 'Vui lòng tải ảnh nền sự kiện';
        if (!formData.organizerLogo)
            newErrors.organizerLogo = 'Vui lòng tải logo BTC';
        if (!formData.organizerName.trim())
            newErrors.organizerName = 'Vui lòng nhập tên BTC';
        if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên sự kiện';
        if (!formData.locationName.trim())
            newErrors.locationName = 'Vui lòng nhập tên địa điểm';
        if (!formData.province) newErrors.province = 'Vui lòng chọn Tỉnh/Thành';
        if (!formData.district) newErrors.district = 'Vui lòng chọn Quận/Huyện';
        if (!formData.ward) newErrors.ward = 'Vui lòng chọn Phường/Xã';
        if (!formData.addressDetail.trim())
            newErrors.addressDetail = 'Vui lòng nhập địa chỉ chi tiết';
        if (!formData.genreId) newErrors.genreId = 'Vui lòng chọn thể loại';

        const bioText = formData.description.replace(/<[^>]*>?/gm, '').trim();
        if (!bioText) newErrors.description = 'Vui lòng nhập mô tả sự kiện';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        // === MỖI LẦN BẤM NÚT THÌ TĂNG TRIGGER LÊN 1 ===
        // Việc này giúp component con nhận biết được cú click mới để hiện lại lỗi dù nội dung lỗi không đổi
        setValidateTrigger(prev => prev + 1);

        if (currentStep === 1 && !validateStep1()) return;

        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            alert('Tiến hành gọi API tạo sự kiện!');
        }
    };

    return (
        <div className={cx('layout')}>
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
                    <button className={cx('btnPrimary')} onClick={handleNext}>
                        {currentStep === 4 ? 'Hoàn tất' : 'Tiếp tục'}
                    </button>
                </div>
            </div>

            <div className={cx('content')}>
                {currentStep === 1 && (
                    <Step1Info
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        // === TRUYỀN TRIGGER XUỐNG STEP1INFO ===
                        validateTrigger={validateTrigger}
                    />
                )}
                {currentStep === 2 && (
                    <div className={cx('stepPlaceholder')}>
                        <h2>Thời gian & Loại vé đang phát triển...</h2>
                        <button onClick={() => setCurrentStep(1)}>
                            Quay lại
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateEvent;
