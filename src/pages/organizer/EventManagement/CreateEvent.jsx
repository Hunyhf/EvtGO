import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Step1Info from './Step1Info';
import classNames from 'classnames/bind';
import styles from './CreateEvent.module.scss';

const cx = classNames.bind(styles);

const CreateEvent = () => {
    // Lấy context từ OrganizerLayout
    const { currentStep, setCurrentStep, setOnNextAction } = useOutletContext();

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

    // Logic kiểm tra lỗi của Bước 1
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

    // Hàm xử lý "Tiếp tục" - dùng useCallback để tránh render dư thừa
    const handleNext = useCallback(() => {
        setValidateTrigger(prev => prev + 1);

        // Chỉ thực hiện validate nếu đang ở bước 1
        if (currentStep === 1) {
            if (!validateStep1()) return;
        }

        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            alert('Tiến hành gọi API tạo sự kiện!');
        }
    }, [currentStep, formData, setCurrentStep]);

    // Gửi logic handleNext lên Stepper của Layout
    useEffect(() => {
        setOnNextAction(() => handleNext);
        return () => setOnNextAction(null); // Cleanup khi thoát trang
    }, [handleNext, setOnNextAction]);

    return (
        <div className={cx('content')}>
            {/* TRANG NÀY CHỈ CHỨA NỘI DUNG FORM, KHÔNG CHỨA UI ĐIỀU HƯỚNG NỮA */}
            {currentStep === 1 && (
                <Step1Info
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    validateTrigger={validateTrigger}
                />
            )}
            {currentStep === 2 && (
                <div className={cx('stepPlaceholder')}>
                    <h2>Thời gian & Loại vé đang phát triển...</h2>
                    <button onClick={() => setCurrentStep(1)}>Quay lại</button>
                </div>
            )}
            {/* ... Các step 3, 4 tương tự ... */}
        </div>
    );
};

export default CreateEvent;
