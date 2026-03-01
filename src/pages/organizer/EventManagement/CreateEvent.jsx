// src/pages/organizer/EventManagement/CreateEvent.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Steps, Button, Card, Space, Modal, message } from 'antd';
import {
    InfoCircleOutlined,
    ClockCircleOutlined,
    CreditCardOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { eventApi } from '@apis/eventApi';
import { eventImageApi } from '@apis/eventImageApi';
import { ticketApi } from '@apis/ticketApi';

import Step1Info from './Step1Info';
import Step2Showtimes from './Step2Showtimes';
import Step4Payment from './Step4Payment';

const { confirm } = Modal;
const STORAGE_KEY_DATA = 'evtgo_create_event_data';
const STORAGE_KEY_STEP = 'evtgo_create_event_step';

const CreateEvent = () => {
    const { setCurrentStep, onNextAction, setOnNextAction } =
        useOutletContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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
                  logoFile: null,
                  startTime: null,
                  endTime: null,
                  tickets: []
              };
    });

    useEffect(() => {
        setCurrentStep(localCurrentStep);
    }, [localCurrentStep, setCurrentStep]);

    useEffect(() => {
        // Loại bỏ File object trước khi lưu vào localStorage để tránh lỗi JSON
        const { posterFile, logoFile, ...dataToSave } = formData;
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(dataToSave));
        localStorage.setItem(STORAGE_KEY_STEP, localCurrentStep);
    }, [formData, localCurrentStep]);

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

    const handleFinish = async () => {
        setLoading(true);
        try {
            // 1. Xử lý gộp địa chỉ thành chuỗi location duy nhất cho BE
            const addressParts = [
                formData.addressDetail,
                formData.wardName,
                formData.districtName,
                formData.provinceName
            ].filter(Boolean);
            const fullLocation = [formData.location, ...addressParts].join(
                ', '
            );

            // 2. Build Payload khớp chính xác với ReqEventDTO của Backend
            const finalPayload = {
                name: formData.name,
                description: formData.description,
                permitNumber: formData.permitNumber,
                permitIssuedAt: formData.permitIssuedAt
                    ? dayjs(formData.permitIssuedAt).format('YYYY-MM-DD')
                    : '',
                permitIssuedBy: formData.permitIssuedBy,
                location: fullLocation,
                // Giữ nguyên giờ địa phương bằng cách parse không quan tâm múi giờ UTC
                startDate: formData.startTime
                    ? dayjs(formData.startTime).format('YYYY-MM-DD')
                    : '',
                startTime: formData.startTime
                    ? dayjs(formData.startTime).format('HH:mm')
                    : '',
                endDate: formData.endTime
                    ? dayjs(formData.endTime).format('YYYY-MM-DD')
                    : '',
                endTime: formData.endTime
                    ? dayjs(formData.endTime).format('HH:mm')
                    : '',
                genreId: Number(formData.genreId),
                // BE yêu cầu object organizer chứ không phải String organizerName
                organizer: {
                    name: formData.organizerName
                },
                // Thêm trường price (BE yêu cầu Double) - lấy giá vé đầu tiên làm đại diện
                price:
                    formData.tickets?.length > 0
                        ? Number(formData.tickets[0].price)
                        : 0
            };

            const res = await eventApi.create(finalPayload);
            const newEventId = res.data?.id || res.id;

            if (newEventId) {
                message.success('Thông tin sự kiện đã được lưu!');

                // Tạo vé: Khớp ReqTicketDTO (totalQuantity, ticketType, ticketStatus, price, eventId)
                if (formData.tickets?.length > 0) {
                    const ticketRequests = formData.tickets.map(t =>
                        ticketApi.create({
                            totalQuantity: Number(t.totalQuantity),
                            ticketType: t.ticketType,
                            ticketStatus: t.ticketStatus || 'PUBLISHED',
                            price: Number(t.price),
                            eventId: newEventId
                        })
                    );
                    await Promise.all(ticketRequests);
                }

                // Upload ảnh: Gửi "files" và "coverIndex" theo EventImageController
                if (
                    formData.posterFile instanceof File ||
                    formData.logoFile instanceof File
                ) {
                    const uploadData = new FormData();
                    if (formData.posterFile instanceof File)
                        uploadData.append('files', formData.posterFile);
                    if (formData.logoFile instanceof File)
                        uploadData.append('files', formData.logoFile);

                    uploadData.append('coverIndex', 0); // Giả định poster là file đầu tiên

                    await eventImageApi.uploadEventImages(
                        newEventId,
                        uploadData
                    );
                }

                localStorage.removeItem(STORAGE_KEY_DATA);
                localStorage.removeItem(STORAGE_KEY_STEP);
                navigate('/organizer/events');
            }
        } catch (error) {
            const serverMsg = error.response?.data?.message;
            message.error(
                Array.isArray(serverMsg)
                    ? serverMsg[0]
                    : serverMsg || 'Có lỗi xảy ra!'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (onNextAction) {
            try {
                const isStepValid = await onNextAction()();
                if (!isStepValid) return;
            } catch {
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
            content: 'Toàn bộ dữ liệu bạn đã nhập sẽ bị xóa.',
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
