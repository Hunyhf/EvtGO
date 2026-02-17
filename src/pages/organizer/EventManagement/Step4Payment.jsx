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
    message,
    Button
} from 'antd';
import { BankOutlined, AuditOutlined } from '@ant-design/icons';

// Import API thật
import { callCreateEvent } from '@apis/eventApi';

const { Title, Text } = Typography;
const { Option } = Select;

const Step4Payment = ({ setOnNextAction, formData, setFormData }) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // 1. Init Data
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

    // 2. Logic xử lý Hoàn tất và gửi API
    useEffect(() => {
        setOnNextAction(() => async () => {
            try {
                // Validate Form thanh toán
                const paymentValues = await form.validateFields();

                // Merge dữ liệu form UI vào state chung
                const finalData = { ...formData, ...paymentValues };
                setFormData(finalData);

                // --- CHUẨN BỊ DỮ LIỆU GỬI BE (DATA MAPPING) ---
                const submitData = new FormData();

                // 1. Map các field cơ bản (text)
                submitData.append('name', finalData.name);
                submitData.append('description', finalData.description);
                submitData.append(
                    'location',
                    finalData.locationName + ', ' + finalData.addressDetail
                ); // Ghép địa chỉ
                submitData.append('province', finalData.province); // Mã tỉnh
                submitData.append('genreId', finalData.genreId);

                // 2. Map Thời gian (Lấy suất diễn đầu tiên làm mốc thời gian chính của Event)
                // Lưu ý: Cần logic BE hỗ trợ nhiều suất diễn nếu muốn lưu hết.
                // Ở đây ta lấy suất đầu tiên để khớp với bảng events hiện tại.
                if (finalData.showTimes && finalData.showTimes.length > 0) {
                    const firstShow = finalData.showTimes[0];
                    submitData.append('startTime', firstShow.startTime); // ISO String
                    submitData.append('endTime', firstShow.endTime); // ISO String

                    // Gửi vé (Tickets) dưới dạng JSON String vì FormData không nhận mảng object trực tiếp
                    // BE cần có logic parse chuỗi này
                    // Hoặc gửi theo convention: tickets[0].name, tickets[0].price...

                    // Cách đơn giản nhất: Gửi 1 string JSON và BE parse lại
                    const allTickets = finalData.showTimes.flatMap(
                        st => st.tickets
                    );
                    submitData.append(
                        'ticketsJson',
                        JSON.stringify(allTickets)
                    );
                }

                // 3. Map File Ảnh (Quan trọng)
                // poster và organizerLogo trong state đang là URL blob hoặc base64.
                // Chúng ta cần lấy File Object thực sự từ component Upload ở Step 1.
                // *Lưu ý: Nếu Step 1 bạn lưu file object vào state thì lấy ra ở đây.
                // Nếu chưa, bạn cần sửa Step 1 để lưu `originFileObj` vào formData.

                if (finalData.posterFile) {
                    submitData.append('poster', finalData.posterFile);
                }
                if (finalData.logoFile) {
                    submitData.append('organizerLogo', finalData.logoFile);
                }

                // 4. Map thông tin thanh toán (Gửi dạng JSON hoặc từng field tùy BE)
                submitData.append(
                    'bankAccountName',
                    paymentValues.bankAccountName
                );
                submitData.append(
                    'bankAccountNumber',
                    paymentValues.bankAccountNumber
                );
                submitData.append('bankName', paymentValues.bankName);

                // --- GỌI API ---
                setLoading(true);
                message.loading({
                    content: 'Đang gửi dữ liệu lên hệ thống...',
                    key: 'create'
                });

                await callCreateEvent(submitData);

                message.success({
                    content: 'Sự kiện đã được gửi và chờ Admin duyệt!',
                    key: 'create',
                    duration: 3
                });

                // Cleanup & Redirect
                localStorage.removeItem('evtgo_create_event_data');
                localStorage.removeItem('evtgo_create_event_step');
                navigate('/organizer/events');
            } catch (error) {
                console.error('Create Event Error:', error);
                message.error({
                    content:
                        'Lỗi khi tạo sự kiện: ' +
                        (error.response?.data?.message || error.message),
                    key: 'create'
                });
                throw error; // Chặn chuyển trang
            } finally {
                setLoading(false);
            }
        });
    }, [form, setOnNextAction, formData, setFormData, navigate]);

    // --- STYLES (Giữ nguyên giao diện đẹp của bạn) ---
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
                    {/* ... (Giữ nguyên code JSX giao diện của bạn ở trên) ... */}
                    {/* Phần giao diện bạn đã làm rất tốt, copy lại toàn bộ phần return JSX cũ vào đây */}
                    {/* SECTION 1: BANK INFO và SECTION 2: VAT INVOICE */}
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
                                    rules={[{ required: true }]}
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
                                    rules={[{ required: true }]}
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
                                    rules={[{ required: true }]}
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
                                    rules={[{ required: true }]}
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
                                    rules={[{ required: true }]}
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
                                    rules={[{ required: true }]}
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
                                    rules={[{ required: true }]}
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
