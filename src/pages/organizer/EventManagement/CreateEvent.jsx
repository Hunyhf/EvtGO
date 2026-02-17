import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Steps, Button, Card, Space, theme, Modal } from 'antd';
import {
    InfoCircleOutlined,
    ClockCircleOutlined,
    SettingOutlined,
    CreditCardOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

import Step1Info from './Step1Info';
import Step2Showtimes from './Step2Showtimes';
import Step3Settings from './Step3Settings';

const { confirm } = Modal;

// Key để lưu vào LocalStorage
const STORAGE_KEY_DATA = 'evtgo_create_event_data';
const STORAGE_KEY_STEP = 'evtgo_create_event_step';

const CreateEvent = () => {
    const { setCurrentStep, onNextAction, setOnNextAction } =
        useOutletContext();
    const navigate = useNavigate();
    const { token } = theme.useToken();

    // 1. KHỞI TẠO STATE TỪ LOCALSTORAGE
    // Lấy step từ storage, nếu không có thì mặc định là 1
    const [localCurrentStep, setLocalCurrentStep] = useState(() => {
        const savedStep = localStorage.getItem(STORAGE_KEY_STEP);
        return savedStep ? Number(savedStep) : 1;
    });

    // Lấy formData từ storage, nếu không có thì dùng object rỗng
    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem(STORAGE_KEY_DATA);
        return savedData
            ? JSON.parse(savedData)
            : {
                  name: '',
                  poster: null,
                  organizerLogo: null,
                  // ... các trường khác
                  showTimes: []
              };
    });

    // Đồng bộ localCurrentStep lên Layout Context để hiển thị đúng trên Sidebar/Header nếu cần
    // Nhưng vì Layout quản lý currentStep của chính nó, ta cần cập nhật nó ngay khi mount
    const { currentStep: layoutStep } = useOutletContext(); // Lấy step từ layout (nếu có)

    // Effect: Khi mount, báo cho Layout biết đang ở step nào (để đồng bộ UI)
    useEffect(() => {
        setCurrentStep(localCurrentStep);
    }, []);

    // Effect: Khi formData hoặc step thay đổi -> Lưu vào LocalStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(formData));
        localStorage.setItem(STORAGE_KEY_STEP, localCurrentStep);
        // Đồng bộ ngược lên layout để thanh header (nếu có) hiển thị đúng
        setCurrentStep(localCurrentStep);
    }, [formData, localCurrentStep, setCurrentStep]);

    // Hàm chuyển bước an toàn
    const nextStep = () => {
        setLocalCurrentStep(prev => prev + 1);
    };

    const handleNext = () => {
        if (onNextAction) {
            // Trigger hàm validate/submit bên trong component con
            onNextAction();
        } else {
            // Fallback
            nextStep();
        }
    };

    const handlePrev = () => {
        if (localCurrentStep > 1) {
            setLocalCurrentStep(localCurrentStep - 1);
            setOnNextAction(null);
        }
    };

    const handleCancel = () => {
        confirm({
            title: 'Hủy tạo sự kiện?',
            icon: <ExclamationCircleOutlined />,
            content: 'Dữ liệu bạn đã nhập sẽ bị mất hoàn toàn.',
            okText: 'Đồng ý',
            cancelText: 'Không',
            onOk() {
                // Xóa dữ liệu trong storage khi hủy
                localStorage.removeItem(STORAGE_KEY_DATA);
                localStorage.removeItem(STORAGE_KEY_STEP);
                navigate('/organizer/events');
            }
        });
    };

    // Định nghĩa các bước
    const stepItems = [
        {
            title: 'Thông tin sự kiện',
            icon: <InfoCircleOutlined />,
            content: (
                <Step1Info
                    setOnNextAction={setOnNextAction}
                    formData={formData}
                    setFormData={setFormData}
                    nextStep={nextStep}
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
                    nextStep={nextStep}
                />
            )
        },
        {
            title: 'Cài đặt',
            icon: <SettingOutlined />,
            // 2. Thay thế div placeholder bằng Component thật
            content: (
                <Step3Settings
                    setOnNextAction={setOnNextAction}
                    formData={formData}
                    setFormData={setFormData}
                    nextStep={nextStep}
                />
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
                <Steps
                    current={localCurrentStep - 1}
                    items={stepItems.map(item => ({
                        title: item.title,
                        icon: item.icon
                    }))}
                />
            </Card>

            {/* Content Area */}
            <div style={{ minHeight: '400px', marginBottom: 24 }}>
                {/* Render nội dung của step hiện tại */}
                {stepItems[localCurrentStep - 1]?.content}
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
                    boxShadow: '0 -4px 10px rgba(0,0,0,0.2)'
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
                        disabled={localCurrentStep === 1}
                        onClick={handlePrev}
                        size='large'
                    >
                        Quay lại
                    </Button>

                    <Space>
                        <Button onClick={handleCancel} size='large'>
                            Hủy bỏ
                        </Button>
                        <Button
                            type='primary'
                            onClick={handleNext}
                            size='large'
                            style={{ minWidth: 120 }}
                        >
                            {localCurrentStep === stepItems.length
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
