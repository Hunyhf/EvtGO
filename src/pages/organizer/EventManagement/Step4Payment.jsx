// src/pages/organizer/EventManagement/Step4Payment.jsx
import React, { useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    Card,
    Typography,
    Row,
    Col,
    Divider,
    message
} from 'antd';
import { BankOutlined, AuditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Step4Payment = ({ setOnNextAction, formData, setFormData }) => {
    const [form] = Form.useForm();

    // 1. Hydration: Nạp dữ liệu cũ nếu có
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

    // ----------------------------------------------------------------------
    // 2. LOGIC: ĐĂNG KÝ HÀM VALIDATE CHO CHA (ĐÃ SỬA LỖI CLOSURE)
    // ----------------------------------------------------------------------
    useEffect(() => {
        // Cần triple closure () => () => async () => ...
        // Để tương thích với lời gọi await onNextAction()() ở CreateEvent.jsx
        setOnNextAction(() => () => async () => {
            try {
                // Validate toàn bộ các trường trong Step 4
                const paymentValues = await form.validateFields();

                // Cập nhật dữ liệu vào formData tổng của Cha
                setFormData(prev => ({
                    ...prev,
                    ...paymentValues
                }));

                console.log('>>> [Step 4] Validation & Sync OK');
                return true; // Trả về true để Cha tiến hành gửi API (handleFinish)
            } catch (error) {
                console.error('>>> [Step 4] Validation failed:', error);
                message.error('Vui lòng hoàn thiện thông tin thanh toán!');
                return false; // Trả về false để chặn không cho submit
            }
        });

        // Cleanup action khi unmount bước này
        return () => setOnNextAction(null);
    }, [form, setFormData, setOnNextAction]);

    // --- STYLES ---
    const cardStyle = {
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #2a2d34 0%, #1a2e25 100%)',
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
        marginTop: '8px'
    };

    const labelStyle = { color: '#fff', fontSize: '15px', fontWeight: 500 };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Card bordered={false} style={cardStyle}>
                <Form form={form} layout='vertical'>
                    {/* Thông tin Ngân hàng */}
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
                                Thông tin tài khoản nhận tiền
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
                                            message:
                                                'Vui lòng nhập tên chủ tài khoản'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='Ví dụ: NGUYEN VAN A'
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
                                            message:
                                                'Vui lòng nhập số tài khoản'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='Nhập số tài khoản ngân hàng'
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
                                            message:
                                                'Vui lòng nhập tên ngân hàng'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='Ví dụ: Techcombank'
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
                                            message: 'Vui lòng nhập chi nhánh'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='Ví dụ: Hà Nội'
                                        style={inputStyle}
                                        className='payment-input'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    <Divider style={{ borderColor: '#393f4e' }} />

                    {/* Hoá đơn đỏ */}
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
                                Thông tin xuất hóa đơn (VAT)
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
                                    label={
                                        <span style={labelStyle}>
                                            Tên cá nhân/đơn vị
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập tên'
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
                                            message: 'Vui lòng nhập địa chỉ'
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
                                    label={
                                        <span style={labelStyle}>
                                            Mã số thuế
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập mã số thuế'
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
                .ant-select-selector { background-color: #fff !important; border-radius: 10px !important; height: 48px !important; display: flex !important; align-items: center !important; }
                .payment-input:focus, .payment-input:hover, .ant-select-selector:hover { border-color: #2dc275 !important; box-shadow: 0 0 0 3px rgba(45, 194, 117, 0.2) !important; outline: none; }
            `}</style>
        </div>
    );
};

export default Step4Payment;
