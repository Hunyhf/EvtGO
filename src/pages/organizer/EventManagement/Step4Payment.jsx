import React, { useEffect } from 'react';
import { Form, Input, Select, Card, Typography, Row, Col, Divider } from 'antd';
import { BankOutlined, AuditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Step4Payment = ({ setOnNextAction, formData, setFormData }) => {
    const [form] = Form.useForm();

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

    useEffect(() => {
        // Trả về một closure function để Cha có thể thực thi await
        setOnNextAction(() => async () => {
            try {
                // Validate toàn bộ các trường trong Step 4
                const paymentValues = await form.validateFields();

                // Cập nhật dữ liệu vào formData tổng của Cha
                setFormData(prev => ({
                    ...prev,
                    ...paymentValues
                }));

                console.log('>>> [Step 4] Validation & Sync OK');
                return true; // Trả về true để báo hiệu cho Cha
            } catch (error) {
                console.error('>>> [Step 4] Validation failed:', error);
                throw error; // Ném lỗi để Cha (CreateEvent) chặn quá trình handleFinish
            }
        });

        // Cleanup action khi unmount bước này
        return () => setOnNextAction(null);
    }, [form, setFormData, setOnNextAction]);

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
                    {/*  Thông tin Ngân hàng */}
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

                    {/* Phần 2: Hoá đơn đỏ */}
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
