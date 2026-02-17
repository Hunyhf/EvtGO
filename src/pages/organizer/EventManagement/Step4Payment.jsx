// src/pages/organizer/EventManagement/Step4Payment.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Form,
    Input,
    Select,
    Card,
    Typography,
    Row,
    Col,
    Divider,
    Button,
    App // Import App
} from 'antd';
import { BankOutlined, AuditOutlined } from '@ant-design/icons';
import { callCreateEvent } from '@apis/eventApi';

const { Title, Text } = Typography;
const { Option } = Select;

const Step4Payment = ({ setOnNextAction, formData, setFormData }) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const { message: messageApi } = App.useApp();

    // ... (Giữ nguyên phần useEffect Init Data) ...
    useEffect(() => {
        if (formData) {
            form.setFieldsValue({
                bankAccountName: formData.bankAccountName || '',
                bankAccountNumber: formData.bankAccountNumber || '',
                bankName: formData.bankName || '',
                bankBranch: formData.bankBranch || '',
                businessType: formData.businessType || 'personal',
                taxName: formData.taxName || '',
                taxAddress: formData.taxAddress || '',
                taxCode: formData.taxCode || ''
            });
        }
    }, [formData, form]);

    // 2. SỬA LOGIC GỬI JSON
    useEffect(() => {
        setOnNextAction(() => async () => {
            try {
                const paymentValues = await form.validateFields();
                const finalData = { ...formData, ...paymentValues };
                setFormData(finalData);

                // --- CHUẨN BỊ DỮ LIỆU JSON ĐỂ GỬI BE ---
                // Backend yêu cầu ReqEventDTO, ta phải map đúng tên trường

                // Xử lý thời gian (Lấy suất diễn đầu tiên vì BE hiện tại chỉ lưu 1 mốc thời gian)
                let startTime = null;
                let endTime = null;
                if (finalData.showTimes && finalData.showTimes.length > 0) {
                    startTime = finalData.showTimes[0].startTime;
                    endTime = finalData.showTimes[0].endTime;
                }

                // Xử lý địa chỉ
                const locationStr =
                    (finalData.locationName || '') +
                    (finalData.addressDetail
                        ? ', ' + finalData.addressDetail
                        : '');

                // Tạo Object JSON khớp với ReqEventDTO trong Java
                const payload = {
                    name: finalData.name,
                    description: finalData.description || '',
                    location: locationStr,
                    province: finalData.province,
                    genreId: finalData.genreId,
                    startTime: startTime, // format ISO string từ step 2
                    endTime: endTime, // format ISO string từ step 2
                    // Các trường bắt buộc khác của BE (nếu có validation @NotNull)
                    startDate: startTime ? startTime.split('T')[0] : null, // BE có trường startDate riêng
                    endDate: endTime ? endTime.split('T')[0] : null // BE có trường endDate riêng
                };

                console.log('Payload sending to BE:', payload);

                // --- GỌI API ---
                setLoading(true);
                messageApi.loading({
                    content: 'Đang tạo sự kiện...',
                    key: 'create'
                });

                await callCreateEvent(payload);

                messageApi.success({
                    content:
                        'Tạo sự kiện thành công! (Lưu ý: Ảnh và Vé chưa được lưu do hạn chế BE)',
                    key: 'create',
                    duration: 3
                });

                // Cleanup & Redirect
                localStorage.removeItem('evtgo_create_event_data');
                localStorage.removeItem('evtgo_create_event_step');

                setTimeout(() => {
                    navigate('/organizer/events');
                }, 1000);
            } catch (error) {
                console.error('Create Event Error:', error);
                const errorMsg =
                    error.response?.data?.message ||
                    error.message ||
                    'Lỗi không xác định';
                messageApi.error({
                    content: 'Lỗi: ' + errorMsg,
                    key: 'create'
                });
                // Không throw error để tránh lỗi uncaught promise, chỉ dừng loading
            } finally {
                setLoading(false);
            }
        });
    }, [form, setOnNextAction, formData, setFormData, navigate, messageApi]);

    // ... (Phần Style và Return giữ nguyên như cũ) ...
    // ... (Copy lại phần giao diện Return từ code cũ của bạn) ...
    const cardStyle = {
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #141414 0%, #0f2e1f 100%)',
        border: '1px solid #393f4e',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        padding: '24px'
    };
    const inputStyle = {
        backgroundColor: '#fff',
        color: '#1f1f1f',
        borderRadius: '10px',
        border: '1px solid #e5e7eb',
        height: '48px',
        fontSize: '16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        marginTop: '8px'
    };
    const labelStyle = { color: '#fff', fontSize: '15px', fontWeight: 500 };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Card bordered={false} style={cardStyle}>
                <Form form={form} layout='vertical'>
                    <div style={{ marginBottom: 32 }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: 12
                            }}
                        >
                            <BankOutlined
                                style={{
                                    fontSize: 24,
                                    color: '#2dc275',
                                    marginRight: 12
                                }}
                            />
                            <Title
                                level={3}
                                style={{ color: '#fff', margin: 0 }}
                            >
                                Thông tin thanh toán
                            </Title>
                        </div>
                        <Text
                            style={{
                                color: '#9ca6b0',
                                display: 'block',
                                marginBottom: 24,
                                paddingLeft: 36
                            }}
                        >
                            Doanh thu bán vé sẽ được đối soát và chuyển khoản
                            vào tài khoản này sau khi sự kiện kết thúc.
                        </Text>
                        <Row gutter={[24, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    name='bankAccountName'
                                    label={
                                        <span style={labelStyle}>
                                            Chủ tài khoản
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Nhập chủ tài khoản'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='NGUYEN VAN A'
                                        style={inputStyle}
                                        className='payment-input'
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name='bankAccountNumber'
                                    label={
                                        <span style={labelStyle}>
                                            Số tài khoản
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Nhập số tài khoản'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='VD: 1902xxxxxxx'
                                        style={inputStyle}
                                        className='payment-input'
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name='bankName'
                                    label={
                                        <span style={labelStyle}>
                                            Tên ngân hàng
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Nhập tên ngân hàng'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='VD: Techcombank'
                                        style={inputStyle}
                                        className='payment-input'
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name='bankBranch'
                                    label={
                                        <span style={labelStyle}>
                                            Chi nhánh
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Nhập chi nhánh'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='VD: Hà Nội'
                                        style={inputStyle}
                                        className='payment-input'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                    <Divider style={{ borderColor: '#393f4e' }} />
                    <div style={{ marginTop: 32 }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: 24
                            }}
                        >
                            <AuditOutlined
                                style={{
                                    fontSize: 24,
                                    color: '#2dc275',
                                    marginRight: 12
                                }}
                            />
                            <Title
                                level={3}
                                style={{ color: '#fff', margin: 0 }}
                            >
                                Hoá đơn đỏ
                            </Title>
                        </div>
                        <Row gutter={[24, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    name='businessType'
                                    label={
                                        <span style={labelStyle}>
                                            Loại hình
                                        </span>
                                    }
                                >
                                    <Select
                                        size='large'
                                        style={{ width: '100%' }}
                                        dropdownStyle={{
                                            background: '#2a2d34',
                                            color: '#fff'
                                        }}
                                        defaultValue='personal'
                                    >
                                        <Option value='personal'>
                                            Cá nhân
                                        </Option>
                                        <Option value='business'>
                                            Doanh nghiệp
                                        </Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name='taxName'
                                    label={<span style={labelStyle}>Tên</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Nhập tên thuế'
                                        }
                                    ]}
                                >
                                    <Input
                                        style={inputStyle}
                                        className='payment-input'
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name='taxAddress'
                                    label={
                                        <span style={labelStyle}>Địa chỉ</span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Nhập địa chỉ thuế'
                                        }
                                    ]}
                                >
                                    <Input
                                        style={inputStyle}
                                        className='payment-input'
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name='taxCode'
                                    label={<span style={labelStyle}>MST</span>}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Nhập mã số thuế'
                                        }
                                    ]}
                                >
                                    <Input
                                        style={inputStyle}
                                        className='payment-input'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </Card>
            <style>{`
                .ant-select-selector { background-color: #fff !important; border-radius: 10px !important; height: 48px !important; display: flex !important; align-items: center !important; border: 1px solid #e5e7eb !important; }
                .payment-input:focus, .payment-input:hover, .ant-select-selector:hover, .ant-select-focused .ant-select-selector { border-color: #2dc275 !important; box-shadow: 0 0 0 3px rgba(45, 194, 117, 0.25) !important; outline: none; }
                .ant-input-show-count-suffix { color: #9ca6b0; }
            `}</style>
        </div>
    );
};

export default Step4Payment;
