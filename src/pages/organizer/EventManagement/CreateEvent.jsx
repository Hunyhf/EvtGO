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
import { toast } from 'react-toastify'; // Import Toast để thông báo
import dayjs from 'dayjs'; // Import Dayjs để format ngày giờ

// Import APIs
import { eventApi } from '@apis/eventApi';
import { eventImageApi } from '@apis/eventImageApi';

import Step1Info from './Step1Info';
import Step2Showtimes from './Step2Showtimes';
import Step3Settings from './Step3Settings';
import Step4Payment from './Step4Payment';

const { confirm } = Modal;

// Key để lưu vào LocalStorage
const STORAGE_KEY_DATA = 'evtgo_create_event_data';
const STORAGE_KEY_STEP = 'evtgo_create_event_step';

const CreateEvent = () => {
    const { setCurrentStep, onNextAction, setOnNextAction } =
        useOutletContext();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const [loading, setLoading] = useState(false); // Thêm state loading khi gọi API

    // 1. KHỞI TẠO STATE TỪ LOCALSTORAGE
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
                  genreId: null, // Quan trọng: ID thể loại
                  startDate: null,
                  startTime: null,
                  endDate: null,
                  endTime: null,
                  images: [] // Mảng chứa file ảnh
                  // ... các trường khác
              };
    });

    // Effect: Đồng bộ bước hiện tại
    useEffect(() => {
        setCurrentStep(localCurrentStep);
    }, []);

    // Effect: Lưu LocalStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(formData));
        localStorage.setItem(STORAGE_KEY_STEP, localCurrentStep);
        setCurrentStep(localCurrentStep);
    }, [formData, localCurrentStep, setCurrentStep]);

    // Hàm chuyển bước an toàn
    const nextStep = () => {
        setLocalCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    };

    // --- LOGIC XỬ LÝ HOÀN TẤT (GỌI API) ---
    const handleFinish = async () => {
        setLoading(true);
        try {
            // 1. Chuẩn bị Payload cho API Create Event (JSON)
            // Backend yêu cầu Date dạng String 'YYYY-MM-DD' và Time dạng 'HH:mm'
            const eventPayload = {
                name: formData.name,
                description: formData.description,
                permitNumber: formData.permitNumber,
                permitIssuedBy: formData.permitIssuedBy,
                location: formData.location,
                genreId: formData.genreId, // Đảm bảo Step1 đã lưu genreId

                // Format ngày
                permitIssuedAt: formData.permitIssuedAt
                    ? dayjs(formData.permitIssuedAt).format('YYYY-MM-DD')
                    : '',
                startDate: formData.startDate
                    ? dayjs(formData.startDate).format('YYYY-MM-DD')
                    : '',
                endDate: formData.endDate
                    ? dayjs(formData.endDate).format('YYYY-MM-DD')
                    : '',

                // Format giờ
                startTime: formData.startTime
                    ? dayjs(formData.startTime).format('HH:mm')
                    : '',
                endTime: formData.endTime
                    ? dayjs(formData.endTime).format('HH:mm')
                    : ''
            };

            console.log('Payload gửi đi:', eventPayload);

            // 2. Gọi API tạo sự kiện
            const createRes = await eventApi.createEvent(eventPayload);

            if (!createRes || !createRes.id) {
                throw new Error('Không nhận được ID sự kiện từ hệ thống.');
            }

            const newEventId = createRes.id;
            console.log('Tạo sự kiện thành công, ID:', newEventId);

            // 3. Gọi API Upload ảnh (Nếu có ảnh)
            // Lưu ý: formData.images ở đây phải chứa File Object thực sự (từ Step3)
            if (formData.images && formData.images.length > 0) {
                const imageFormData = new FormData();

                formData.images.forEach(file => {
                    // Ant Design Upload trả về file bọc trong originFileObj
                    // Nếu là file thường thì lấy trực tiếp
                    const fileToUpload = file.originFileObj || file;
                    imageFormData.append('files', fileToUpload);
                });

                // Mặc định ảnh đầu tiên là cover (index 0)
                imageFormData.append('coverIndex', 0);

                await eventImageApi.uploadEventImages(
                    newEventId,
                    imageFormData
                );
                console.log('Upload ảnh thành công');
            }

            // 4. Thành công -> Dọn dẹp và chuyển hướng
            toast.success('Tạo sự kiện thành công!');
            localStorage.removeItem(STORAGE_KEY_DATA);
            localStorage.removeItem(STORAGE_KEY_STEP);
            navigate('/organizer/events');
        } catch (error) {
            console.error('Lỗi tạo sự kiện:', error);
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Có lỗi xảy ra';
            toast.error(`Lỗi: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý nút Tiếp tục / Hoàn tất
    const handleNext = () => {
        // Nếu đang ở bước cuối cùng thì gọi hàm Finish
        if (localCurrentStep === stepItems.length) {
            handleFinish();
            return;
        }

        // Các bước khác: Validate ở component con trước
        if (onNextAction) {
            // Component con (Step1, Step2...) sẽ validate và gọi nextStep nếu ok
            onNextAction();
        } else {
            // Fallback nếu không có validate
            nextStep();
        }
    };

    const handlePrev = () => {
        if (localCurrentStep > 1) {
            setLocalCurrentStep(localCurrentStep - 1);
            setOnNextAction(null); // Reset action
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
            title: 'Hình ảnh & Cài đặt',
            icon: <SettingOutlined />,
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
