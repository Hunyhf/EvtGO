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
                  images: []
              };
    });

    useEffect(() => {
        setCurrentStep(localCurrentStep);
    }, [localCurrentStep, setCurrentStep]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(formData));
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

    const handleFinish = async finalData => {
        setLoading(true);
        try {
            const fullLocation = [
                finalData.location,
                finalData.addressDetail,
                finalData.wardName,
                finalData.districtName,
                finalData.provinceName
            ]
                .filter(Boolean)
                .join(', ');

            const eventPayload = {
                name: finalData.name,
                description: finalData.description,
                permitNumber: finalData.permitNumber,
                permitIssuedBy: finalData.permitIssuedBy,
                permitIssuedAt: finalData.permitIssuedAt
                    ? dayjs(finalData.permitIssuedAt).format('YYYY-MM-DD')
                    : '',
                location: fullLocation,
                genreId: finalData.genreId,

                // Dữ liệu từ Step 2
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

            //Gọi API Create Event
            const createRes = await eventApi.create(eventPayload);
            const newEventId = createRes?.data?.id || createRes?.result?.id;

            if (!newEventId) throw new Error('Không lấy được ID sự kiện');

            // Upload Hình ảnh (Multi-part)
            if (finalData.images?.length > 0) {
                const imageFormData = new FormData();
                finalData.images.forEach(file => {
                    imageFormData.append('files', file.originFileObj || file);
                });
                imageFormData.append('coverIndex', 0);
                await eventImageApi.uploadEventImages(
                    newEventId,
                    imageFormData
                );
            }

            toast.success('Tạo sự kiện thành công!');
            localStorage.removeItem(STORAGE_KEY_DATA);
            localStorage.removeItem(STORAGE_KEY_STEP);
            navigate('/organizer/events');
        } catch (error) {
            console.error('Submit Error:', error);
            const msg = error.response?.data?.message;
            toast.error(
                `Lỗi: ${Array.isArray(msg) ? msg.join(', ') : msg || error.message}`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (onNextAction) {
            try {
                // Thực thi hàm trả về từ closure để trigger validate và cập nhật state
                const stepResult = await onNextAction()();
                if (!stepResult) return;
            } catch (error) {
                return; // Dừng nếu validate fail
            }
        }

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
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 80 }}>
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

            <div style={{ minHeight: '400px', marginBottom: 24 }}>
                {stepItems[localCurrentStep - 1]?.content}
            </div>

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
                styles={{ body: { padding: '16px 40px' } }} // FIX AntD Warning
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
