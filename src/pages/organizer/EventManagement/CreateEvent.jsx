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
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

// Import APIs - Đã refactor sang Named Export
import { eventApi } from '@apis/eventApi';
import { eventImageApi } from '@apis/eventImageApi';

import Step1Info from './Step1Info';
import Step2Showtimes from './Step2Showtimes';
import Step3Settings from './Step3Settings';
import Step4Payment from './Step4Payment';

const { confirm } = Modal;
const STORAGE_KEY_DATA = 'evtgo_create_event_data';
const STORAGE_KEY_STEP = 'evtgo_create_event_step';

const CreateEvent = () => {
    const { setCurrentStep, onNextAction, setOnNextAction } =
        useOutletContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // 1. STATE MANAGEMENT
    // Khôi phục bước hiện tại từ LocalStorage
    const [localCurrentStep, setLocalCurrentStep] = useState(() => {
        const savedStep = localStorage.getItem(STORAGE_KEY_STEP);
        return savedStep ? Number(savedStep) : 1;
    });

    // Khôi phục dữ liệu form (Data Hydration)
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
                  addressDetail: '',
                  genreId: null,
                  images: []
              };
    });

    // Cập nhật bước hiện tại lên Layout chính
    useEffect(() => {
        setCurrentStep(localCurrentStep);
    }, [localCurrentStep, setCurrentStep]);

    // Tự động lưu dữ liệu vào LocalStorage khi có thay đổi (Auto-save)
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(formData));
        localStorage.setItem(STORAGE_KEY_STEP, localCurrentStep);
    }, [formData, localCurrentStep]);

    // --- ĐIỀU HƯỚNG ---
    const nextStep = () => {
        setLocalCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrev = () => {
        if (localCurrentStep > 1) {
            setLocalCurrentStep(prev => prev - 1);
            // Quan trọng: Reset action của bước trước đó để tránh chạy nhầm validate
            if (setOnNextAction) setOnNextAction(null);
        }
    };

    // --- LOGIC XỬ LÝ HOÀN TẤT (CALL API CREATE) ---
    const handleFinish = async finalData => {
        setLoading(true);
        try {
            console.log('>>> [Final Submit] Preparing payload...');

            // 1. Ghép chuỗi địa chỉ (Normalizing Location)
            const fullLocation = [
                finalData.location, // Tên địa điểm
                finalData.addressDetail,
                finalData.wardName,
                finalData.districtName,
                finalData.provinceName
            ]
                .filter(Boolean)
                .join(', ');

            // 2. Map dữ liệu chuẩn theo ReqEventDTO (Backend Java)
            const eventPayload = {
                name: finalData.name,
                description: finalData.description,
                permitNumber: finalData.permitNumber,
                permitIssuedBy: finalData.permitIssuedBy,
                // Định dạng ngày theo YYYY-MM-DD
                permitIssuedAt: finalData.permitIssuedAt
                    ? dayjs(finalData.permitIssuedAt).format('YYYY-MM-DD')
                    : '',
                location: fullLocation,
                genreId: finalData.genreId,

                // Dữ liệu thời gian (Giả định từ Step 2)
                startDate: finalData.startDate
                    ? dayjs(finalData.startDate).format('YYYY-MM-DD')
                    : '',
                startTime: finalData.startTime
                    ? dayjs(finalData.startTime).format('HH:mm')
                    : '',
                endDate: finalData.endDate
                    ? dayjs(finalData.endDate).format('YYYY-MM-DD')
                    : '',
                endTime: finalData.endTime
                    ? dayjs(finalData.endTime).format('HH:mm')
                    : ''
            };

            console.log('>>> Sending payload to Backend:', eventPayload);

            // 3. Gọi API tạo sự kiện
            const createRes = await eventApi.create(eventPayload);
            const newEventId = createRes?.data?.id || createRes?.result?.id;

            if (!newEventId)
                throw new Error('Hệ thống không trả về ID sự kiện mới.');

            // 4. Xử lý Upload ảnh (nếu có)
            if (finalData.images && finalData.images.length > 0) {
                const imageFormData = new FormData();
                finalData.images.forEach(file => {
                    // Lấy file object thực tế từ AntD Upload hoặc từ state
                    const fileToUpload = file.originFileObj || file;
                    imageFormData.append('files', fileToUpload);
                });
                imageFormData.append('coverIndex', 0); // Mặc định ảnh 1 là ảnh bìa

                await eventImageApi.uploadEventImages(
                    newEventId,
                    imageFormData
                );
                console.log('>>> Images uploaded successfully');
            }

            // 5. Kết thúc thành công
            toast.success('Tạo sự kiện thành công!');

            // Xóa dữ liệu tạm sau khi thành công
            localStorage.removeItem(STORAGE_KEY_DATA);
            localStorage.removeItem(STORAGE_KEY_STEP);

            navigate('/organizer/events');
        } catch (error) {
            console.error('Submit Error:', error);
            // Xử lý thông báo lỗi chi tiết từ Backend (400 Bad Request)
            const errorData = error.response?.data;
            const msg = errorData?.message;

            if (Array.isArray(msg)) {
                // Nếu BE trả về mảng các lỗi validation
                msg.forEach(m => toast.error(m));
            } else {
                toast.error(
                    msg || error.message || 'Lỗi không xác định khi tạo sự kiện'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // --- XỬ LÝ NÚT TIẾP TỤC ---
    const handleNext = async () => {
        // Nếu Component con có đăng ký hàm validate
        if (onNextAction) {
            try {
                // Thực thi closure function (onNextAction trả về hàm async)
                // Phải gọi 2 lần: onNextAction() để lấy hàm, và () để thực thi hàm đó
                const isStepValid = await onNextAction()();
                if (!isStepValid) return; // Nếu validate fail, dừng lại
            } catch (error) {
                console.warn('Validation error in step component');
                return;
            }
        }

        // Kiểm tra nếu là bước cuối cùng thì submit, ngược lại thì chuyển trang
        if (localCurrentStep === stepItems.length) {
            await handleFinish(formData);
        } else {
            nextStep();
        }
    };

    const handleCancel = () => {
        confirm({
            title: 'Hủy tạo sự kiện?',
            icon: <ExclamationCircleOutlined />,
            content: 'Toàn bộ dữ liệu bạn đã nhập sẽ bị xóa bỏ.',
            okText: 'Xác nhận',
            cancelText: 'Quay lại',
            centered: true,
            onOk() {
                localStorage.removeItem(STORAGE_KEY_DATA);
                localStorage.removeItem(STORAGE_KEY_STEP);
                navigate('/organizer/events');
            }
        });
    };

    // Định nghĩa nội dung các bước
    const stepItems = [
        {
            title: 'Thông tin',
            icon: <InfoCircleOutlined />,
            content: (
                <Step1Info
                    setOnNextAction={setOnNextAction}
                    formData={formData}
                    setFormData={setFormData}
                    nextStep={null}
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
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 100 }}>
            {/* Thanh tiến trình */}
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

            {/* Nội dung từng bước */}
            <div style={{ minHeight: '400px', marginBottom: 24 }}>
                {stepItems[localCurrentStep - 1]?.content}
            </div>

            {/* Thanh tác vụ dưới cùng (Sticky) */}
            <Card
                bordered={false}
                style={{
                    borderRadius: 0,
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 999,
                    background: '#2a2d34',
                    borderTop: '1px solid #393f4e',
                    boxShadow: '0 -4px 10px rgba(0,0,0,0.2)'
                }}
                styles={{ body: { padding: '16px 40px' } }}
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

                    <Space size='middle'>
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
