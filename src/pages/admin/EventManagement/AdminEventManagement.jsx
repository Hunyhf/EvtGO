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
    Col
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
    UserOutlined
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
            const res = await eventApi.getAll();
            let rawEvents =
                res?.result ||
                res?.content ||
                res?.data ||
                (Array.isArray(res) ? res : []);

            const mappedData = rawEvents.map(event => {
                // 1. Lấy Poster (Ưu tiên ảnh isCover/cover = true)
                const posterObj =
                    event.images?.find(
                        img => img.isCover === true || img.cover === true
                    ) || event.images?.[0];
                const posterUrl = getEventImageUrl(event.id, posterObj?.url);

                // 2. Lấy Logo Ban tổ chức (Ưu tiên ảnh isCover/cover = false giống EventDetail)
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
                    // Hiển thị đơn vị tổ chức là người tạo sự kiện (createdBy)
                    organizerName: event.createdBy || 'N/A'
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

    const columns = [
        {
            title: 'Sự kiện',
            dataIndex: 'name',
            key: 'name',
            width: 300,
            render: (text, record) => (
                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                    }}
                >
                    <img
                        src={record.posterUrl}
                        alt='cover'
                        style={{
                            width: '80px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                        }}
                        onError={e => {
                            e.target.src =
                                'https://placehold.co/200x120?text=No+Image';
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
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
            width: 220,
            render: (_, record) => (
                <div style={{ fontSize: '12px' }}>
                    <div>
                        <Text type='secondary' style={{ fontSize: '11px' }}>
                            BĐ:{' '}
                        </Text>
                        {record.fullStartTime
                            ? dayjs(record.fullStartTime).format(
                                  'HH:mm DD/MM/YYYY'
                              )
                            : '--'}
                    </div>
                    <div>
                        <Text type='secondary' style={{ fontSize: '11px' }}>
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
            width: 140,
            render: status => {
                const statusConfig = {
                    PENDING: { color: 'default', text: 'Chờ duyệt' },
                    UPCOMING: { color: 'processing', text: 'Sắp mở bán' },
                    OPEN: { color: 'success', text: 'Đang mở bán' },
                    PAST: { color: 'orange', text: 'Đã diễn ra' }
                };
                const config = statusConfig[status] || {
                    color: 'default',
                    text: 'Khác'
                };
                return (
                    <Tag color={config.color}>{config.text.toUpperCase()}</Tag>
                );
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size='small'>
                    <Tooltip title='Xem chi tiết'>
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    {record.derivedStatus !== 'PAST' && (
                        <Tooltip
                            title={
                                record.isPublished
                                    ? 'Gỡ hiển thị'
                                    : 'Duyệt sự kiện'
                            }
                        >
                            <Button
                                type={
                                    record.isPublished ? 'default' : 'primary'
                                }
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
                                            ? 'Đã gỡ hiển thị'
                                            : 'Đã duyệt hiển thị'
                                    )
                                }
                            />
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
                width={850}
            >
                {selectedEvent && (
                    <div
                        style={{
                            maxHeight: '75vh',
                            overflowY: 'auto',
                            paddingRight: '8px'
                        }}
                    >
                        {/* Header chi tiết: Poster + Logo (isCover=false) + Tên */}
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
                                            {selectedEvent.organizerName}
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

                        {/* Thông tin giấy phép & Thời gian */}
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
                                <AuditOutlined /> Danh sách loại vé
                            </Space>
                        </Divider>

                        {/* Bảng danh sách vé */}
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
                                    title: 'Số lượng vé',
                                    dataIndex: 'totalQuantity',
                                    align: 'center'
                                }
                            ]}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default AdminEventManagement;
