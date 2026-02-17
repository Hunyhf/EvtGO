// src/pages/organizer/EventManagement/CreateEvent.jsx
import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Steps, Button, Card, Space, theme, message } from 'antd';
import {
    InfoCircleOutlined,
    ClockCircleOutlined,
    SettingOutlined,
    CreditCardOutlined
} from '@ant-design/icons';

// Import các component con
import Step1Info from './Step1Info';
import Step2Showtimes from './Step2Showtimes';

const { Step } = Steps;

const CreateEvent = () => {
    const { currentStep, setCurrentStep, onNextAction, setOnNextAction } =
        useOutletContext();
    const navigate = useNavigate();
    const { token } = theme.useToken();

    // === QUAN TRỌNG: State chứa toàn bộ dữ liệu sự kiện ===
    const [formData, setFormData] = useState({
        // Dữ liệu Step 1
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
        // Dữ liệu Step 2
        showTimes: [] // Danh sách suất diễn
    });

    const steps = [
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
            // Gọi hàm validate/save của step con
            onNextAction();
        } else {
            if (currentStep < steps.length) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            // Reset action khi quay lại để tránh gọi nhầm action của step trước
            setOnNextAction(null);
        }
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Card
                bordered={false}
                style={{
                    marginBottom: 24,
                    borderRadius: 8,
                    background: '#2a2d34'
                }}
            >
                <Steps current={currentStep - 1}>
                    {steps.map(item => (
                        <Step
                            key={item.title}
                            title={item.title}
                            icon={item.icon}
                        />
                    ))}
                </Steps>
            </Card>

            <div style={{ minHeight: '400px', marginBottom: 24 }}>
                {steps[currentStep - 1].content}
            </div>

            <Card
                bordered={false}
                style={{
                    borderRadius: 8,
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 10,
                    background: '#2a2d34',
                    borderTop: '1px solid #393f4e'
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
                            {currentStep === steps.length
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
