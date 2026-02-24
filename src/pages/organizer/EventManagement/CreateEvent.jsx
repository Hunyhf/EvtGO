// src/pages/organizer/EventManagement/CreateEvent.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Steps, Button, Card, Space, Modal, message } from 'antd';
import {
    InfoCircleOutlined,
    ClockCircleOutlined,
    SettingOutlined,
    CreditCardOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import APIs
import { eventApi } from '@apis/eventApi';
import { eventImageApi } from '@apis/eventImageApi';
import { ticketApi } from '@apis/ticketApi'; // Đã thêm import ticketApi

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
                  addressDetail: '',
                  genreId: null,
                  poster: null,
                  posterFile: null,
                  organizerLogo: null,
                  showTimes: []
              };
    });

    useEffect(() => {
        setCurrentStep(localCurrentStep);
    }, [localCurrentStep, setCurrentStep]);

    useEffect(() => {
        const { posterFile, ...dataToSave } = formData;
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(dataToSave));
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
            if (setOnNextAction) setOnNextAction(null);
        }
    };

    // --- LOGIC XỬ LÝ HOÀN TẤT ---
    const handleFinish = async () => {
        setLoading(true);
        try {
            console.log('>>> [Final Submit] Preparing payload...');

            // 1. Chuẩn bị Location
            const parts = [
                formData.addressDetail,
                formData.wardName,
                formData.districtName,
                formData.provinceName
            ].filter(Boolean);
            const fullLocation = parts.join(', ');

            // 2. Format thời gian (lấy từ suất diễn đầu tiên)
            const firstShow =
                formData.showTimes && formData.showTimes.length > 0
                    ? formData.showTimes[0]
                    : {};
            const startDate = firstShow.startTime
                ? dayjs(firstShow.startTime).format('YYYY-MM-DD')
                : '';
            const startTime = firstShow.startTime
                ? dayjs(firstShow.startTime).format('HH:mm')
                : '';
            const endDate = firstShow.endTime
                ? dayjs(firstShow.endTime).format('YYYY-MM-DD')
                : '';
            const endTime = firstShow.endTime
                ? dayjs(firstShow.endTime).format('HH:mm')
                : '';

            // 3. Payload tạo Event (Text Only)
            const finalPayload = {
                name: formData.name,
                description: formData.description,
                permitNumber: formData.permitNumber,
                permitIssuedAt: formData.permitIssuedAt
                    ? dayjs(formData.permitIssuedAt).format('YYYY-MM-DD')
                    : '',
                permitIssuedBy: formData.permitIssuedBy,
                location: fullLocation,
                startDate: startDate,
                startTime: startTime,
                endDate: endDate,
                endTime: endTime,
                genreId: Number(formData.genreId),
                organizerName: formData.organizerName,
                organizerLogo:
                    formData.organizerLogo &&
                    formData.organizerLogo.length < 255
                        ? formData.organizerLogo
                        : null
            };

            console.log('>>> 1. Sending Event Payload:', finalPayload);

            // GỌI API 1: TẠO SỰ KIỆN
            const res = await eventApi.create(finalPayload);

            if (res.data || res.statusCode === 201 || res.id) {
                const newEventId = res.data?.id || res.id;
                message.success('Thông tin sự kiện đã được lưu!');

                // --- GỌI API 2: TẠO VÉ (Đã thêm logic này) ---
                console.log(
                    '>>> 2. Preparing Tickets for Event ID:',
                    newEventId
                );

                const allTickets = [];
                if (formData.showTimes && formData.showTimes.length > 0) {
                    formData.showTimes.forEach(st => {
                        if (st.tickets && st.tickets.length > 0) {
                            st.tickets.forEach(ticket => {
                                allTickets.push({
                                    totalQuantity: ticket.totalQuantity,
                                    ticketType: ticket.ticketType,
                                    ticketStatus: ticket.ticketStatus,
                                    eventId: newEventId
                                });
                            });
                        }
                    });
                }

                if (allTickets.length > 0) {
                    try {
                        // Gọi API tạo từng loại vé
                        await Promise.all(
                            allTickets.map(t => ticketApi.create(t))
                        );
                        message.success(
                            `Đã phát hành thành công ${allTickets.length} loại vé!`
                        );
                    } catch (ticketError) {
                        console.error('Lỗi khi tạo vé:', ticketError);
                        message.warning(
                            'Sự kiện đã tạo nhưng gặp lỗi khi khởi tạo danh sách vé.'
                        );
                    }
                }

                // GỌI API 3: UPLOAD ẢNH POSTER (Nếu có file gốc)
                if (formData.posterFile && newEventId) {
                    try {
                        console.log(
                            '>>> 3. Uploading Poster File for Event ID:',
                            newEventId
                        );
                        const uploadData = new FormData();
                        uploadData.append('files', formData.posterFile);
                        uploadData.append('coverIndex', '0');

                        await eventImageApi.uploadEventImages(
                            newEventId,
                            uploadData
                        );
                        message.success('Đã tải lên ảnh bìa thành công!');
                    } catch (imgError) {
                        console.error('Lỗi lưu ảnh:', imgError);
                        message.warning(
                            'Sự kiện đã tạo nhưng tải ảnh bìa thất bại.'
                        );
                    }
                }

                // Dọn dẹp dữ liệu tạm thời
                localStorage.removeItem(STORAGE_KEY_DATA);
                localStorage.removeItem(STORAGE_KEY_STEP);

                setTimeout(() => {
                    navigate('/organizer/events');
                }, 1500);
            }
        } catch (error) {
            console.error('Submit Error:', error.response?.data || error);
            const responseData = error.response?.data;
            if (responseData && responseData.message) {
                const msgs = responseData.message;
                if (Array.isArray(msgs)) {
                    msgs.forEach(msg => message.error(msg));
                } else {
                    message.error(msgs);
                }
            } else {
                message.error('Có lỗi xảy ra khi kết nối đến server!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (onNextAction) {
            try {
                const isStepValid = await onNextAction()();
                if (!isStepValid) return;
            } catch (error) {
                console.warn('Validation error', error);
                return;
            }
        }

        if (localCurrentStep === stepItems.length) {
            await handleFinish();
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

    const stepItems = [
        {
            title: 'Thông tin',
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
                <Step3Settings
                    setOnNextAction={setOnNextAction}
                    formData={formData}
                    setFormData={setFormData}
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
            <Card
                variant='borderless'
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

            <div style={{ minHeight: '400px', marginBottom: 24 }}>
                {stepItems[localCurrentStep - 1]?.content}
            </div>

            <Card
                variant='borderless'
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
