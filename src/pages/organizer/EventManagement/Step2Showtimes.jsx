import React, { useState, useEffect, useCallback } from 'react';
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
    App
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    CalendarOutlined,
    AppstoreAddOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import TicketIconSvg from '@icons/svgs/ticketIcon.svg';

const { Title, Text } = Typography;
const { Option } = Select;

const Step2Showtimes = ({ setOnNextAction, formData, setFormData }) => {
    // 1. Lấy message từ context App để tránh lỗi Static Function
    const { message } = App.useApp();

    const [tickets, setTickets] = useState(formData?.tickets || []);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [editingTicketIndex, setEditingTicketIndex] = useState(null);
    const [isFreeTicket, setIsFreeTicket] = useState(false);
    const [ticketForm] = Form.useForm();

    // 2. Hàm Validate được viết bằng useCallback
    const validateStep = useCallback(async () => {
        const now = dayjs();
        const start = formData.startTime ? dayjs(formData.startTime) : null;
        const end = formData.endTime ? dayjs(formData.endTime) : null;

        if (!start || !end) {
            message.error(
                'Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc!'
            );
            return false;
        }
        if (start.isBefore(now)) {
            message.error('Thời gian bắt đầu không được nhỏ hơn hiện tại!');
            return false;
        }
        if (start.isAfter(end) || start.isSame(end)) {
            message.error('Giờ bắt đầu phải nhỏ hơn giờ kết thúc!');
            return false;
        }
        if (tickets.length === 0) {
            message.error('Vui lòng tạo ít nhất 1 loại vé để tiếp tục!');
            return false;
        }
        return true;
    }, [formData.startTime, formData.endTime, tickets, message]);

    // 3. Đăng ký hàm validate (Thống nhất logic 2 lớp với cha)
    useEffect(() => {
        setOnNextAction(() => validateStep);
    }, [validateStep, setOnNextAction]);

    // 4. Cập nhật trực tiếp vào formData
    const updateTicketsInParent = newTickets => {
        setTickets(newTickets);
        setFormData(prev => ({ ...prev, tickets: newTickets }));
    };

    const handleTimeChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
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
            ticketForm.setFieldsValue({
                ticketType: 'STANDARD',
                totalQuantity: 1
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
                ticketStatus: 'PUBLISHED'
            };

            let updatedTickets;
            if (editingTicketIndex !== null) {
                updatedTickets = [...tickets];
                updatedTickets[editingTicketIndex] = newTicket;
            } else {
                updatedTickets = [...tickets, newTicket];
            }

            updateTicketsInParent(updatedTickets);
            setIsTicketModalOpen(false);
            message.success(
                editingTicketIndex !== null
                    ? 'Cập nhật thành công'
                    : 'Tạo mới thành công'
            );
        } catch (error) {
            console.error('Validate failed:', error);
        }
    };

    const handleDeleteTicket = index => {
        const updatedTickets = tickets.filter((_, idx) => idx !== index);
        updateTicketsInParent(updatedTickets);
    };

    const disabledDate = current => current && current < dayjs().startOf('day');

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Phần Thời gian */}
            <div className='form-section-dark' style={styles.sectionCard}>
                <Title level={4} style={styles.whiteText}>
                    <CalendarOutlined /> Thời gian diễn ra sự kiện
                </Title>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label={
                                <span style={styles.labelText}>Bắt đầu</span>
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
                                    formData.startTime
                                        ? dayjs(formData.startTime)
                                        : null
                                }
                                onChange={date =>
                                    handleTimeChange('startTime', date)
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={
                                <span style={styles.labelText}>Kết thúc</span>
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
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            {/* Phần Checkbox IsSeated */}
            <div
                style={{
                    ...styles.sectionCard,
                    background: formData.isSeated
                        ? 'rgba(45, 194, 117, 0.1)'
                        : '#2a2d34',
                    borderColor: formData.isSeated ? '#2dc275' : '#393f4e',
                    borderStyle: formData.isSeated ? 'dashed' : 'solid'
                }}
            >
                <Checkbox
                    checked={formData.isSeated}
                    onChange={e => {
                        const isChecked = e.target.checked;
                        setFormData(prev => ({
                            ...prev,
                            isSeated: isChecked,
                            seats: isChecked ? prev.seats : [],
                            seatZones: isChecked ? prev.seatZones : []
                        }));
                    }}
                >
                    <Space>
                        <AppstoreAddOutlined
                            style={{
                                color: formData.isSeated
                                    ? '#2dc275'
                                    : '#9ca6b0',
                                fontSize: 20
                            }}
                        />
                        <strong
                            style={{
                                color: formData.isSeated ? '#2dc275' : '#fff'
                            }}
                        >
                            Sự kiện có sơ đồ ghế ngồi (Người dùng được chọn vị
                            trí)
                        </strong>
                    </Space>
                </Checkbox>
                {formData.isSeated && (
                    <div style={styles.hintText}>
                        <InfoCircleOutlined /> Hệ thống sẽ thêm{' '}
                        <strong>Bước 3: Sơ đồ ghế</strong> để bạn thiết lập.
                    </div>
                )}
            </div>

            {/* Danh sách vé */}
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={styles.whiteText}>
                    Cấu hình loại vé chung
                </Title>
                <Text type='secondary'>
                    Dùng cho khu vực đứng hoặc vé không phân vị trí ghế.
                </Text>
            </div>

            <div style={styles.ticketContainer}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {tickets.map((ticket, idx) => (
                        <Card
                            key={idx}
                            size='small'
                            style={styles.ticketCard}
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
                                    <img
                                        src={TicketIconSvg}
                                        alt='Ticket Icon'
                                        style={{
                                            width: 24,
                                            height: 24,
                                            objectFit: 'contain'
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
                                        <div style={styles.quantityText}>
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
                        style={styles.addBtn}
                        icon={<PlusOutlined />}
                    >
                        Tạo loại vé mới
                    </Button>
                </div>
            </div>

            <Modal
                title={<span style={{ color: '#fff' }}>Thông tin loại vé</span>}
                open={isTicketModalOpen}
                onCancel={() => setIsTicketModalOpen(false)}
                footer={null}
                width={450}
                centered
                styles={{
                    content: styles.modalContent,
                    header: styles.modalHeader
                }}
            >
                <Form
                    form={ticketForm}
                    layout='vertical'
                    onFinish={handleSaveTicket}
                >
                    <Form.Item
                        name='ticketType'
                        label={<span style={styles.labelText}>Hạng vé</span>}
                        rules={[{ required: true }]}
                    >
                        <Select size='large'>
                            <Option value='STANDARD'>Phổ thông</Option>
                            <Option value='VIP'>VIP</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={<span style={styles.labelText}>Giá vé</span>}
                        required
                    >
                        <Space.Compact style={{ width: '100%' }}>
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
                                    style={{ width: '70%' }}
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
                        </Space.Compact>
                    </Form.Item>

                    <Form.Item
                        name='totalQuantity'
                        label={<span style={styles.labelText}>Số lượng</span>}
                        rules={[{ required: true, message: 'Nhập SL' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            size='large'
                            min={1}
                        />
                    </Form.Item>

                    <Button
                        type='primary'
                        htmlType='submit'
                        block
                        size='large'
                        style={styles.submitBtn}
                    >
                        Lưu vé
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

const styles = {
    sectionCard: {
        marginBottom: 32,
        background: '#2a2d34',
        padding: 24,
        borderRadius: 8,
        border: '1px solid #393f4e',
        transition: 'all 0.3s'
    },
    whiteText: { color: '#fff', marginTop: 0, marginBottom: 20 },
    labelText: { color: '#fff' },
    hintText: { marginTop: 12, marginLeft: 32, color: '#9ca6b0', fontSize: 13 },
    ticketContainer: {
        background: '#2a2d34',
        padding: 24,
        borderRadius: 8,
        border: '1px solid #393f4e',
        minHeight: 180
    },
    ticketCard: { width: 280, background: '#1f1f1f', borderColor: '#393f4e' },
    quantityText: { color: '#9ca6b0', fontSize: 12, marginTop: 8 },
    addBtn: {
        width: 280,
        height: 110,
        borderColor: '#393f4e',
        color: '#9ca6b0',
        background: 'transparent'
    },
    modalContent: { background: '#2a2d34', border: '1px solid #393f4e' },
    modalHeader: {
        background: 'transparent',
        borderBottom: '1px solid #393f4e'
    },
    freeCheckWrapper: {
        width: '30%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #434343',
        borderLeft: 'none',
        background: '#1f1f1f'
    },
    submitBtn: {
        background: '#2dc275',
        borderColor: '#2dc275',
        height: 45,
        marginTop: 8
    }
};

export default Step2Showtimes;
