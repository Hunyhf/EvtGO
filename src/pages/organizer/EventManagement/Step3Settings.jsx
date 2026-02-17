// src/pages/organizer/EventManagement/Step3Settings.jsx
import React, { useEffect } from 'react';
import { Form, Input, Card, Typography, message, theme } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Step3Settings = ({
    setOnNextAction,
    formData,
    setFormData,
    nextStep
}) => {
    const [form] = Form.useForm();
    const { token } = theme.useToken();

    // 1. Init Data
    useEffect(() => {
        if (formData) {
            form.setFieldsValue({
                confirmationMessage: formData.confirmationMessage || ''
            });
        }
    }, [formData, form]);

    // 2. Register Action (Lưu và chuyển bước)
    useEffect(() => {
        setOnNextAction(() => () => {
            return form
                .validateFields()
                .then(values => {
                    console.log('Step 3 Validated:', values);
                    setFormData(prev => ({ ...prev, ...values }));

                    if (nextStep) {
                        nextStep();
                    }
                })
                .catch(info => {
                    message.error('Vui lòng kiểm tra lại thông tin!');
                    console.error('Validate Failed:', info);
                    throw new Error('Validation failed');
                });
        });
    }, [form, setOnNextAction, setFormData, nextStep]);

    // Styles custom cho Textarea để đè lên style mặc định của Antd
    const textAreaStyle = {
        backgroundColor: '#fff', // Yêu cầu "White textarea"
        color: '#333', // Chữ đen trên nền trắng
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '12px',
        fontSize: '16px',
        fontFamily: "'Inter', sans-serif", // Clean modern sans-serif
        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
    };

    return (
        <Form
            form={form}
            layout='vertical'
            style={{ maxWidth: 800, margin: '0 auto' }}
        >
            <Card
                bordered={false}
                style={{
                    borderRadius: '12px',
                    // Black-to-green gradient background effect
                    background:
                        'linear-gradient(145deg, #2a2d34 0%, #1a2e25 100%)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                    border: '1px solid #393f4e',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {/* Trang trí Neon Green Accent bên trái */}
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: '#2dc275',
                        boxShadow: '0 0 10px #2dc275'
                    }}
                />

                {/* Header Section */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        marginBottom: 20
                    }}
                >
                    <div
                        style={{
                            background: 'rgba(45, 194, 117, 0.1)',
                            padding: '10px',
                            borderRadius: '50%',
                            marginRight: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <MailOutlined
                            style={{ fontSize: '24px', color: '#2dc275' }}
                        />
                    </div>
                    <div>
                        <Title
                            level={4}
                            style={{
                                color: '#fff',
                                margin: '0 0 4px 0',
                                fontWeight: 600
                            }}
                        >
                            Tin nhắn xác nhận cho người tham gia
                        </Title>
                        <Text style={{ color: '#9ca6b0', fontSize: '14px' }}>
                            Tin nhắn xác nhận này sẽ được gửi đến cho người tham
                            gia sau khi đặt vé thành công
                        </Text>
                    </div>
                </div>

                {/* Textarea Section */}
                <Form.Item
                    name='confirmationMessage'
                    style={{ marginBottom: 0 }}
                >
                    <div className='custom-textarea-wrapper'>
                        <TextArea
                            rows={8}
                            placeholder='Nhập nội dung tin nhắn xác nhận...'
                            maxLength={500}
                            showCount={{
                                formatter: ({ count, maxLength }) => (
                                    <span
                                        style={{
                                            color: '#9ca6b0',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {count} / {maxLength}
                                    </span>
                                )
                            }}
                            style={textAreaStyle}
                            // Classname để CSS focus effect (xem style bên dưới)
                            className='neon-focus-textarea'
                        />
                    </div>
                </Form.Item>
            </Card>

            {/* CSS-in-JS nhỏ để xử lý Focus state màu xanh neon */}
            <style>{`
                .neon-focus-textarea:focus, 
                .neon-focus-textarea:hover {
                    border-color: #2dc275 !important;
                    box-shadow: 0 0 0 4px rgba(45, 194, 117, 0.2) !important;
                    outline: none;
                }
                .ant-input-data-count {
                    bottom: -25px !important;
                }
            `}</style>
        </Form>
    );
};

export default Step3Settings;
