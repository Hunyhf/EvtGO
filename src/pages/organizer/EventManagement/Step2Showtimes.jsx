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
const { Option } = Select;

const Step2Showtimes = ({ setOnNextAction, formData, setFormData }) => {
    // 1. Khởi tạo tickets từ formData để giữ dữ liệu khi quay lại từ Step 3, 4
    const [tickets, setTickets] = useState(formData?.tickets || []);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [editingTicketIndex, setEditingTicketIndex] = useState(null);
    const [ticketForm] = Form.useForm();
    const [isFreeTicket, setIsFreeTicket] = useState(false);

    // 2. Tự động đồng bộ tickets cục bộ vào formData của cha mỗi khi có thay đổi
    useEffect(() => {
        setParentFormData(prev => ({ ...prev, tickets }));
    }, [tickets]);

    // Hàm bọc setParentFormData để đảm bảo logic ổn định
    const setParentFormData = updateFn => {
        if (typeof setFormData === 'function') {
            setFormData(updateFn);
        }
    };

    useEffect(() => {
        setOnNextAction(() => () => async () => {
            const now = dayjs();
            const start = formData.startTime ? dayjs(formData.startTime) : null;
            const end = formData.endTime ? dayjs(formData.endTime) : null;

            // Kiểm tra nhập đủ ngày tháng
            if (!start || !end) {
                message.error(
                    'Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc sự kiện!'
                );
                return false;
            }

            // VALIDATE 1: Thời gian bắt đầu không được nhỏ hơn thời gian hiện tại
            if (start.isBefore(now)) {
                message.error(
                    'Thời gian bắt đầu sự kiện không được nhỏ hơn thời gian hiện tại!'
                );
                return false;
            }

            // VALIDATE 2: Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc
            if (start.isAfter(end) || start.isSame(end)) {
                message.error(
                    'Ngày và giờ bắt đầu phải nhỏ hơn ngày và giờ kết thúc!'
                );
                return false;
            }

            // Kiểm tra đã tạo vé chưa
            if (tickets.length === 0) {
                message.error('Vui lòng tạo ít nhất 1 loại vé cho sự kiện!');
                return false;
            }

            return true;
        });
        return () => setOnNextAction(null);
    }, [tickets, formData.startTime, formData.endTime, setOnNextAction]);

    const handleTimeChange = (field, value) => {
        setParentFormData(prev => ({
            ...prev,
            // SỬA TẠI ĐÂY: Sử dụng format để giữ đúng giờ địa phương thay vì toISOString()
            [field]: value ? value.format('YYYY-MM-DDTHH:mm:ss') : null
        }));
    };

    const openTicketModal = (index = null) => {
        setEditingTicketIndex(index);
        if (index !== null) {
            const ticket = tickets[index];
            ticketForm.setFieldsValue({ ...ticket });
            setIsFreeTicket(ticket.price === 0);
        } else {
            ticketForm.resetFields();
            ticketForm.setFieldsValue({ ticketType: 'STANDARD' });
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
                // Mặc định luôn là PUBLISHED vì đã bỏ trường chọn trạng thái
                ticketStatus: 'PUBLISHED'
            };

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

    // Vô hiệu hóa các ngày trong quá khứ trên lịch để cải thiện UX
    const disabledDate = current => {
        return current && current < dayjs().startOf('day');
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* --- KHỐI THỜI GIAN --- */}
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
                                disabledDate={disabledDate} // Chặn chọn ngày quá khứ
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
                                disabledDate={disabledDate}
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

            {/* --- KHỐI DANH SÁCH VÉ --- */}
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ color: '#fff', margin: 0 }}>
                    Cấu hình loại vé
                </Title>
                <Text type='secondary'>
                    Tạo các hạng vé cho sự kiện của bạn
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
                                            Số lượng: {ticket.totalQuantity}
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

            {/* --- MODAL TẠO VÉ (Đã bỏ Trạng thái) --- */}
            <Modal
                title={<span style={{ color: '#fff' }}>Thông tin loại vé</span>}
                open={isTicketModalOpen}
                onCancel={() => setIsTicketModalOpen(false)}
                footer={null}
                width={500}
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
                    <Form.Item
                        name='ticketType'
                        label={<span style={{ color: '#fff' }}>Hạng vé</span>}
                        rules={[{ required: true }]}
                    >
                        <Select size='large'>
                            <Option value='STANDARD'>
                                Phổ thông (Standard)
                            </Option>
                            <Option value='VIP'>Cao cấp (VIP)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ color: '#fff' }}>Giá vé</span>}
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
                                    min={0}
                                    formatter={v =>
                                        `${v}`.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ','
                                        )
                                    }
                                    parser={v => v.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                            <Checkbox
                                checked={isFreeTicket}
                                onChange={e => {
                                    setIsFreeTicket(e.target.checked);
                                    ticketForm.setFieldValue('price', 0);
                                }}
                                style={{ color: '#fff' }}
                            >
                                Miễn phí
                            </Checkbox>
                        </div>
                    </Form.Item>

                    <Form.Item
                        name='totalQuantity'
                        label={
                            <span style={{ color: '#fff' }}>Số lượng vé</span>
                        }
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập số lượng'
                            }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            size='large'
                            min={1}
                            placeholder='VD: 100'
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
                            height: 48,
                            marginTop: 16
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
