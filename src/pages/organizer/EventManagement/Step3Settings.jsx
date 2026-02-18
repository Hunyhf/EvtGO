// src/pages/organizer/EventManagement/Step3Settings.jsx
import React, { useEffect } from 'react';
import { Form, Input, Card, Typography, message, theme } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Step3Settings = ({
    setOnNextAction,
    formData,
    setFormData
    // nextStep // Không cần dùng prop này nữa vì Cha sẽ tự xử lý chuyển bước
}) => {
    const [form] = Form.useForm();

    // 1. Init Data (Hydration)
    useEffect(() => {
        if (formData) {
            form.setFieldsValue({
                confirmationMessage: formData.confirmationMessage || ''
            });
        }
    }, [formData, form]);

    // ----------------------------------------------------------------------
    // 2. LOGIC: ĐĂNG KÝ HÀM VALIDATE CHO CHA (ĐÃ SỬA)
    // ----------------------------------------------------------------------
    useEffect(() => {
        // Sử dụng triple closure () => () => async () => ...
        // để tương thích với lời gọi await onNextAction()() ở CreateEvent.jsx
        setOnNextAction(() => () => async () => {
            try {
                // Thực hiện validate form
                const values = await form.validateFields();

                console.log('Step 3 Validated:', values);

                // Cập nhật dữ liệu vào state tổng
                setFormData(prev => ({ ...prev, ...values }));

                // Trả về true để báo cho Cha là hợp lệ, Cha sẽ tự gọi nextStep()
                return true;
            } catch (error) {
                message.error('Vui lòng nhập nội dung tin nhắn xác nhận!');
                console.error('Validate Failed:', error);
                // Trả về false để chặn không cho qua bước tiếp theo
                return false;
            }
        });

        // Cleanup khi unmount
        return () => setOnNextAction(null);
    }, [form, setOnNextAction, setFormData]);

    // Styles custom cho Textarea
    const textAreaStyle = {
        backgroundColor: '#fff',
        color: '#333',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '12px',
        fontSize: '16px',
        fontFamily: "'Inter', sans-serif",
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
                    background:
                        'linear-gradient(145deg, #2a2d34 0%, #1a2e25 100%)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                    border: '1px solid #393f4e',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {/* Neon Green Accent */}
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
                            Tin nhắn này sẽ được gửi tự động sau khi người dùng
                            đặt vé thành công.
                        </Text>
                    </div>
                </div>

                {/* Textarea Section */}
                <Form.Item
                    name='confirmationMessage'
                    style={{ marginBottom: 0 }}
                    rules={[
                        {
                            required: true,
                            message: 'Nội dung không được để trống'
                        }
                    ]}
                >
                    <div className='custom-textarea-wrapper'>
                        <TextArea
                            rows={8}
                            placeholder='Ví dụ: Cảm ơn bạn đã quan tâm đến sự kiện của chúng tôi...'
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
                            className='neon-focus-textarea'
                        />
                    </div>
                </Form.Item>
            </Card>

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
