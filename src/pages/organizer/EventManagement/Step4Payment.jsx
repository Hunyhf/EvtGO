import React, { useEffect } from 'react';
import { Card, Typography, Form, Input, Row, Col } from 'antd';
import {
    BankOutlined,
    MailOutlined,
    UserOutlined,
    NumberOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Step4Payment = ({
    setOnNextAction,
    formData: parentFormData,
    setFormData: setParentFormData
}) => {
    const [form] = Form.useForm();

    // Đồng bộ dữ liệu khi người dùng nhấn "Hoàn tất"
    useEffect(() => {
        // Trả về một hàm, hàm đó trả về một hàm async (phù hợp với logic gọi ở CreateEvent.jsx)
        setOnNextAction(() => () => async () => {
            try {
                // 1. Validate dữ liệu tại chỗ
                const values = await form.validateFields();

                // 2. Vẫn gọi cập nhật State để lưu trữ lâu dài (dùng khi quay lại step cũ)
                setParentFormData(prev => ({
                    ...prev,
                    ...values
                }));

                // 3. QUAN TRỌNG: Trả về values để CreateEvent lấy được data "tươi" ngay lập tức
                return values;
            } catch (error) {
                console.error('Validation Step 4 Failed:', error);
                return false;
            }
        });
        return () => setOnNextAction(null);
    }, [form, setParentFormData, setOnNextAction]);

    return (
        <div style={{ paddingBottom: 24 }}>
            <Card style={{ background: '#2a2d34', borderColor: '#393f4e' }}>
                <Title level={4} style={{ color: '#fff', marginBottom: 8 }}>
                    <BankOutlined style={{ marginRight: 8 }} />
                    Thông tin thanh toán & Đối soát
                </Title>
                <Text
                    style={{
                        color: '#9ca6b0',
                        display: 'block',
                        marginBottom: 24
                    }}
                >
                    Vui lòng nhập chính xác thông tin để Admin thực hiện thanh
                    toán doanh thu sau khi sự kiện kết thúc.
                </Text>

                <Form
                    form={form}
                    layout='vertical'
                    // Khởi tạo giá trị nếu đã có dữ liệu trước đó
                    initialValues={parentFormData}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name='producerName'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Tên nhà tổ chức (Cá nhân/Công ty)
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập tên nhà tổ chức'
                                    }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder='VD: Công ty Giải trí ABC'
                                    size='large'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name='contactEmail'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Email liên hệ
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        type: 'email',
                                        message: 'Vui lòng nhập email hợp lệ'
                                    }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder='VD: contact@abc.com'
                                    size='large'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name='bankName'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Tên ngân hàng
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập tên ngân hàng'
                                    }
                                ]}
                            >
                                <Input
                                    prefix={<BankOutlined />}
                                    placeholder='VD: Vietcombank'
                                    size='large'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name='bankAccountNumber'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Số tài khoản ngân hàng
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập số tài khoản'
                                    }
                                ]}
                            >
                                <Input
                                    prefix={<NumberOutlined />}
                                    placeholder='VD: 1023456789'
                                    size='large'
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default Step4Payment;
