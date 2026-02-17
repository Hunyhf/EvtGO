// src/pages/organizer/EventManagement/CreateEvent.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Steps, Button, Card, Space, theme, Modal, message } from 'antd';
import {
    InfoCircleOutlined,
    ClockCircleOutlined,
    SettingOutlined,
    CreditCardOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

// FIX: Import Named Export
import { eventApi } from '@apis/eventApi';
import { eventImageApi } from '@apis/eventImageApi';

import Step1Info from './Step1Info';
import Step2Showtimes from './Step2Showtimes';
import Step3Settings from './Step3Settings';
import Step4Payment from './Step4Payment';

const { confirm } = Modal;

// Key LocalStorage
const STORAGE_KEY_DATA = 'evtgo_create_event_data';
const STORAGE_KEY_STEP = 'evtgo_create_event_step';

const CreateEvent = () => {
    // Lấy context từ Layout (nếu có) hoặc tự quản lý state nếu dùng độc lập
    const context = useOutletContext();
    const setOnNextAction = context?.setOnNextAction || (() => {});
    const onNextAction = context?.onNextAction || null;
    const setCurrentStep = context?.setCurrentStep || (() => {});

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // 1. STATE MANAGEMENT
    const [localCurrentStep, setLocalCurrentStep] = useState(() => {
        const savedStep = localStorage.getItem(STORAGE_KEY_STEP);
        return savedStep ? Number(savedStep) : 1;
    });

    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem(STORAGE_KEY_DATA);
        return savedData
            ? JSON.parse(savedData)
            : {
                  name: '',
                  description: '',
                  permitNumber: '',
                  permitIssuedAt: null,
                  permitIssuedBy: '',
                  location: '',
                  genreId: null,
                  startDate: null,
                  startTime: null,
                  endDate: null,
                  endTime: null,
                  images: [] // [PosterFile, LogoFile]
              };
    });

    // Effect: Đồng bộ bước hiện tại ra context (nếu Layout cần hiển thị)
    useEffect(() => {
        setCurrentStep(localCurrentStep);
    }, [localCurrentStep, setCurrentStep]);

    // Effect: Auto-save to LocalStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(formData));
        localStorage.setItem(STORAGE_KEY_STEP, localCurrentStep);
    }, [formData, localCurrentStep]);

    // --- LOGIC CHUYỂN BƯỚC ---
    const nextStep = () => {
        setLocalCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrev = () => {
        if (localCurrentStep > 1) {
            setLocalCurrentStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Quan trọng: Reset action của bước cũ để tránh gọi nhầm
            if (setOnNextAction) setOnNextAction(null);
        }
    };

    // --- LOGIC XỬ LÝ API (Create + Upload Image) ---
    const handleFinish = async () => {
        setLoading(true);
        try {
            console.log('>>> [Submit] Starting create event...');

            // 1. Chuẩn bị Payload (Map dữ liệu từ State -> Backend DTO)
            const eventPayload = {
                name: formData.name,
                description: formData.description,
                permitNumber: formData.permitNumber,
                permitIssuedBy: formData.permitIssuedBy,
                location: formData.location, // Chuỗi địa điểm đã ghép ở Step 1 hoặc Step 4
                genreId: formData.genreId,

                // Format Ngày
                permitIssuedAt: formData.permitIssuedAt
                    ? dayjs(formData.permitIssuedAt).format('YYYY-MM-DD')
                    : null,
                startDate: formData.startDate
                    ? dayjs(formData.startDate).format('YYYY-MM-DD')
                    : null,
                endDate: formData.endDate
                    ? dayjs(formData.endDate).format('YYYY-MM-DD')
                    : null,

                // Format Giờ (Backend nhận String HH:mm)
                startTime: formData.startTime
                    ? dayjs(formData.startTime).format('HH:mm')
                    : null,
                endTime: formData.endTime
                    ? dayjs(formData.endTime).format('HH:mm')
                    : null,

                // Thêm các thông tin thanh toán từ Step 4
                bankAccountName: formData.bankAccountName,
                bankAccountNumber: formData.bankAccountNumber,
                bankName: formData.bankName,
                bankBranch: formData.bankBranch,
                businessType: formData.businessType,
                taxName: formData.taxName,
                taxAddress: formData.taxAddress,
                taxCode: formData.taxCode
            };

            console.log('Payload:', eventPayload);

            // 2. Gọi API Tạo sự kiện
            // FIX: Dùng eventApi.create (theo refactor mới) thay vì createEvent
            const createRes = await eventApi.create(eventPayload);
            const newEvent = createRes?.data || createRes?.result || createRes; // Handle cấu trúc response

            if (!newEvent || !newEvent.id) {
                throw new Error('Không nhận được ID sự kiện từ hệ thống.');
            }

            const newEventId = newEvent.id;
            console.log('Created Event ID:', newEventId);

            // 3. Upload Hình ảnh (Nếu có)
            if (formData.images && formData.images.length > 0) {
                const imageFormData = new FormData();

                // Append từng file vào FormData
                formData.images.forEach(file => {
                    // Antd Upload file object thường nằm trong 'originFileObj'
                    const fileToUpload = file.originFileObj || file;
                    imageFormData.append('files', fileToUpload);
                });

                // Mặc định ảnh đầu tiên là Cover
                imageFormData.append('coverIndex', 0);

                // Gọi API Upload
                await eventImageApi.uploadEventImages(
                    newEventId,
                    imageFormData
                );
                console.log('Images uploaded successfully');
            }

            // 4. Thành công
            toast.success('Tạo sự kiện thành công!');

            // Clear Storage
            localStorage.removeItem(STORAGE_KEY_DATA);
            localStorage.removeItem(STORAGE_KEY_STEP);

            // Redirect
            setTimeout(() => {
                navigate('/organizer/events');
            }, 1000);
        } catch (error) {
            console.error('Error creating event:', error);
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Có lỗi xảy ra';
            toast.error(`Lỗi: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    // --- MAIN HANDLER: TIẾP TỤC / HOÀN TẤT ---
    const handleNext = async () => {
        // 1. Trigger validation & save data của bước hiện tại (nếu có)
        // Step con sẽ validate, nếu lỗi sẽ throw error -> block process
        if (onNextAction) {
            try {
                // Chờ Step con thực hiện xong (Validate + Update Parent State)
                await onNextAction();
            } catch (error) {
                console.warn('Step validation failed:', error);
                return; // Dừng nếu Step con validate lỗi
            }
        }

        // 2. Kiểm tra nếu là bước cuối -> Gọi API Submit
        if (localCurrentStep === stepItems.length) {
            await handleFinish();
        } else {
            // 3. Nếu chưa cuối -> Chuyển bước kế
            nextStep();
        }
    };

    const handleCancel = () => {
        confirm({
            title: 'Hủy tạo sự kiện?',
            icon: <ExclamationCircleOutlined />,
            content: 'Dữ liệu bạn đã nhập sẽ bị mất hoàn toàn.',
            okText: 'Đồng ý',
            cancelText: 'Không',
            centered: true,
            onOk() {
                localStorage.removeItem(STORAGE_KEY_DATA);
                localStorage.removeItem(STORAGE_KEY_STEP);
                navigate('/organizer/events');
            }
        });
    };

    // Định nghĩa các bước
    const stepItems = [
        {
            title: 'Thông tin',
            icon: <InfoCircleOutlined />,
            content: (
                <Step1Info
                    setOnNextAction={setOnNextAction}
                    formData={formData}
                    setFormData={setFormData}
                    nextStep={null} // Để Parent control nextStep
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
                    nextStep={null}
                />
            )
        },
        {
            title: 'Cài đặt',
            icon: <SettingOutlined />,
            content: (
                <Step3Settings
                    setOnNextAction={setOnNextAction}
                    formData={formData}
                    setFormData={setFormData}
                    nextStep={null}
                />
            )
        },
        {
            title: 'Xác nhận',
            icon: <CreditCardOutlined />,
            content: (
                <Step4Payment
                    setOnNextAction={setOnNextAction}
                    formData={formData}
                    setFormData={setFormData}
                />
            )
        }
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 80 }}>
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
                {stepItems[localCurrentStep - 1]?.content}
            </div>

            {/* Action Bar (Sticky Bottom) */}
            <Card
                bordered={false}
                style={{
                    borderRadius: 0,
                    position: 'fixed',
                    bottom: 0,
                    left: 0, // Cần chỉnh lại theo layout dashboard của bạn (vd: left: 250px)
                    right: 0,
                    zIndex: 999,
                    background: '#2a2d34',
                    borderTop: '1px solid #393f4e',
                    boxShadow: '0 -4px 10px rgba(0,0,0,0.2)'
                }}
                bodyStyle={{ padding: '16px 40px' }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        maxWidth: 1200,
                        margin: '0 auto'
                    }}
                >
                    <Button
                        disabled={localCurrentStep === 1 || loading}
                        onClick={handlePrev}
                        size='large'
                    >
                        Quay lại
                    </Button>

                    <Space>
                        <Button
                            onClick={handleCancel}
                            size='large'
                            disabled={loading}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type='primary'
                            onClick={handleNext}
                            size='large'
                            loading={loading}
                            style={{ minWidth: 140, fontWeight: 600 }}
                        >
                            {localCurrentStep === stepItems.length
                                ? 'Hoàn tất & Tạo'
                                : 'Tiếp tục'}
                        </Button>
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default CreateEvent;
