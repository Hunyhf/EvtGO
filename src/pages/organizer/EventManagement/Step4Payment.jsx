// src/pages/organizer/EventManagement/Step4Payment.jsx
import React, { useEffect } from 'react';
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
    message
} from 'antd';
import { BankOutlined, AuditOutlined } from '@ant-design/icons';

// Import API (Giả sử bạn đã có hàm createEvent)
// import { callCreateEvent } from '@apis/eventApi';

const { Title, Text } = Typography;
const { Option } = Select;

const Step4Payment = ({ setOnNextAction, formData, setFormData }) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // 1. Init Data (Fill dữ liệu nếu đã có trong draft)
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

    // 2. Đăng ký hành động cho nút "Hoàn tất"
    useEffect(() => {
        setOnNextAction(() => async () => {
            try {
                // Validate Form hiện tại
                const values = await form.validateFields();

                // Merge dữ liệu cuối cùng
                const finalData = { ...formData, ...values };
                setFormData(finalData);

                // --- GỌI API TẠO SỰ KIỆN Ở ĐÂY ---
                console.log('FINAL EVENT DATA:', finalData);
                message.loading({
                    content: 'Đang tạo sự kiện...',
                    key: 'create'
                });

                // Giả lập API call
                await new Promise(resolve => setTimeout(resolve, 2000));

                // await callCreateEvent(finalData); // Gọi API thật

                message.success({
                    content: 'Tạo sự kiện thành công!',
                    key: 'create'
                });

                // Xóa draft và chuyển hướng
                localStorage.removeItem('evtgo_create_event_data');
                localStorage.removeItem('evtgo_create_event_step');
                navigate('/organizer/events');
            } catch (error) {
                console.error(error);
                message.error('Vui lòng kiểm tra lại thông tin thanh toán!');
                throw new Error('Submit failed');
            }
        });
    }, [form, setOnNextAction, formData, setFormData, navigate]);

    // --- STYLES CUSTOM ---
    const cardStyle = {
        borderRadius: '16px',
        // Black-to-purple/green gradient background
        background: 'linear-gradient(135deg, #141414 0%, #0f2e1f 100%)',
        border: '1px solid #393f4e',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        padding: '24px'
    };

    // Custom Input Style (White bg, rounded, shadow)
    const inputStyle = {
        backgroundColor: '#fff',
        color: '#1f1f1f',
        borderRadius: '10px',
        border: '1px solid #e5e7eb',
        height: '48px',
        fontSize: '16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        marginTop: '8px' // Space label and input
    };

    const labelStyle = {
        color: '#fff',
        fontSize: '15px',
        fontWeight: 500,
        marginBottom: 0
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Card bordered={false} style={cardStyle}>
                <Form form={form} layout='vertical'>
                    {/* SECTION 1: BANK INFO */}
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
                            vào tài khoản này sau khi sự kiện kết thúc. Vui lòng
                            nhập chính xác.
                        </Text>

                        <Row gutter={[24, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    name='bankAccountName'
                                    label={
                                        <span style={labelStyle}>
                                            Chủ tài khoản (Viết hoa không dấu)
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
                                        placeholder='NGUYEN VAN A'
                                        style={inputStyle}
                                        maxLength={100}
                                        showCount
                                        className='payment-input' // Class for neon glow
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
                                        placeholder='VD: 1902xxxxxxx'
                                        style={inputStyle}
                                        maxLength={50}
                                        className='payment-input'
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12} xs={24} md={12}>
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
                                        placeholder='VD: Techcombank'
                                        style={inputStyle}
                                        className='payment-input'
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12} xs={24} md={12}>
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
                                        placeholder='VD: Sở giao dịch Hà Nội'
                                        style={inputStyle}
                                        className='payment-input'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    <Divider style={{ borderColor: '#393f4e' }} />

                    {/* SECTION 2: VAT INVOICE */}
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
                                            Loại hình kinh doanh
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
                                            Họ tên / Tên doanh nghiệp
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Nhập thông tin này'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='Nhập tên cá nhân hoặc công ty'
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
                                            message: 'Nhập địa chỉ đăng ký thuế'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='Địa chỉ theo đăng ký kinh doanh'
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
                                            message: 'Nhập mã số thuế'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='VD: 010xxxxxx'
                                        style={inputStyle}
                                        className='payment-input'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </Card>

            {/* CSS Injection for Specific Neon Focus Glow */}
            <style>{`
                /* Select Override for Dark Theme */
                .ant-select-selector {
                    background-color: #fff !important;
                    border-radius: 10px !important;
                    height: 48px !important;
                    display: flex !important;
                    align-items: center !important;
                    border: 1px solid #e5e7eb !important;
                }
                
                /* Input Focus Effect - Neon Green */
                .payment-input:focus,
                .payment-input:hover,
                .ant-select-selector:hover,
                .ant-select-focused .ant-select-selector {
                    border-color: #2dc275 !important;
                    box-shadow: 0 0 0 3px rgba(45, 194, 117, 0.25) !important;
                    outline: none;
                }

                /* Character Counter Color Fix */
                .ant-input-show-count-suffix {
                    color: #9ca6b0;
                }
            `}</style>
        </div>
    );
};

export default Step4Payment;
