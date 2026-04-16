import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Steps, Button, Card, Space, App } from 'antd';
import {
    InfoCircleOutlined,
    ClockCircleOutlined,
    CreditCardOutlined,
    AppstoreAddOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { eventApi } from '@apis/eventApi';
import { eventImageApi } from '@apis/eventImageApi';
import { ticketApi } from '@apis/ticketApi';
import seatApi from '@apis/seatApi';

import Step1Info from './Step1Info';
import Step2Showtimes from './Step2Showtimes';
import Step3Settings from './Step3Settings';
import Step4Payment from './Step4Payment';

const STORAGE_KEY_DATA = 'evtgo_create_event_data';
const STORAGE_KEY_STEP = 'evtgo_create_event_step';

const CreateEvent = () => {
    // 1. Khởi tạo hook App để lấy instance message/modal đã kết nối Context
    const { message, modal } = App.useApp();

    const { setCurrentStep, onNextAction, setOnNextAction } =
        useOutletContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Khởi tạo step từ localStorage hoặc mặc định là 1
    const [localCurrentStep, setLocalCurrentStep] = useState(() => {
        const savedStep = localStorage.getItem(STORAGE_KEY_STEP);
        return savedStep ? Number(savedStep) : 1;
    });

    // Khởi tạo dữ liệu form
    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem(STORAGE_KEY_DATA);
        return savedData
            ? JSON.parse(savedData)
            : {
                  name: '',
                  description: '',
                  artists: [],
                  permitNumber: '',
                  permitIssuedAt: null,
                  permitIssuedBy: '',
                  location: '',
                  addressDetail: '',
                  genreId: null,
                  poster: null,
                  posterFile: null,
                  organizerLogo: null,
                  logoFile: null,
                  startTime: null,
                  endTime: null,
                  tickets: [],
                  isSeated: false,
                  seatZones: [],
                  seats: [],
                  producerName: '',
                  contactEmail: '',
                  bankName: '',
                  bankAccountNumber: ''
              };
    });

    // Quản lý mảng các bước động dựa trên isSeated
    const stepItems = useMemo(() => {
        const items = [
            { title: 'Thông tin', icon: <InfoCircleOutlined /> },
            { title: 'Thời gian & Vé', icon: <ClockCircleOutlined /> }
        ];

        if (formData.isSeated) {
            items.push({ title: 'Sơ đồ ghế', icon: <AppstoreAddOutlined /> });
        }

        items.push({ title: 'Xác nhận', icon: <CreditCardOutlined /> });
        return items;
    }, [formData.isSeated]);

    // Đồng bộ step hiện tại với layout cha
    useEffect(() => {
        if (setCurrentStep) setCurrentStep(localCurrentStep);
    }, [localCurrentStep, setCurrentStep]);

    // Tự động lưu dữ liệu vào localStorage khi có thay đổi
    useEffect(() => {
        const { posterFile, logoFile, ...dataToSave } = formData;
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(dataToSave));
        localStorage.setItem(STORAGE_KEY_STEP, localCurrentStep);
    }, [formData, localCurrentStep]);

    // Hàm xử lý Hủy bỏ (Xóa dữ liệu nháp và quay lại danh sách)
    const handleCancel = () => {
        modal.confirm({
            title: 'Xác nhận hủy tạo sự kiện?',
            icon: <InfoCircleOutlined style={{ color: '#ff4d4f' }} />,
            content:
                'Toàn bộ thông tin bạn đã nhập sẽ bị xóa và không thể khôi phục.',
            okText: 'Xác nhận hủy',
            okType: 'danger',
            cancelText: 'Tiếp tục nhập',
            centered: true,
            onOk() {
                localStorage.removeItem(STORAGE_KEY_DATA);
                localStorage.removeItem(STORAGE_KEY_STEP);
                message.success('Đã hủy bỏ bản nháp sự kiện');
                navigate('/organizer/events');
            }
        });
    };

    const handlePrev = () => {
        if (localCurrentStep > 1) {
            setLocalCurrentStep(prev => prev - 1);
            // Reset action khi quay lại để tránh gọi nhầm logic cũ
            if (setOnNextAction) setOnNextAction(null);
        }
    };

    // Hàm xử lý lưu tất cả dữ liệu (API Finish)
    const handleFinish = async (stepData = {}) => {
        setLoading(true);
        try {
            const currentData = { ...formData, ...stepData };

            // Xử lý địa chỉ đầy đủ
            const addressParts = [
                currentData.addressDetail,
                currentData.wardName,
                currentData.districtName,
                currentData.provinceName
            ].filter(Boolean);
            const fullLocation = [currentData.location, ...addressParts].join(
                ', '
            );

            // Payload cho Event (Làm sạch dữ liệu số và ngày tháng)
            const finalPayload = {
                name: currentData.name,
                description: currentData.description,
                artists: currentData.artists || [],
                permitNumber: currentData.permitNumber,
                permitIssuedAt: currentData.permitIssuedAt
                    ? dayjs(currentData.permitIssuedAt).format('YYYY-MM-DD')
                    : '',
                permitIssuedBy: currentData.permitIssuedBy,
                location: fullLocation,
                startDate: currentData.startTime
                    ? dayjs(currentData.startTime).format('YYYY-MM-DD')
                    : '',
                startTime: currentData.startTime
                    ? dayjs(currentData.startTime).format('HH:mm')
                    : '',
                endDate: currentData.endTime
                    ? dayjs(currentData.endTime).format('YYYY-MM-DD')
                    : '',
                endTime: currentData.endTime
                    ? dayjs(currentData.endTime).format('HH:mm')
                    : '',
                genreId: Number(currentData.genreId),
                producer: {
                    producerName: currentData.producerName,
                    contactEmail: currentData.contactEmail,
                    bankName: currentData.bankName,
                    bankAccountNumber: currentData.bankAccountNumber
                },
                price:
                    currentData.tickets?.length > 0
                        ? Number(currentData.tickets[0].price)
                        : 0
            };

            // 1. Tạo Event
            const res = await eventApi.create(finalPayload);
            const newEventId = res?.id || res?.data?.id;

            if (!newEventId) {
                throw new Error('Không nhận được ID sự kiện sau khi tạo!');
            }

            // 2. Tạo Vé (Fix lỗi 400: Làm sạch dữ liệu và ép kiểu chính xác)
            if (currentData.tickets?.length > 0) {
                const ticketRequests = currentData.tickets.map(t =>
                    ticketApi.create({
                        totalQuantity: parseInt(t.totalQuantity) || 0,
                        ticketType: String(t.ticketType).toUpperCase(), // Đảm bảo đúng Enum BE
                        ticketStatus: 'PUBLISHED',
                        price: parseFloat(t.price) || 0,
                        eventId: newEventId
                    })
                );
                await Promise.all(ticketRequests);
            }

            // 3. Tạo Sơ đồ ghế (Nếu có)
            if (currentData.isSeated && currentData.seats?.length > 0) {
                const seatRequests = currentData.seats.map(s =>
                    seatApi.createSeat({
                        seatLabel: s.seatLabel,
                        zone: s.zone,
                        price: Number(s.price),
                        status: 'AVAILABLE',
                        eventId: newEventId
                    })
                );
                // Chia chunk để tránh quá tải request (Batch size 50)
                const chunkSize = 50;
                for (let i = 0; i < seatRequests.length; i += chunkSize) {
                    await Promise.all(seatRequests.slice(i, i + chunkSize));
                }
            }

            // 4. Upload ảnh Poster và Logo
            if (
                currentData.posterFile instanceof File ||
                currentData.logoFile instanceof File
            ) {
                const uploadData = new FormData();
                if (currentData.posterFile instanceof File)
                    uploadData.append('files', currentData.posterFile);
                if (currentData.logoFile instanceof File)
                    uploadData.append('files', currentData.logoFile);
                uploadData.append('coverIndex', 0);
                await eventImageApi.uploadEventImages(newEventId, uploadData);
            }

            // Dọn dẹp storage và thông báo thành công
            localStorage.removeItem(STORAGE_KEY_DATA);
            localStorage.removeItem(STORAGE_KEY_STEP);
            message.success('Tạo sự kiện thành công!');
            navigate('/organizer/events');
        } catch (error) {
            console.error('Final Submission Error:', error);
            const errorMsg =
                error.response?.data?.message ||
                'Có lỗi xảy ra khi hoàn tất sự kiện!';
            message.error(`Lỗi: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        setLoading(true);
        try {
            let resultData = null;

            // Fix logic gọi validate: kiểm tra onNextAction có tồn tại và là function
            if (typeof onNextAction === 'function') {
                // onNextAction trả về 1 async function (Logic 2 lớp chuẩn)
                const validator = onNextAction();
                if (typeof validator === 'function') {
                    const actionResult = await validator();
                    // Nếu validate trả về false, dừng chuyển bước
                    if (!actionResult) {
                        setLoading(false);
                        return;
                    }
                    if (typeof actionResult === 'object')
                        resultData = actionResult;
                }
            }

            // Kiểm tra xem đã đến bước cuối cùng chưa
            if (localCurrentStep === stepItems.length) {
                await handleFinish(resultData);
            } else {
                setLocalCurrentStep(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error('Next Step Logic Error:', err);
            message.error('Có lỗi xảy ra khi chuyển bước!');
        } finally {
            // Chỉ tắt loading nếu chưa hoàn tất (để tránh nút nháy khi navigate)
            if (localCurrentStep !== stepItems.length) {
                setLoading(false);
            }
        }
    };

    // Render component nội dung bước hiện tại
    const renderStepContent = () => {
        const commonProps = { setOnNextAction, formData, setFormData };

        if (localCurrentStep === 1) return <Step1Info {...commonProps} />;
        if (localCurrentStep === 2) return <Step2Showtimes {...commonProps} />;

        if (formData.isSeated) {
            if (localCurrentStep === 3)
                return <Step3Settings {...commonProps} />;
            if (localCurrentStep === 4)
                return <Step4Payment {...commonProps} />;
        } else {
            // Nếu không có ghế, skip bước 3 settings
            if (localCurrentStep === 3)
                return <Step4Payment {...commonProps} />;
        }
        return null;
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 100 }}>
            {/* Thanh tiến trình */}
            <Card
                variant='borderless'
                style={{
                    marginBottom: 24,
                    borderRadius: 8,
                    background: '#2a2d34'
                }}
            >
                <Steps current={localCurrentStep - 1} items={stepItems} />
            </Card>

            {/* Nội dung từng bước */}
            <div style={{ minHeight: '400px', marginBottom: 24 }}>
                {renderStepContent()}
            </div>

            {/* Thanh điều hướng cố định bên dưới */}
            <Card
                variant='borderless'
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 999,
                    background: '#2a2d34',
                    borderTop: '1px solid #393f4e'
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
                            danger
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type='primary'
                            onClick={handleNext}
                            size='large'
                            loading={loading}
                            style={{
                                minWidth: 140,
                                fontWeight: 600,
                                background: '#2dc275',
                                borderColor: '#2dc275'
                            }}
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
