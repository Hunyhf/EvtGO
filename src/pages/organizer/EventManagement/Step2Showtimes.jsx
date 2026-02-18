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
    EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const Step2Showtimes = ({
    setOnNextAction,
    formData,
    setFormData,
    nextStep // Prop này thực tế không cần dùng trong hàm validate nữa
}) => {
    const { token } = theme.useToken();

    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [showTimes, setShowTimes] = useState(
        formData?.showTimes?.length > 0
            ? formData.showTimes
            : [{ id: Date.now(), startTime: null, endTime: null, tickets: [] }]
    );

    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [currentShowtimeId, setCurrentShowtimeId] = useState(null);
    const [editingTicketIndex, setEditingTicketIndex] = useState(null);
    const [ticketForm] = Form.useForm();
    const [isFreeTicket, setIsFreeTicket] = useState(false);

    // ----------------------------------------------------------------------
    // LOGIC: ĐĂNG KÝ HÀM VALIDATE CHO CHA (ĐÃ SỬA)
    // ----------------------------------------------------------------------
    useEffect(() => {
        // Sử dụng triple closure để tương thích với CreateEvent: await onNextAction()()
        setOnNextAction(() => () => async () => {
            const isValid = showTimes.every(
                st => st.startTime && st.endTime && st.tickets.length > 0
            );

            if (!isValid) {
                message.error(
                    'Vui lòng nhập đầy đủ thời gian và tạo ít nhất 1 loại vé cho mỗi suất diễn!'
                );
                return false; // Trả về false để Cha không chuyển bước
            }

            // Cập nhật dữ liệu vào state tổng
            setFormData(prev => ({ ...prev, showTimes }));

            return true; // Trả về true để Cha tự gọi nextStep()
        });

        // Cleanup: Reset hành động khi rời khỏi component
        return () => setOnNextAction(null);
    }, [showTimes, setFormData, setOnNextAction]);

    // --- CÁC HÀM XỬ LÝ LOGIC ---
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
            prev.map(st =>
                st.id === id
                    ? { ...st, [field]: value ? value.toISOString() : null }
                    : st
            )
        );
    };

    const openTicketModal = (showtimeId, ticketIndex = null) => {
        const currentShowtime = showTimes.find(st => st.id === showtimeId);
        if (!currentShowtime?.endTime) {
            message.error(
                'Vui lòng chọn thời gian kết thúc sự kiện trước khi tạo vé!'
            );
            return;
        }

        setCurrentShowtimeId(showtimeId);
        setEditingTicketIndex(ticketIndex);

        if (ticketIndex !== null) {
            const ticket = currentShowtime.tickets[ticketIndex];
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

            setShowTimes(prev =>
                prev.map(st => {
                    if (st.id !== currentShowtimeId) return st;

                    const newTickets = [...st.tickets];
                    if (editingTicketIndex !== null) {
                        newTickets[editingTicketIndex] = newTicket;
                    } else {
                        newTickets.push(newTicket);
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
            console.error('Lỗi khi lưu vé:', error);
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
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ color: '#fff', margin: 0 }}>
                    Thông tin suất diễn & Vé
                </Title>
                <Text type='secondary'>Vui lòng nhập thông tin suất diễn</Text>
            </div>

            <Collapse
                defaultActiveKey={showTimes.map(st => st.id)}
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
                                                Bắt đầu
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
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span style={{ color: '#fff' }}>
                                                Kết thúc
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
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
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
                            </div>

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
                                <Button
                                    type='dashed'
                                    onClick={() => openTicketModal(showtime.id)}
                                    style={{
                                        width:
                                            showtime.tickets.length > 0
                                                ? 200
                                                : '100%',
                                        height: 50,
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

            <Modal
                title={
                    <span style={{ color: '#fff', fontSize: 18 }}>
                        Tạo loại vé mới
                    </span>
                }
                open={isTicketModalOpen}
                onCancel={() => setIsTicketModalOpen(false)}
                footer={null}
                width={700}
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
                                name='name'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Tên loại vé
                                    </span>
                                }
                                rules={[
                                    { required: true, message: 'Nhập tên' }
                                ]}
                            >
                                <Input placeholder='VD: VIP' size='large' />
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
                                name='total'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Số lượng
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
                                name='saleTime'
                                label={
                                    <span style={{ color: '#fff' }}>
                                        Thời gian bán
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        message: 'Chọn thời gian'
                                    }
                                ]}
                            >
                                <DatePicker.RangePicker
                                    showTime
                                    format='HH:mm DD/MM/YYYY'
                                    style={{ width: '100%' }}
                                    size='large'
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name='description'
                        label={<span style={{ color: '#fff' }}>Mô tả</span>}
                    >
                        <TextArea
                            rows={3}
                            placeholder='Mô tả quyền lợi vé...'
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
