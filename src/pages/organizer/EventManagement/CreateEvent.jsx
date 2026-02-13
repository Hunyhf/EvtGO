// src/pages/organizer/EventManagement/CreateEvent.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1Info from './Step1Info';
import styles from './CreateEvent.module.scss';

const STEPS = [
    { id: 1, label: 'Thông tin sự kiện' },
    { id: 2, label: 'Thời gian & Loại vé' },
    { id: 3, label: 'Cài đặt' },
    { id: 4, label: 'Thông tin thanh toán' }
];

const CreateEvent = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    // State lưu toàn bộ dữ liệu của tất cả các bước
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

    // Hàm kiểm tra lỗi trước khi sang bước tiếp theo
    const validateStep1 = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên sự kiện';
        if (!formData.genreId) newErrors.genreId = 'Vui lòng chọn thể loại';
        // Tạm ẩn check poster để bạn test UI dễ hơn
        // if (!formData.poster) newErrors.poster = true;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateStep1()) return;

        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Bước cuối: Submit API ở đây
            alert('Tiến hành gọi API tạo sự kiện!');
        }
    };

    const handleSaveDraft = () => {
        alert('Đã lưu nháp!');
    };

    return (
        <div className={styles.layout}>
            {/* TOP HEADER */}
            <div className={styles.header}>
                <div className={styles.stepper}>
                    {STEPS.map(step => (
                        <div
                            key={step.id}
                            className={`${styles.step} ${currentStep === step.id ? styles.activeStep : ''} ${currentStep > step.id ? styles.passedStep : ''}`}
                        >
                            <div className={styles.stepCircle}>{step.id}</div>
                            <span className={styles.stepLabel}>
                                {step.label}
                            </span>
                            {step.id !== 4 && (
                                <div className={styles.stepLine}></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.headerActions}>
                    <button
                        className={styles.btnOutline}
                        onClick={handleSaveDraft}
                    >
                        Lưu
                    </button>
                    <button className={styles.btnPrimary} onClick={handleNext}>
                        {currentStep === 4 ? 'Hoàn tất' : 'Tiếp tục'}
                    </button>
                </div>
            </div>

            {/* BODY CONTENT */}
            <div className={styles.content}>
                {currentStep === 1 && (
                    <Step1Info
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                    />
                )}
                {currentStep === 2 && (
                    <div>
                        <h2>Giao diện Bước 2 đang xây dựng...</h2>
                        <button onClick={() => setCurrentStep(1)}>
                            Quay lại bước 1
                        </button>
                    </div>
                )}
                {currentStep === 3 && (
                    <div>
                        <h2>Giao diện Bước 3...</h2>
                    </div>
                )}
                {currentStep === 4 && (
                    <div>
                        <h2>Giao diện Bước 4...</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateEvent;
