import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Space,
    Button,
    Input,
    Select,
    Tooltip,
    Modal,
    App,
    Typography,
    Descriptions,
    Image,
    Divider,
    Avatar,
    Row,
    Col,
    Card,
    Popconfirm
} from 'antd';
import {
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    FileProtectOutlined,
    AuditOutlined,
    UserOutlined,
    DollarCircleOutlined,
    BankOutlined,
    MailOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { eventApi } from '@apis/eventApi';
import { ticketApi } from '@apis/ticketApi';
import styles from './AdminEventManagement.module.scss';
import { getEventImageUrl } from '@utils/imageHelper';

const { Title, Text } = Typography;
const { Option } = Select;

const removeAccents = str => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

function AdminEventManagement() {
    const { message } = App.useApp();

    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventTickets, setEventTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await eventApi.getAll({ size: 1000 });
            let rawEvents =
                res?.result ||
                res?.content ||
                res?.data ||
                (Array.isArray(res) ? res : []);

            const mappedData = rawEvents.map(event => {
                const posterObj =
                    event.images?.find(
                        img => img.isCover === true || img.cover === true
                    ) || event.images?.[0];
                const posterUrl = getEventImageUrl(event.id, posterObj?.url);

                const logoObj =
                    event.images?.find(
                        img => img.isCover === false || img.cover === false
                    ) || (event.images?.length > 1 ? event.images[1] : null);

                const logoUrl = logoObj
                    ? getEventImageUrl(event.id, logoObj.url)
                    : null;

                const isPublished = event.isPublished || event.published;
                const isActive = event.isActive || event.active;

                let derivedStatus = 'PENDING';
                if (!isPublished && isActive) {
                    derivedStatus = 'PAST';
                } else if (isPublished && isActive) {
                    derivedStatus = 'OPEN';
                } else if (isPublished && !isActive) {
                    derivedStatus = 'UPCOMING';
                } else {
                    derivedStatus = 'PENDING';
                }

                const fullStartTime = event.startDate
                    ? `${event.startDate} ${event.startTime || '00:00:00'}`
                    : null;

                const fullEndTime = event.endDate
                    ? `${event.endDate} ${event.endTime || '23:59:59'}`
                    : event.endTime && event.startDate
                      ? `${event.startDate} ${event.endTime}`
                      : null;

                return {
                    ...event,
                    key: event.id,
                    posterUrl,
                    logoUrl,
                    derivedStatus,
                    isPublished,
                    isActive,
                    fullStartTime,
                    fullEndTime,
                    organizerDisplay:
                        event.producer?.producerName || event.createdBy || 'N/A'
                };
            });

            mappedData.sort((a, b) => {
                const timeA = dayjs(a.fullStartTime).unix();
                const timeB = dayjs(b.fullStartTime).unix();
                return timeB - timeA;
            });

            setDataSource(mappedData);
        } catch (error) {
            message.error('Không thể tải danh sách sự kiện.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const updateStatus = async (apiFunc, successMsg) => {
        try {
            await apiFunc();
            message.success(successMsg);
            fetchEvents();
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi thao tác.');
        }
    };

    const handleDelete = async id => {
        try {
            await eventApi.remove(id);
            message.success('Đã xóa sự kiện thành công.');
            fetchEvents();
        } catch (error) {
            message.error(
                error.response?.data?.message || 'Không thể xóa sự kiện.'
            );
        }
    };

    const handleViewDetail = async record => {
        setSelectedEvent(record);
        setIsDetailModalOpen(true);
        setLoadingTickets(true);
        setEventTickets([]);

        try {
            const res = await ticketApi.getAll({
                filter: `event.id:${record.id}`
            });
            const ticketData =
                res?.result?.content || res?.data || res?.result || [];
            setEventTickets(Array.isArray(ticketData) ? ticketData : []);
        } catch (error) {
            console.error('Lỗi tải danh sách vé:', error);
        } finally {
            setLoadingTickets(false);
        }
    };

    const filteredData = dataSource.filter(item => {
        const matchStatus =
            filterStatus === 'ALL' || item.derivedStatus === filterStatus;
        const searchNormalized = removeAccents(searchText.toLowerCase());
        const nameNormalized = removeAccents((item.name || '').toLowerCase());
        return matchStatus && nameNormalized.includes(searchNormalized);
    });

    const totalRevenue = eventTickets.reduce((acc, ticket) => {
        const sold = ticket.soldQuantity || 0;
        return acc + ticket.price * sold;
    }, 0);

    const columns = [
        {
            title: 'Sự kiện',
            dataIndex: 'name',
            key: 'name',
            width: 380,
            render: (text, record) => (
                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                    }}
                >
                    <div
                        style={{
                            width: '150px',
                            height: '90px',
                            flexShrink: 0
                        }}
                    >
                        <img
                            src={record.posterUrl}
                            alt='cover'
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #f0f0f0'
                            }}
                            onError={e => {
                                e.target.src =
                                    'https://placehold.co/120x70?text=No+Image';
                            }}
                        />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div
                            style={{
                                fontWeight: '600',
                                fontSize: '14px',
                                marginBottom: '4px'
                            }}
                        >
                            {text}
                        </div>
                        <div style={{ fontSize: '11px', color: '#1677ff' }}>
                            <EnvironmentOutlined /> {record.location}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Thời gian',
            key: 'time',
            width: 100,
            render: (_, record) => (
                <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
                    <div>
                        <Text type='secondary' style={{ fontSize: '10px' }}>
                            BĐ:{' '}
                        </Text>
                        {record.fullStartTime
                            ? dayjs(record.fullStartTime).format(
                                  'HH:mm DD/MM/YYYY'
                              )
                            : '--'}
                    </div>
                    <div>
                        <Text type='secondary' style={{ fontSize: '10px' }}>
                            KT:{' '}
                        </Text>
                        {record.fullEndTime
                            ? dayjs(record.fullEndTime).format(
                                  'HH:mm DD/MM/YYYY'
                              )
                            : '--'}
                    </div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'derivedStatus',
            key: 'status',
            width: 50,
            align: 'center',
            render: status => {
                const statusConfig = {
                    PENDING: { color: 'default', text: 'Chờ' },
                    UPCOMING: { color: 'processing', text: 'Sắp bán' },
                    OPEN: { color: 'success', text: 'Mở bán' },
                    PAST: { color: 'orange', text: 'Đã qua' }
                };
                const config = statusConfig[status] || {
                    color: 'default',
                    text: 'Khác'
                };
                return (
                    <Tag color={config.color} style={{ fontSize: '10px' }}>
                        {config.text.toUpperCase()}
                    </Tag>
                );
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space size='middle'>
                    <Tooltip title='Xem'>
                        <Button
                            size='small'
                            type='text'
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    {record.derivedStatus !== 'PAST' && (
                        <Tooltip title={record.isPublished ? 'Gỡ' : 'Duyệt'}>
                            <Button
                                size='small'
                                type='text'
                                style={{
                                    color: record.isPublished
                                        ? '#faad14'
                                        : '#52c41a'
                                }}
                                icon={
                                    record.isPublished ? (
                                        <CloseCircleOutlined />
                                    ) : (
                                        <CheckCircleOutlined />
                                    )
                                }
                                onClick={() =>
                                    updateStatus(
                                        () =>
                                            eventApi.togglePublished(record.id),
                                        record.isPublished
                                            ? 'Đã gỡ'
                                            : 'Đã duyệt'
                                    )
                                }
                            />
                        </Tooltip>
                    )}

                    {/* NÚT XÓA SỰ KIỆN - CHỈ HIỂN THỊ KHI CHƯA DUYỆT (isPublished === false) */}
                    {!record.isPublished && (
                        <Tooltip title='Xóa sự kiện'>
                            <Popconfirm
                                title='Xóa sự kiện?'
                                description='Hành động này không thể hoàn tác và sẽ xóa toàn bộ vé liên quan.'
                                onConfirm={() => handleDelete(record.id)}
                                okText='Xóa'
                                cancelText='Hủy'
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    size='small'
                                    type='text'
                                    danger
                                    icon={<DeleteOutlined />}
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className={styles.content}>
            <div className={styles.header}>
                <Title level={3}>Quản lý sự kiện</Title>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Input
                        placeholder='Tìm tên sự kiện...'
                        prefix={<SearchOutlined />}
                        style={{ width: 250 }}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Select
                        defaultValue='ALL'
                        style={{ width: 150 }}
                        onChange={setFilterStatus}
                    >
                        <Option value='ALL'>Tất cả trạng thái</Option>
                        <Option value='PENDING'>Chờ duyệt</Option>
                        <Option value='UPCOMING'>Sắp mở bán</Option>
                        <Option value='OPEN'>Đang mở bán</Option>
                        <Option value='PAST'>Đã diễn ra</Option>
                    </Select>
                </div>
            </div>

            <div style={{ marginTop: 20 }}>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey='id'
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </div>

            <Modal
                title={
                    <Space>
                        <InfoCircleOutlined />
                        <span>Thông tin chi tiết quản trị</span>
                    </Space>
                }
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button
                        key='close'
                        onClick={() => setIsDetailModalOpen(false)}
                    >
                        Đóng
                    </Button>
                ]}
                width={900}
            >
                {selectedEvent && (
                    <div
                        style={{
                            maxHeight: '75vh',
                            overflowY: 'auto',
                            paddingRight: '8px'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                gap: '24px',
                                marginBottom: '24px'
                            }}
                        >
                            <Image
                                width={320}
                                height={180}
                                src={selectedEvent.posterUrl}
                                style={{
                                    borderRadius: '8px',
                                    objectFit: 'cover'
                                }}
                            />
                            <div style={{ flex: 1 }}>
                                <Title
                                    level={4}
                                    style={{ marginBottom: '8px' }}
                                >
                                    {selectedEvent.name}
                                </Title>
                                <Space
                                    align='center'
                                    style={{
                                        marginBottom: '12px',
                                        background: '#f5f5f5',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        width: '100%'
                                    }}
                                >
                                    <Avatar
                                        src={selectedEvent.logoUrl}
                                        size={48}
                                        icon={<UserOutlined />}
                                    />
                                    <div>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#8c8c8c'
                                            }}
                                        >
                                            Đơn vị tổ chức
                                        </div>
                                        <Text strong>
                                            {selectedEvent.organizerDisplay}
                                        </Text>
                                    </div>
                                </Space>
                                <Tag
                                    color={
                                        selectedEvent.derivedStatus === 'PAST'
                                            ? 'orange'
                                            : 'blue'
                                    }
                                >
                                    {selectedEvent.derivedStatus.toUpperCase()}
                                </Tag>
                            </div>
                        </div>

                        <Divider
                            orientation='left'
                            style={{ margin: '12px 0' }}
                        >
                            <Space>
                                <BankOutlined /> Thông tin Đối soát & Thanh toán
                            </Space>
                        </Divider>
                        <Card
                            size='small'
                            style={{
                                background: '#fafafa',
                                marginBottom: 24,
                                border: '1px solid #e8e8e8'
                            }}
                        >
                            {selectedEvent.producer ? (
                                <Descriptions column={2} size='small' bordered>
                                    <Descriptions.Item
                                        label={
                                            <span>
                                                <UserOutlined /> Tên pháp nhân
                                            </span>
                                        }
                                    >
                                        <Text strong>
                                            {
                                                selectedEvent.producer
                                                    .producerName
                                            }
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label={
                                            <span>
                                                <MailOutlined /> Email liên hệ
                                            </span>
                                        }
                                    >
                                        {selectedEvent.producer.contactEmail ||
                                            'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Ngân hàng'>
                                        <Tag color='blue'>
                                            {selectedEvent.producer.bankName}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Số tài khoản'>
                                        <Text
                                            copyable={{
                                                text: selectedEvent.producer
                                                    .bankAccountNumber
                                            }}
                                            style={{
                                                color: '#2dc275',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {
                                                selectedEvent.producer
                                                    .bankAccountNumber
                                            }
                                        </Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            ) : (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: '10px',
                                        color: '#999'
                                    }}
                                >
                                    Sự kiện này chưa cập nhật thông tin nhà tổ
                                    chức chi tiết.
                                </div>
                            )}
                        </Card>

                        <Row gutter={24}>
                            <Col span={12}>
                                <Descriptions
                                    title='Thời gian & Địa điểm'
                                    bordered
                                    column={1}
                                    size='small'
                                >
                                    <Descriptions.Item label='Địa điểm'>
                                        {selectedEvent.location}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Bắt đầu'>
                                        {dayjs(
                                            selectedEvent.fullStartTime
                                        ).format('HH:mm DD/MM/YYYY')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Kết thúc'>
                                        {selectedEvent.fullEndTime
                                            ? dayjs(
                                                  selectedEvent.fullEndTime
                                              ).format('HH:mm DD/MM/YYYY')
                                            : '--'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col span={12}>
                                <Descriptions
                                    title={
                                        <Space>
                                            <FileProtectOutlined /> Thông tin
                                            pháp lý
                                        </Space>
                                    }
                                    bordered
                                    column={1}
                                    size='small'
                                >
                                    <Descriptions.Item label='Số giấy phép'>
                                        {selectedEvent.permitNumber || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Ngày cấp'>
                                        {selectedEvent.permitIssuedAt
                                            ? dayjs(
                                                  selectedEvent.permitIssuedAt
                                              ).format('DD/MM/YYYY')
                                            : 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Cơ quan cấp'>
                                        {selectedEvent.permitIssuedBy || 'N/A'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>

                        <Divider
                            orientation='left'
                            style={{ marginTop: '24px' }}
                        >
                            <Space>
                                <AuditOutlined /> Danh sách loại vé & Báo cáo
                                doanh thu
                            </Space>
                        </Divider>

                        <Table
                            dataSource={eventTickets}
                            loading={loadingTickets}
                            pagination={false}
                            size='small'
                            rowKey='id'
                            columns={[
                                {
                                    title: 'Hạng vé',
                                    dataIndex: 'ticketType',
                                    render: type => (
                                        <Text strong>
                                            {type === 'VIP'
                                                ? 'Vé VIP'
                                                : 'Vé Tiêu chuẩn'}
                                        </Text>
                                    )
                                },
                                {
                                    title: 'Giá niêm yết',
                                    dataIndex: 'price',
                                    render: price => (
                                        <Text type='danger'>
                                            {price === 0
                                                ? 'Miễn phí'
                                                : `${new Intl.NumberFormat('vi-VN').format(price)} đ`}
                                        </Text>
                                    )
                                },
                                {
                                    title: 'Tổng vé',
                                    dataIndex: 'totalQuantity',
                                    align: 'center'
                                },
                                {
                                    title: 'Đã bán',
                                    dataIndex: 'soldQuantity',
                                    align: 'center',
                                    render: (sold, record) => (
                                        <Text
                                            strong
                                            type={
                                                sold > 0
                                                    ? 'success'
                                                    : 'secondary'
                                            }
                                        >
                                            {sold || 0} / {record.totalQuantity}
                                        </Text>
                                    )
                                },
                                {
                                    title: 'Doanh thu loại vé',
                                    key: 'subtotal',
                                    align: 'right',
                                    render: (_, record) => (
                                        <Text>
                                            {new Intl.NumberFormat(
                                                'vi-VN'
                                            ).format(
                                                (record.soldQuantity || 0) *
                                                    record.price
                                            )}{' '}
                                            đ
                                        </Text>
                                    )
                                }
                            ]}
                        />

                        <div
                            style={{
                                marginTop: '20px',
                                padding: '16px',
                                background: '#f6ffed',
                                border: '1px solid #b7eb8f',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <Space>
                                <DollarCircleOutlined
                                    style={{
                                        fontSize: '20px',
                                        color: '#52c41a'
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Tổng doanh thu sự kiện:
                                </Text>
                                <Title
                                    level={3}
                                    style={{ margin: 0, color: '#52c41a' }}
                                >
                                    {new Intl.NumberFormat('vi-VN').format(
                                        totalRevenue
                                    )}{' '}
                                    đ
                                </Title>
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default AdminEventManagement;
