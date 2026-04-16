import React, { useEffect } from 'react';
import { Form, Input, Card, Typography, Row, Col, message, Tag } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Step3Settings = ({ setOnNextAction, formData, setFormData }) => {
    const [form] = Form.useForm();

    // Điền dữ liệu cũ vào form nếu Organizer quay lại từ bước 4
    useEffect(() => {
        if (formData.tickets && formData.tickets.length > 0) {
            const initialValues = {};
            formData.tickets.forEach((ticket, index) => {
                initialValues[`zone_${index}`] =
                    formData.seatZones?.[index]?.zone || '';
                initialValues[`prefix_${index}`] =
                    formData.seatZones?.[index]?.prefix || '';
            });
            form.setFieldsValue(initialValues);
        }
    }, [formData.tickets, formData.seatZones, form]);

    // Xử lý khi bấm nút "Tiếp tục" ở thẻ Layout bọc bên ngoài
    useEffect(() => {
        setOnNextAction(() => () => async () => {
            try {
                const values = await form.validateFields();
                const newSeats = [];
                const seatZones = [];

                // Duyệt qua từng loại vé đã tạo ở Step 2
                for (let i = 0; i < formData.tickets.length; i++) {
                    const ticket = formData.tickets[i];
                    const zone = values[`zone_${i}`];
                    const prefix = values[`prefix_${i}`];

                    // Lưu lại cấu hình Zone để render lại nếu quay về bước này
                    seatZones.push({ zone, prefix });

                    // Phát sinh từng ghế dựa trên totalQuantity của loại vé
                    for (let j = 1; j <= ticket.totalQuantity; j++) {
                        newSeats.push({
                            seatLabel: `${prefix}${j}`, // VD: VIP1, VIP2,...
                            zone: zone, // VD: Khu VIP
                            price: ticket.price // Kế thừa giá từ loại vé
                        });
                    }
                }

                // Cập nhật toàn bộ ghế vào formData
                setFormData(prev => ({
                    ...prev,
                    seatZones: seatZones,
                    seats: newSeats
                }));

                return true; // Cho phép qua Step 4
            } catch (error) {
                message.error(
                    'Vui lòng nhập đầy đủ Tên khu vực và Mã ghế cho tất cả loại vé!'
                );
                return false; // Chặn không cho qua bước tiếp theo
            }
        });

        // Cleanup function
        return () => setOnNextAction(null);
    }, [form, formData.tickets, setFormData, setOnNextAction]);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#fff', margin: 0 }}>
                    <AppstoreAddOutlined style={{ marginRight: 8 }} />
                    Thiết lập Sơ đồ ghế
                </Title>
                <Text type='secondary'>
                    Cấu hình khu vực và mã ghế dựa trên các loại vé bạn đã tạo ở
                    bước trước. Hệ thống sẽ tự động phát sinh số thứ tự ghế.
                </Text>
            </div>

            <Form form={form} layout='vertical'>
                <Row gutter={[24, 24]}>
                    {formData.tickets?.map((ticket, index) => (
                        <Col span={24} key={index}>
                            <Card
                                style={{
                                    background: '#2a2d34',
                                    borderColor: '#393f4e',
                                    borderRadius: 8
                                }}
                            >
                                <div style={{ marginBottom: 16 }}>
                                    <strong
                                        style={{
                                            color: '#2dc275',
                                            fontSize: 16
                                        }}
                                    >
                                        {ticket.ticketType === 'VIP'
                                            ? 'Hạng vé: VIP'
                                            : 'Hạng vé: Phổ thông'}
                                    </strong>
                                    <Tag
                                        color='blue'
                                        style={{ marginLeft: 12 }}
                                    >
                                        Số lượng: {ticket.totalQuantity} ghế
                                    </Tag>
                                    <Tag color='green'>
                                        Giá:{' '}
                                        {ticket.price === 0
                                            ? 'Miễn phí'
                                            : `${ticket.price.toLocaleString()} VND`}
                                    </Tag>
                                </div>

                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item
                                            name={`zone_${index}`}
                                            label={
                                                <span style={{ color: '#fff' }}>
                                                    Tên khu vực (VD: Khu A, VIP
                                                    Lounge...)
                                                </span>
                                            }
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'Vui lòng nhập tên khu vực!'
                                                }
                                            ]}
                                        >
                                            <Input
                                                size='large'
                                                placeholder='Nhập tên khu vực hiển thị cho khách'
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name={`prefix_${index}`}
                                            label={
                                                <span style={{ color: '#fff' }}>
                                                    Mã ký hiệu ghế (VD: A, V,
                                                    VIP...)
                                                </span>
                                            }
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        'Vui lòng nhập mã ghế!'
                                                }
                                            ]}
                                        >
                                            <Input
                                                size='large'
                                                placeholder='Nhập ký hiệu (VD: V -> Ghế V1, V2...)'
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Form>
        </div>
    );
};

export default Step3Settings;
