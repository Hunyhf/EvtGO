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

import { eventApi } from '@apis/eventApi';
import { eventImageApi } from '@apis/eventImageApi';
import { ticketApi } from '@apis/ticketApi';

import Step1Info from './Step1Info';
import Step2Showtimes from './Step2Showtimes';
import Step3Settings from './Step3Settings';
import Step4Payment from './Step4Payment';

const { confirm } = Modal;

/**
 * Key lưu trữ dữ liệu tạo sự kiện vào LocalStorage
 */
const STORAGE_KEY_DATA = 'evtgo_create_event_data';
const STORAGE_KEY_STEP = 'evtgo_create_event_step';

const CreateEvent = () => {
    /**
     * Lấy context từ Layout cha (quản lý step và validation giữa các bước)
     */
    const { setCurrentStep, onNextAction, setOnNextAction } =
        useOutletContext();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    /**
     * Quản lý step hiện tại (có lưu LocalStorage để không mất dữ liệu khi reload)
     */
    const [localCurrentStep, setLocalCurrentStep] = useState(() => {
        const savedStep = localStorage.getItem(STORAGE_KEY_STEP);
        return savedStep ? Number(savedStep) : 1;
    });

    /**
     * State lưu toàn bộ dữ liệu form tạo sự kiện
     */
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
                  startTime: null,
                  endTime: null,
                  tickets: []
              };
    });

    /**
     * Đồng bộ step lên layout cha
     */
    useEffect(() => {
        setCurrentStep(localCurrentStep);
    }, [localCurrentStep, setCurrentStep]);

    /**
     * Tự động lưu dữ liệu vào LocalStorage khi form thay đổi
     * Loại bỏ posterFile vì không thể stringify file object
     */
    useEffect(() => {
        const { posterFile, ...dataToSave } = formData;
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(dataToSave));
        localStorage.setItem(STORAGE_KEY_STEP, localCurrentStep);
    }, [formData, localCurrentStep]);

    /**
     * Chuyển sang bước tiếp theo
     */
    const nextStep = () => {
        setLocalCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Quay lại bước trước
     */
    const handlePrev = () => {
        if (localCurrentStep > 1) {
            setLocalCurrentStep(prev => prev - 1);
            if (setOnNextAction) setOnNextAction(null);
        }
    };

    /**
     * Xử lý hoàn tất tạo sự kiện:
     * 1. Tạo event
     * 2. Tạo ticket
     * 3. Upload poster
     * 4. Clear localStorage và điều hướng
     */
    const handleFinish = async () => {
        setLoading(true);

        try {
            /**
             * Ghép địa chỉ đầy đủ từ các phần nhỏ
             */
            const parts = [
                formData.addressDetail,
                formData.wardName,
                formData.districtName,
                formData.provinceName
            ].filter(Boolean);

            const fullLocation = parts.join(', ');

            /**
             * Format thời gian theo chuẩn backend yêu cầu
             */
            const startDate = formData.startTime
                ? dayjs(formData.startTime).format('YYYY-MM-DD')
                : '';

            const startTime = formData.startTime
                ? dayjs(formData.startTime).format('HH:mm')
                : '';

            const endDate = formData.endTime
                ? dayjs(formData.endTime).format('YYYY-MM-DD')
                : '';

            const endTime = formData.endTime
                ? dayjs(formData.endTime).format('HH:mm')
                : '';

            /**
             * Payload tạo Event
             */
            const finalPayload = {
                name: formData.name,
                description: formData.description,
                permitNumber: formData.permitNumber,
                permitIssuedAt: formData.permitIssuedAt
                    ? dayjs(formData.permitIssuedAt).format('YYYY-MM-DD')
                    : '',
                permitIssuedBy: formData.permitIssuedBy,
                location: fullLocation || formData.location,
                startDate,
                startTime,
                endDate,
                endTime,
                genreId: Number(formData.genreId),
                organizerName: formData.organizerName
            };

            /**
             * GỌI API 1: Tạo sự kiện
             */
            const res = await eventApi.create(finalPayload);
            const newEventId = res.data?.id || res.id;

            if (newEventId) {
                message.success('Thông tin sự kiện đã được lưu!');

                /**
                 * GỌI API 2: Tạo danh sách vé
                 */
                if (formData.tickets?.length > 0) {
                    try {
                        const ticketRequests = formData.tickets.map(t =>
                            ticketApi.create({
                                totalQuantity: t.totalQuantity,
                                ticketType: t.ticketType,
                                ticketStatus: t.ticketStatus,
                                price: t.price,
                                eventId: newEventId
                            })
                        );

                        await Promise.all(ticketRequests);

                        message.success(
                            `Đã phát hành ${formData.tickets.length} loại vé!`
                        );
                    } catch (ticketError) {
                        message.warning(
                            'Sự kiện đã tạo nhưng khởi tạo vé thất bại.'
                        );
                    }
                }

                /**
                 * GỌI API 3: Upload ảnh poster
                 */
                if (formData.posterFile) {
                    try {
                        const uploadData = new FormData();
                        uploadData.append('files', formData.posterFile);
                        uploadData.append('coverIndex', '0');

                        await eventImageApi.uploadEventImages(
                            newEventId,
                            uploadData
                        );

                        message.success('Đã tải lên ảnh poster!');
                    } catch (imgError) {
                        message.warning(
                            'Sự kiện đã tạo nhưng tải ảnh thất bại.'
                        );
                    }
                }

                /**
                 * Dọn dẹp dữ liệu tạm
                 */
                localStorage.removeItem(STORAGE_KEY_DATA);
                localStorage.removeItem(STORAGE_KEY_STEP);

                navigate('/organizer/events');
            }
        } catch (error) {
            const serverMsg = error.response?.data?.message;

            message.error(
                Array.isArray(serverMsg)
                    ? serverMsg[0]
                    : serverMsg || 'Có lỗi xảy ra khi kết nối máy chủ!'
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Xử lý khi bấm nút Tiếp tục / Hoàn tất
     * Hỗ trợ validate từ component con qua onNextAction
     */
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

    /**
     * Xử lý hủy tạo sự kiện
     */
    const handleCancel = () => {
        confirm({
            title: 'Hủy tạo sự kiện?',
            icon: <ExclamationCircleOutlined />,
            content: 'Toàn bộ dữ liệu bạn đã nhập sẽ bị xóa.',
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

    /**
     * Danh sách các bước tạo sự kiện
     */
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
