import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { Steps, Button, Card, Space, Modal, App, Spin } from 'antd';
import {
    InfoCircleOutlined,
    ClockCircleOutlined,
    SettingOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { eventApi } from '@apis/eventApi';
import { ticketApi } from '@apis/ticketApi';
import Step1Info from './Step1Info';
import Step2Showtimes from './Step2Showtimes';
import Step3Settings from './Step3Settings';
import Step4Payment from './Step4Payment';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const { setCurrentStep, onNextAction, setOnNextAction } =
        useOutletContext();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [localCurrentStep, setLocalCurrentStep] = useState(1);
    const [formData, setFormData] = useState({ showTimes: [] });

    // 1. Tải dữ liệu cũ của sự kiện
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                setFetching(true);
                const [eventRes, ticketRes] = await Promise.all([
                    eventApi.getById(id),
                    ticketApi.getAll({ eventId: id })
                ]);

                const eventData = eventRes.result || eventRes;
                const ticketData =
                    ticketRes?.result?.content || ticketRes?.result || [];

                setFormData({
                    ...eventData,
                    addressDetail: eventData.location, // Giả định trường dữ liệu
                    permitIssuedAt: eventData.permitIssuedAt
                        ? dayjs(eventData.permitIssuedAt)
                        : null,
                    showTimes: [
                        {
                            startTime: dayjs(
                                `${eventData.startDate} ${eventData.startTime}`
                            ),
                            endTime: dayjs(
                                `${eventData.endDate} ${eventData.endTime}`
                            ),
                            tickets: ticketData.map(t => ({
                                id: t.id,
                                ticketType: t.ticketType,
                                totalQuantity: t.quantity,
                                ticketStatus: t.status
                            }))
                        }
                    ]
                });
            } catch (error) {
                message.error('Không thể tải thông tin sự kiện!');
                navigate('/organizer/events');
            } finally {
                setFetching(false);
            }
        };
        fetchEventData();
    }, [id, navigate, message]);

    useEffect(() => {
        setCurrentStep(localCurrentStep);
    }, [localCurrentStep, setCurrentStep]);

    // 2. Logic cập nhật dữ liệu (Gửi thẳng về data)
    const handleFinish = async () => {
        setLoading(true);
        try {
            const finalPayload = {
                name: formData.name,
                description: formData.description,
                location: formData.addressDetail,
                startDate: dayjs(formData.showTimes[0].startTime).format(
                    'YYYY-MM-DD'
                ),
                startTime: dayjs(formData.showTimes[0].startTime).format(
                    'HH:mm'
                ),
                endDate: dayjs(formData.showTimes[0].endTime).format(
                    'YYYY-MM-DD'
                ),
                endTime: dayjs(formData.showTimes[0].endTime).format('HH:mm'),
                genreId: Number(formData.genreId)
            };

            await eventApi.update(id, finalPayload);
            message.success(
                'Cập nhật sự kiện thành công! Chờ Admin duyệt lại.'
            );
            navigate('/organizer/events');
        } catch (error) {
            message.error('Lỗi khi lưu dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (onNextAction) {
            const isStepValid = await onNextAction()();
            if (!isStepValid) return;
        }
        if (localCurrentStep === 4) handleFinish();
        else setLocalCurrentStep(p => p + 1);
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

    if (fetching)
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size='large' tip='Đang tải dữ liệu...' />
            </div>
        );

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 100 }}>
            <Card style={{ marginBottom: 24, background: '#2a2d34' }}>
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
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 999,
                    background: '#2a2d34',
                    borderTop: '1px solid #393f4e'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        maxWidth: 1200,
                        margin: '0 auto'
                    }}
                >
                    <Button
                        disabled={localCurrentStep === 1 || loading}
                        onClick={() => setLocalCurrentStep(p => p - 1)}
                        size='large'
                    >
                        Quay lại
                    </Button>
                    <Button
                        type='primary'
                        loading={loading}
                        onClick={handleNext}
                        size='large'
                        style={{
                            background: '#2dc275',
                            borderColor: '#2dc275'
                        }}
                    >
                        {localCurrentStep === 4 ? 'Lưu thay đổi' : 'Tiếp tục'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default EditEvent;
