// src/pages/organizer/EventManagement/Step2Showtimes.jsx
import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    DatePicker,
    Button,
    Row,
    Col,
    Checkbox,
    InputNumber,
    Modal,
    Typography,
    Space,
    Card,
    Tag,
    Select,
    message
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    AuditOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Step2Showtimes = ({ setOnNextAction, formData, setFormData }) => {
    // --- STATE QUẢN LÝ DỮ LIỆU VÉ ---
    const [tickets, setTickets] = useState(formData?.tickets || []);

    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [editingTicketIndex, setEditingTicketIndex] = useState(null);
    const [ticketForm] = Form.useForm();
    const [isFreeTicket, setIsFreeTicket] = useState(false);

    // ----------------------------------------------------------------------
    // LOGIC: ĐĂNG KÝ HÀM VALIDATE CHO CHA (CreateEvent.jsx)
    // ----------------------------------------------------------------------
    useEffect(() => {
        setOnNextAction(() => () => async () => {
            // 1. Kiểm tra thời gian sự kiện
            if (!formData.startTime || !formData.endTime) {
                message.error(
                    'Vui lòng chọn thời gian bắt đầu và kết thúc sự kiện!'
                );
                return false;
            }

            // 2. Kiểm tra danh sách vé
            if (tickets.length === 0) {
                message.error('Vui lòng tạo ít nhất 1 loại vé cho sự kiện!');
                return false;
            }

            // Cập nhật mảng tickets vào formData tổng trước khi chuyển bước
            setFormData(prev => ({ ...prev, tickets }));
            return true;
        });

        return () => setOnNextAction(null);
    }, [
        tickets,
        formData.startTime,
        formData.endTime,
        setFormData,
        setOnNextAction
    ]);

    // --- HÀM XỬ LÝ THỜI GIAN SỰ KIỆN ---
    const handleTimeChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value ? value.toISOString() : null
        }));
    };

    // --- CÁC HÀM XỬ LÝ VÉ ---
    const openTicketModal = (index = null) => {
        setEditingTicketIndex(index);

        if (index !== null) {
            const ticket = tickets[index];
            ticketForm.setFieldsValue({
                ...ticket,
                saleTime: [
                    ticket.saleStart ? dayjs(ticket.saleStart) : null,
                    ticket.saleEnd ? dayjs(ticket.saleEnd) : null
                ]
            });
            setIsFreeTicket(ticket.price === 0);
        } else {
            ticketForm.resetFields();
            ticketForm.setFieldsValue({
                ticketType: 'STANDARD',
                ticketStatus: 'PUBLISHED'
            });
            setIsFreeTicket(false);
        }
        setIsTicketModalOpen(true);
    };

    const handleSaveTicket = async () => {
        try {
            const values = await ticketForm.validateFields();
            const newTicket = {
                ...values,
                price: isFreeTicket ? 0 : values.price,
                saleStart: values.saleTime
                    ? values.saleTime[0].toISOString()
                    : null,
                saleEnd: values.saleTime
                    ? values.saleTime[1].toISOString()
                    : null
            };
            delete newTicket.saleTime;

            if (editingTicketIndex !== null) {
                const updatedTickets = [...tickets];
                updatedTickets[editingTicketIndex] = newTicket;
                setTickets(updatedTickets);
            } else {
                setTickets([...tickets, newTicket]);
            }

            setIsTicketModalOpen(false);
            ticketForm.resetFields();
            setIsFreeTicket(false);
            message.success(
                editingTicketIndex !== null
                    ? 'Cập nhật vé thành công'
                    : 'Tạo vé mới thành công'
            );
        } catch (error) {
            console.error('Lỗi khi lưu vé:', error);
        }
    };

    const handleDeleteTicket = index => {
        setTickets(tickets.filter((_, idx) => idx !== index));
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* PHẦN 1: THỜI GIAN DIỄN RA SỰ KIỆN */}
            <div
                style={{
                    marginBottom: 32,
                    background: '#2a2d34',
                    padding: 24,
                    borderRadius: 8,
                    border: '1px solid #393f4e'
                }}
            >
                <Title
                    level={4}
                    style={{ color: '#fff', marginTop: 0, marginBottom: 20 }}
                >
                    <CalendarOutlined /> Thời gian diễn ra sự kiện
                </Title>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label={
                                <span style={{ color: '#fff' }}>
                                    Bắt đầu sự kiện
                                </span>
                            }
                            required
                        >
                            <DatePicker
                                showTime
                                format='HH:mm DD/MM/YYYY'
                                style={{ width: '100%' }}
                                size='large'
                                value={
                                    formData.startTime
                                        ? dayjs(formData.startTime)
                                        : null
                                }
                                onChange={date =>
                                    handleTimeChange('startTime', date)
                                }
                                placeholder='Chọn ngày giờ bắt đầu'
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={
                                <span style={{ color: '#fff' }}>
                                    Kết thúc sự kiện
                                </span>
                            }
                            required
                        >
                            <DatePicker
                                showTime
                                format='HH:mm DD/MM/YYYY'
                                style={{ width: '100%' }}
                                size='large'
                                value={
                                    formData.endTime
                                        ? dayjs(formData.endTime)
                                        : null
                                }
                                onChange={date =>
                                    handleTimeChange('endTime', date)
                                }
                                placeholder='Chọn ngày giờ kết thúc'
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            {/* PHẦN 2: CẤU HÌNH LOẠI VÉ */}
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ color: '#fff', margin: 0 }}>
                    Cấu hình loại vé
                </Title>
                <Text type='secondary'>
                    Tạo các hạng vé (Ví dụ: VIP, Thường) cho sự kiện của bạn
                </Text>
            </div>

            <div
                style={{
                    background: '#2a2d34',
                    padding: 24,
                    borderRadius: 8,
                    border: '1px solid #393f4e',
                    minHeight: 200
                }}
            >
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {tickets.map((ticket, idx) => (
                        <Card
                            key={idx}
                            size='small'
                            style={{
                                width: 280,
                                background: '#1f1f1f',
                                borderColor: '#393f4e'
                            }}
                            actions={[
                                <EditOutlined
                                    key='edit'
                                    onClick={() => openTicketModal(idx)}
                                    style={{ color: '#1890ff' }}
                                />,
                                <DeleteOutlined
                                    key='delete'
                                    onClick={() => handleDeleteTicket(idx)}
                                    style={{ color: '#ff4d4f' }}
                                />
                            ]}
                        >
                            <Card.Meta
                                avatar={
                                    <AuditOutlined
                                        style={{
                                            fontSize: 24,
                                            color: '#2dc275'
                                        }}
                                    />
                                }
                                title={
                                    <span style={{ color: '#fff' }}>
                                        {ticket.ticketType === 'VIP'
                                            ? 'Vé VIP'
                                            : 'Vé Phổ Thông'}
                                    </span>
                                }
                                description={
                                    <div style={{ marginTop: 8 }}>
                                        <Tag
                                            color={
                                                ticket.price === 0
                                                    ? 'green'
                                                    : 'blue'
                                            }
                                        >
                                            {ticket.price === 0
                                                ? 'Miễn phí'
                                                : `${ticket.price.toLocaleString()} VND`}
                                        </Tag>
                                        <div
                                            style={{
                                                color: '#9ca6b0',
                                                fontSize: 12,
                                                marginTop: 8
                                            }}
                                        >
                                            Số lượng: {ticket.totalQuantity}{' '}
                                            <br />
                                            Trạng thái:{' '}
                                            {ticket.ticketStatus === 'PUBLISHED'
                                                ? 'Đang mở bán'
                                                : 'Tạm ngưng'}
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    ))}

                    <Button
                        type='dashed'
                        onClick={() => openTicketModal()}
                        style={{
                            width: 280,
                            height: 120,
                            borderColor: '#393f4e',
                            color: '#9ca6b0',
                            background: 'transparent'
                        }}
                        icon={<PlusOutlined />}
                    >
                        Tạo loại vé mới
                    </Button>
                </div>
            </div>

            {/* Modal Form Ticket giữ nguyên để khớp với ReqTicketDTO của Backend */}
            <Modal
                title={<span style={{ color: '#fff' }}>Thông tin loại vé</span>}
                open={isTicketModalOpen}
                onCancel={() => setIsTicketModalOpen(false)}
                footer={null}
                width={600}
                centered
                styles={{
                    content: {
                        background: '#2a2d34',
                        border: '1px solid #393f4e'
                    },
                    header: {
                        background: 'transparent',
                        borderBottom: '1px solid #393f4e'
                    }
                }}
            >
                <Form
                    form={ticketForm}
                    layout='vertical'
                    onFinish={handleSaveTicket}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name='ticketType'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Hạng vé
                                    </span>
                                }
                                rules={[{ required: true }]}
                            >
                                <Select size='large'>
                                    <Option value='STANDARD'>
                                        Phổ thông (Standard)
                                    </Option>
                                    <Option value='VIP'>Cao cấp (VIP)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Giá vé
                                    </span>
                                }
                                required
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 10,
                                        alignItems: 'center'
                                    }}
                                >
                                    <Form.Item
                                        name='price'
                                        noStyle
                                        rules={[
                                            {
                                                required: !isFreeTicket,
                                                message: 'Nhập giá'
                                            }
                                        ]}
                                    >
                                        <InputNumber
                                            style={{ flex: 1 }}
                                            size='large'
                                            disabled={isFreeTicket}
                                            formatter={v =>
                                                `${v}`.replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ','
                                                )
                                            }
                                            parser={v =>
                                                v.replace(/\$\s?|(,*)/g, '')
                                            }
                                        />
                                    </Form.Item>
                                    <Checkbox
                                        checked={isFreeTicket}
                                        onChange={e => {
                                            setIsFreeTicket(e.target.checked);
                                            ticketForm.setFieldValue(
                                                'price',
                                                0
                                            );
                                        }}
                                        style={{ color: '#fff' }}
                                    >
                                        Miễn phí
                                    </Checkbox>
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name='totalQuantity'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Số lượng vé
                                    </span>
                                }
                                rules={[{ required: true, message: 'Nhập SL' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    size='large'
                                    min={1}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name='ticketStatus'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Trạng thái
                                    </span>
                                }
                                rules={[{ required: true }]}
                            >
                                <Select size='large'>
                                    <Option value='PUBLISHED'>
                                        Mở bán (Published)
                                    </Option>
                                    <Option value='STOPPED'>
                                        Tạm ngưng (Stopped)
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name='saleTime'
                        label={
                            <span style={{ color: '#fff' }}>
                                Thời gian bán vé
                            </span>
                        }
                        rules={[{ required: true, message: 'Chọn thời gian' }]}
                    >
                        <DatePicker.RangePicker
                            showTime
                            format='HH:mm DD/MM/YYYY'
                            style={{ width: '100%' }}
                            size='large'
                        />
                    </Form.Item>

                    <Form.Item
                        name='description'
                        label={
                            <span style={{ color: '#fff' }}>
                                Mô tả quyền lợi
                            </span>
                        }
                    >
                        <TextArea
                            rows={3}
                            placeholder='Ví dụ: Có chỗ ngồi riêng, tặng nước suối...'
                        />
                    </Form.Item>

                    <Button
                        type='primary'
                        htmlType='submit'
                        block
                        size='large'
                        style={{
                            background: '#2dc275',
                            borderColor: '#2dc275',
                            height: 48
                        }}
                    >
                        Lưu vé
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default Step2Showtimes;
