// src/pages/organizer/EventManagement/CreateEvent.jsx
import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Steps, Button, Card, Space, theme } from 'antd'; // Bỏ import { Step } cũ
import {
    InfoCircleOutlined,
    ClockCircleOutlined,
    SettingOutlined,
    CreditCardOutlined
} from '@ant-design/icons';

import Step1Info from './Step1Info';
import Step2Showtimes from './Step2Showtimes';

const CreateEvent = () => {
    const { currentStep, setCurrentStep, onNextAction, setOnNextAction } =
        useOutletContext();
    const navigate = useNavigate();
    const { token } = theme.useToken();

    // State chứa dữ liệu toàn bộ form
    const [formData, setFormData] = useState({
        name: '',
        poster: null,
        organizerLogo: null,
        organizerName: '',
        genreId: null,
        locationName: '',
        province: null,
        district: null,
        ward: null,
        addressDetail: '',
        description: '',
        showTimes: []
    });

    // Định nghĩa các bước (dùng mảng objects để truyền vào prop items)
    const stepItems = [
        {
            title: 'Thông tin sự kiện',
            icon: <InfoCircleOutlined />,
            content: (
                <Step1Info
                    setOnNextAction={setOnNextAction}
                    formData={formData}
                    setFormData={setFormData}
                />
            )
        },
        {
            title: 'Thời gian & Loại vé',
            icon: <ClockCircleOutlined />,
            content: (
                <Step2Showtimes
                    setOnNextAction={setOnNextAction}
                    formData={formData}
                    setFormData={setFormData}
                />
            )
        },
        {
            title: 'Cài đặt',
            icon: <SettingOutlined />,
            content: (
                <div
                    style={{
                        padding: 50,
                        textAlign: 'center',
                        color: token.colorTextSecondary
                    }}
                >
                    Tính năng cài đặt đang được phát triển
                </div>
            )
        },
        {
            title: 'Thanh toán',
            icon: <CreditCardOutlined />,
            content: (
                <div
                    style={{
                        padding: 50,
                        textAlign: 'center',
                        color: token.colorTextSecondary
                    }}
                >
                    Tính năng thanh toán đang được phát triển
                </div>
            )
        }
    ];

    const handleNext = () => {
        if (onNextAction) {
            onNextAction();
        } else {
            if (currentStep < stepItems.length) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setOnNextAction(null);
        }
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Stepper Area */}
            <Card
                bordered={false}
                style={{
                    marginBottom: 24,
                    borderRadius: 8,
                    background: '#2a2d34'
                }}
            >
                {/* SỬA LỖI: Dùng prop `items` thay vì children */}
                <Steps
                    current={currentStep - 1}
                    items={stepItems.map(item => ({
                        title: item.title,
                        icon: item.icon
                    }))}
                />
            </Card>

            {/* Content Area */}
            <div style={{ minHeight: '400px', marginBottom: 24 }}>
                {stepItems[currentStep - 1].content}
            </div>

            {/* Action Bar (Sticky Bottom) */}
            <Card
                bordered={false}
                style={{
                    borderRadius: 8,
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 10,
                    background: '#2a2d34',
                    borderTop: '1px solid #393f4e',
                    boxShadow: '0 -4px 10px rgba(0,0,0,0.2)' // Thêm bóng đổ để tách biệt khi cuộn
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Button
                        disabled={currentStep === 1}
                        onClick={handlePrev}
                        size='large'
                    >
                        Quay lại
                    </Button>

                    <Space>
                        <Button
                            onClick={() => navigate('/organizer/events')}
                            size='large'
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type='primary'
                            onClick={handleNext}
                            size='large'
                            style={{ minWidth: 120 }}
                        >
                            {currentStep === stepItems.length
                                ? 'Hoàn tất'
                                : 'Tiếp tục'}
                        </Button>
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default CreateEvent;
