// src/pages/organizer/EventManagement/Step2Showtimes.jsx
import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    DatePicker,
    Button,
    Collapse,
    Row,
    Col,
    Checkbox,
    InputNumber,
    Upload,
    Modal,
    Typography,
    Space,
    Card,
    Tag,
    message,
    theme
} from 'antd';
import {
    PlusOutlined,
    CalendarOutlined,
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    InboxOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const Step2Showtimes = ({
    setOnNextAction,
    formData,
    setFormData,
    nextStep
}) => {
    const { token } = theme.useToken();

    // --- STATE QUẢN LÝ DỮ LIỆU ---
    // Mặc định có 1 suất diễn rỗng nếu chưa có dữ liệu
    const [showTimes, setShowTimes] = useState(
        formData?.showTimes?.length > 0
            ? formData.showTimes
            : [{ id: Date.now(), startTime: null, endTime: null, tickets: [] }]
    );

    // State cho Modal Vé
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [currentShowtimeId, setCurrentShowtimeId] = useState(null); // Để biết đang thêm vé cho suất nào
    const [editingTicketIndex, setEditingTicketIndex] = useState(null); // null = tạo mới, number = index vé đang sửa
    const [ticketForm] = Form.useForm();
    const [isFreeTicket, setIsFreeTicket] = useState(false); // Checkbox miễn phí

    // --- LOGIC TÍCH HỢP VỚI CHA ---
    useEffect(() => {
        setOnNextAction(() => () => {
            // 1. Validate cơ bản: Phải có ít nhất 1 suất diễn đầy đủ ngày giờ
            const isValid = showTimes.every(
                st => st.startTime && st.endTime && st.tickets.length > 0
            );

            if (!isValid) {
                message.error(
                    'Vui lòng nhập đầy đủ thời gian và tạo ít nhất 1 loại vé cho mỗi suất diễn!'
                );
                throw new Error('Validation failed');
            }

            // 2. Lưu vào FormData và chuyển bước
            setFormData(prev => ({ ...prev, showTimes }));
            nextStep();
        });
    }, [showTimes, setFormData, nextStep, setOnNextAction]);

    // --- LOGIC SUẤT DIỄN (SHOWTIME) ---
    const addShowtime = () => {
        setShowTimes([
            ...showTimes,
            { id: Date.now(), startTime: null, endTime: null, tickets: [] }
        ]);
    };

    const removeShowtime = id => {
        if (showTimes.length === 1) {
            message.warning('Cần ít nhất một suất diễn!');
            return;
        }
        setShowTimes(showTimes.filter(st => st.id !== id));
    };

    const updateShowtimeTime = (id, field, value) => {
        setShowTimes(prev =>
            prev.map(st => (st.id === id ? { ...st, [field]: value } : st))
        );
    };

    // --- LOGIC MODAL VÉ (TICKET) ---
    const openTicketModal = (showtimeId, ticketIndex = null) => {
        setCurrentShowtimeId(showtimeId);
        setEditingTicketIndex(ticketIndex);

        if (ticketIndex !== null) {
            // Edit Mode: Fill dữ liệu
            const ticket = showTimes.find(st => st.id === showtimeId).tickets[
                ticketIndex
            ];
            ticketForm.setFieldsValue({
                ...ticket,
                saleTime: [
                    ticket.saleStart ? dayjs(ticket.saleStart) : null,
                    ticket.saleEnd ? dayjs(ticket.saleEnd) : null
                ]
            });
            setIsFreeTicket(ticket.price === 0);
        } else {
            // Create Mode: Reset form
            ticketForm.resetFields();
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
                    : null,
                // Giữ lại file object hoặc url nếu có upload thật
                image: values.image?.file || values.image
            };
            delete newTicket.saleTime; // Xóa field tạm

            setShowTimes(prev =>
                prev.map(st => {
                    if (st.id !== currentShowtimeId) return st;

                    const newTickets = [...st.tickets];
                    if (editingTicketIndex !== null) {
                        newTickets[editingTicketIndex] = newTicket; // Update
                    } else {
                        newTickets.push(newTicket); // Create
                    }
                    return { ...st, tickets: newTickets };
                })
            );

            setIsTicketModalOpen(false);
            message.success(
                editingTicketIndex !== null
                    ? 'Cập nhật vé thành công'
                    : 'Tạo vé mới thành công'
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTicket = (showtimeId, ticketIndex) => {
        setShowTimes(prev =>
            prev.map(st => {
                if (st.id !== showtimeId) return st;
                const newTickets = st.tickets.filter(
                    (_, idx) => idx !== ticketIndex
                );
                return { ...st, tickets: newTickets };
            })
        );
    };

    // --- RENDERERS ---

    // Header của Accordion
    const genExtra = id => (
        <DeleteOutlined
            onClick={event => {
                event.stopPropagation();
                removeShowtime(id);
            }}
            style={{ color: '#ff4d4f' }}
        />
    );

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Header chung */}
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ color: '#fff', margin: 0 }}>
                    Thông tin suất diễn & Vé
                </Title>
                <Text type='secondary'>Vui lòng nhập thông tin suất diễn</Text>
            </div>

            {/* ACCORDION SUẤT DIỄN */}
            <Collapse
                defaultActiveKey={showTimes.map(st => st.id)}
                className='custom-collapse'
                style={{ background: 'transparent', border: 'none' }}
            >
                {showTimes.map((showtime, index) => (
                    <Panel
                        header={
                            <Space>
                                <CalendarOutlined />{' '}
                                <span style={{ fontWeight: 600 }}>
                                    Suất diễn {index + 1}
                                </span>
                            </Space>
                        }
                        key={showtime.id}
                        extra={genExtra(showtime.id)}
                        style={{
                            background: '#2a2d34',
                            borderRadius: 8,
                            marginBottom: 16,
                            border: '1px solid #393f4e',
                            overflow: 'hidden'
                        }}
                    >
                        {/* 1. NGÀY SỰ KIỆN (EVENT TIME) */}
                        <div style={{ marginBottom: 24 }}>
                            <Title
                                level={5}
                                style={{ color: '#fff', marginTop: 0 }}
                            >
                                Ngày sự kiện
                            </Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span style={{ color: '#fff' }}>
                                                Thời gian bắt đầu
                                            </span>
                                        }
                                        required
                                    >
                                        <DatePicker
                                            showTime
                                            format='HH:mm DD/MM/YYYY'
                                            placeholder='Chọn ngày giờ bắt đầu'
                                            style={{ width: '100%' }}
                                            size='large'
                                            value={
                                                showtime.startTime
                                                    ? dayjs(showtime.startTime)
                                                    : null
                                            }
                                            onChange={date =>
                                                updateShowtimeTime(
                                                    showtime.id,
                                                    'startTime',
                                                    date
                                                )
                                            }
                                            suffixIcon={
                                                <CalendarOutlined
                                                    style={{ color: '#2dc275' }}
                                                />
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span style={{ color: '#fff' }}>
                                                Thời gian kết thúc
                                            </span>
                                        }
                                        required
                                    >
                                        <DatePicker
                                            showTime
                                            format='HH:mm DD/MM/YYYY'
                                            placeholder='Chọn ngày giờ kết thúc'
                                            style={{ width: '100%' }}
                                            size='large'
                                            value={
                                                showtime.endTime
                                                    ? dayjs(showtime.endTime)
                                                    : null
                                            }
                                            onChange={date =>
                                                updateShowtimeTime(
                                                    showtime.id,
                                                    'endTime',
                                                    date
                                                )
                                            }
                                            suffixIcon={
                                                <CalendarOutlined
                                                    style={{ color: '#ff4d4f' }}
                                                />
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* 2. LOẠI VÉ (TICKET TYPE) */}
                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 16
                                }}
                            >
                                <Title
                                    level={5}
                                    style={{ color: '#fff', margin: 0 }}
                                >
                                    <span style={{ color: '#ff4d4f' }}>*</span>{' '}
                                    Loại vé
                                </Title>
                                <Button
                                    type='default'
                                    style={{
                                        color: '#2dc275',
                                        borderColor: '#2dc275',
                                        background: 'transparent'
                                    }}
                                    icon={<CopyOutlined />}
                                >
                                    Copy loại vé từ...
                                </Button>
                            </div>

                            {/* Danh sách vé đã tạo */}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 12,
                                    flexWrap: 'wrap',
                                    marginBottom: 16
                                }}
                            >
                                {showtime.tickets.map((ticket, idx) => (
                                    <Card
                                        key={idx}
                                        size='small'
                                        style={{
                                            width: 200,
                                            background: '#1f1f1f',
                                            borderColor: '#393f4e'
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <Text
                                                strong
                                                style={{ color: '#fff' }}
                                                ellipsis
                                            >
                                                {ticket.name}
                                            </Text>
                                            <Space>
                                                <EditOutlined
                                                    onClick={() =>
                                                        openTicketModal(
                                                            showtime.id,
                                                            idx
                                                        )
                                                    }
                                                    style={{
                                                        color: '#1890ff',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <DeleteOutlined
                                                    onClick={() =>
                                                        handleDeleteTicket(
                                                            showtime.id,
                                                            idx
                                                        )
                                                    }
                                                    style={{
                                                        color: '#ff4d4f',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Space>
                                        </div>
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
                                                    marginTop: 4
                                                }}
                                            >
                                                SL: {ticket.total}
                                            </div>
                                        </div>
                                    </Card>
                                ))}

                                {/* Nút tạo vé mới (Centered in List or Grid) */}
                                <Button
                                    type='dashed'
                                    onClick={() => openTicketModal(showtime.id)}
                                    style={{
                                        width:
                                            showtime.tickets.length > 0
                                                ? 200
                                                : '100%',
                                        height:
                                            showtime.tickets.length > 0
                                                ? 'auto'
                                                : 50,
                                        borderColor: '#393f4e',
                                        color: '#9ca6b0'
                                    }}
                                    icon={<PlusOutlined />}
                                >
                                    Tạo loại vé mới
                                </Button>
                            </div>
                        </div>
                    </Panel>
                ))}
            </Collapse>

            {/* Nút thêm suất diễn */}
            <Button
                type='dashed'
                block
                size='large'
                icon={<PlusOutlined />}
                onClick={addShowtime}
                style={{
                    marginTop: 16,
                    height: 50,
                    borderColor: '#2dc275',
                    color: '#2dc275'
                }}
            >
                Tạo suất diễn
            </Button>

            {/* --- MODAL TẠO VÉ (CUSTOM STYLE) --- */}
            <Modal
                title={
                    <span style={{ color: '#fff', fontSize: 18 }}>
                        Tạo loại vé mới
                    </span>
                }
                open={isTicketModalOpen}
                onCancel={() => setIsTicketModalOpen(false)}
                footer={null} // Custom footer trong form
                width={900}
                centered
                closeIcon={
                    <span style={{ color: '#fff', fontSize: 20 }}>×</span>
                }
                styles={{
                    content: {
                        background:
                            'linear-gradient(135deg, #2a2d34 0%, #1f1f1f 100%)', // Dark gradient
                        padding: 0,
                        border: '1px solid #393f4e',
                        overflow: 'hidden'
                    },
                    header: {
                        background: 'transparent',
                        padding: '20px 24px',
                        borderBottom: '1px solid #393f4e'
                    },
                    body: {
                        padding: '24px'
                    }
                }}
            >
                <Form
                    form={ticketForm}
                    layout='vertical'
                    onFinish={handleSaveTicket}
                >
                    {/* 1. Tên vé & Giá */}
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name='name'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Tên loại vé
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        message: 'Nhập tên loại vé'
                                    }
                                ]}
                            >
                                <Input
                                    placeholder='Nhập tên loại vé (VD: VIP, GA)'
                                    size='large'
                                    maxLength={50}
                                    showCount
                                    style={{
                                        color: '#fff',
                                        background: '#141414',
                                        borderColor: '#393f4e'
                                    }} // White text on dark
                                />
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
                                            style={{
                                                width: '150px',
                                                flex: 1,
                                                background: '#141414',
                                                borderColor: '#393f4e',
                                                color: '#fff'
                                            }}
                                            size='large'
                                            placeholder='0'
                                            disabled={isFreeTicket}
                                            formatter={value =>
                                                `${value}`.replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ','
                                                )
                                            }
                                            parser={value =>
                                                value.replace(/\$\s?|(,*)/g, '')
                                            }
                                            addonAfter='VND'
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

                    {/* 2. Grid 4 cột: Tổng vé, Min, Max */}
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item
                                name='total'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Tổng số lượng vé
                                    </span>
                                }
                                rules={[{ required: true, message: 'Nhập SL' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    size='large'
                                    min={1}
                                    placeholder='100'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name='minPerOrder'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Tối thiểu / Đơn
                                    </span>
                                }
                                initialValue={1}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    size='large'
                                    min={1}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name='maxPerOrder'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Tối đa / Đơn
                                    </span>
                                }
                                initialValue={10}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    size='large'
                                    min={1}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 3. Thời gian mở bán */}
                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item
                                name='saleTime'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Thời gian mở bán vé
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        message: 'Chọn thời gian mở bán'
                                    }
                                ]}
                            >
                                <DatePicker.RangePicker
                                    showTime
                                    format='HH:mm DD/MM/YYYY'
                                    style={{
                                        width: '100%',
                                        background: '#141414',
                                        borderColor: '#393f4e'
                                    }}
                                    size='large'
                                    placeholder={[
                                        'Bắt đầu bán',
                                        'Kết thúc bán'
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 4. Mô tả & Upload (70/30) */}
                    <Row gutter={24}>
                        <Col span={16}>
                            <Form.Item
                                name='description'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Mô tả loại vé
                                    </span>
                                }
                            >
                                <TextArea
                                    rows={5}
                                    showCount
                                    maxLength={1000}
                                    placeholder='Nhập mô tả chi tiết quyền lợi...'
                                    style={{
                                        background: '#141414',
                                        borderColor: '#393f4e',
                                        color: '#fff'
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name='image'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Ảnh vé (Minh hoạ)
                                    </span>
                                }
                            >
                                <Upload.Dragger
                                    maxCount={1}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        borderColor: '#393f4e',
                                        borderStyle: 'dashed'
                                    }}
                                >
                                    <p className='ant-upload-drag-icon'>
                                        <InboxOutlined
                                            style={{ color: '#2dc275' }}
                                        />
                                    </p>
                                    <p
                                        className='ant-upload-text'
                                        style={{ color: '#fff', fontSize: 12 }}
                                    >
                                        Thêm - 1MB
                                    </p>
                                </Upload.Dragger>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 5. Footer Buttons */}
                    <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
                        <Button
                            type='primary'
                            htmlType='submit'
                            block
                            size='large'
                            style={{
                                background: '#2dc275',
                                borderColor: '#2dc275',
                                height: 48,
                                fontWeight: 600,
                                fontSize: 16,
                                boxShadow: '0 4px 15px rgba(45, 194, 117, 0.3)' // Glow effect
                            }}
                        >
                            Lưu
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Step2Showtimes;
