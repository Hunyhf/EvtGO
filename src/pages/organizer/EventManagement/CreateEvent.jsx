// src/pages/organizer/EventManagement/CreateEvent.jsx
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

const { confirm } = Modal;

const CreateEvent = () => {
    const { currentStep, setCurrentStep, onNextAction, setOnNextAction } =
        useOutletContext();
    const navigate = useNavigate();
    const { token } = theme.useToken();

    // Khởi tạo state từ LocalStorage (nếu có) để tránh mất dữ liệu khi refresh
    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem('evtgo_create_event_draft');
        return savedData
            ? JSON.parse(savedData)
            : {
                  name: '',
                  poster: null,
                  showTimes: []
              };
    });

    // Lưu Draft mỗi khi formData thay đổi (Debounce nếu cần)
    useEffect(() => {
        localStorage.setItem(
            'evtgo_create_event_draft',
            JSON.stringify(formData)
        );
    }, [formData]);

    const stepItems = [
        {
            title: 'Thông tin cơ bản',
            icon: <InfoCircleOutlined />,
            content: (
                <Step1Info
                    setOnNextAction={setOnNextAction}
                    formData={formData}
                    setFormData={setFormData} // Chỉ cập nhật khi bấm Next
                />
            )
        },
        {
            title: 'Thời gian & Vé',
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
                    Cài đặt nâng cao (Coming soon)
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
                    Cấu hình thanh toán (Coming soon)
                </div>
            )
        }
    ];

    const handleNext = () => {
        if (onNextAction) {
            // Trigger hàm validate/submit bên trong component con
            onNextAction();
            // Lưu ý: Logic chuyển trang (setCurrentStep) nên được component con gọi
            // hoặc component con trả về Promise resolve thì cha mới chuyển.
            // Ở code hiện tại của bạn, logic chuyển trang đang nằm ở Layout/Cha
            // nên cần đảm bảo onNextAction throw error nếu validate fail.
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setOnNextAction(null); // Reset action
        }
    };

    const handleCancel = () => {
        confirm({
            title: 'Hủy tạo sự kiện?',
            icon: <ExclamationCircleOutlined />,
            content: 'Dữ liệu bạn đã nhập sẽ bị mất.',
            okText: 'Đồng ý',
            cancelText: 'Không',
            onOk() {
                localStorage.removeItem('evtgo_create_event_draft'); // Xóa draft
                navigate('/organizer/events');
            }
        });
    };

    // Callback function để chuyển bước (truyền xuống cho con dùng nếu cần)
    const nextStep = () => setCurrentStep(prev => prev + 1);

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Card
                bordered={false}
                style={{
                    marginBottom: 24,
                    borderRadius: 8,
                    background: token.colorBgContainer
                }}
            >
                <Steps
                    current={currentStep - 1}
                    items={stepItems.map(item => ({
                        title: item.title,
                        icon: item.icon
                    }))}
                />
            </Card>

            <div style={{ minHeight: '400px', marginBottom: 24 }}>
                {/* Clone element để truyền thêm props nextStep nếu cần */}
                {React.cloneElement(stepItems[currentStep - 1].content, {
                    nextStep
                })}
            </div>

            <Card
                bordered={false}
                style={{
                    borderRadius: 8,
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 10,
                    background: token.colorBgContainer,
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
                        disabled={currentStep === 1}
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
