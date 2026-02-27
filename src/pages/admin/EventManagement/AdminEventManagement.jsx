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
    Popconfirm,
    Descriptions,
    Image,
    Divider
} from 'antd';
import {
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { eventApi } from '@apis/eventApi';
import styles from './AdminEventManagement.module.scss';
import { getEventImageUrl } from '@utils/imageHelper';

const { Title, Text } = Typography;
const { Option } = Select;

// Hàm hỗ trợ loại bỏ dấu tiếng Việt
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

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [currentEventId, setCurrentEventId] = useState(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await eventApi.getAll();
            let rawEvents =
                res?.result ||
                res?.content ||
                res?.data ||
                (Array.isArray(res) ? res : []);
            const now = dayjs();

            const mappedData = rawEvents.map(event => {
                const posterObj =
                    event.images?.find(img => img.isCover === true) ||
                    event.images?.[0];
                const posterUrl = getEventImageUrl(event.id, posterObj?.url);

                const fullStartTimeStr = event.startDate
                    ? `${event.startDate} ${event.startTime || '00:00:00'}`
                    : null;
                const fullEndTimeStr = event.endDate
                    ? `${event.endDate} ${event.endTime || '00:00:00'}`
                    : null;

                const eventStartTime = fullStartTimeStr
                    ? dayjs(fullStartTimeStr)
                    : null;
                const eventEndTime = fullEndTimeStr
                    ? dayjs(fullEndTimeStr)
                    : null;

                const isPublished = event.isPublished || event.published;
                const isActive = event.isActive || event.active;
                const isPast = eventEndTime
                    ? eventEndTime.isBefore(now)
                    : eventStartTime && eventStartTime.isBefore(now);

                let derivedStatus = 'PENDING';
                if (isPast) derivedStatus = 'PAST';
                else if (isPublished) derivedStatus = 'APPROVED';
                else if (isActive) derivedStatus = 'REJECTED';
                else derivedStatus = 'PENDING';

                return {
                    ...event,
                    key: event.id,
                    posterUrl,
                    derivedStatus,
                    fullStartTime: fullStartTimeStr,
                    fullEndTime: fullEndTimeStr,
                    organizerName: event.createdBy || 'N/A'
                };
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

    const handleViewDetail = record => {
        setSelectedEvent(record);
        setIsDetailModalOpen(true);
    };

    const handleApprove = async id => {
        try {
            await eventApi.approve(id);
            message.success('Đã duyệt sự kiện thành công!');
            fetchEvents();
        } catch (error) {
            message.error(
                error.response?.data?.message || 'Lỗi khi duyệt sự kiện.'
            );
        }
    };

    const handleRejectConfirm = async () => {
        try {
            await eventApi.toggleActive(currentEventId);
            message.success('Đã chuyển sự kiện vào danh sách từ chối.');
            setIsRejectModalOpen(false);
            fetchEvents();
        } catch (error) {
            message.error('Lỗi khi thực hiện thao tác.');
        }
    };

    // Logic lọc dữ liệu hỗ trợ không dấu
    const filteredData = dataSource.filter(item => {
        const matchStatus =
            filterStatus === 'ALL' || item.derivedStatus === filterStatus;

        // Chuyển từ khóa tìm kiếm sang không dấu
        const searchNormalized = removeAccents(searchText.toLowerCase());

        // Chuyển tên sự kiện và ban tổ chức sang không dấu
        const nameNormalized = removeAccents((item.name || '').toLowerCase());
        const organizerNormalized = removeAccents(
            (item.organizerName || '').toLowerCase()
        );

        const matchSearch =
            nameNormalized.includes(searchNormalized) ||
            organizerNormalized.includes(searchNormalized);

        return matchStatus && matchSearch;
    });

    const columns = [
        {
            title: 'Sự kiện',
            dataIndex: 'name',
            key: 'name',
            width: 350,
            render: (text, record) => (
                <div
                    style={{
                        display: 'flex',
                        gap: '15px',
                        alignItems: 'center'
                    }}
                >
                    <img
                        src={record.posterUrl}
                        alt='cover'
                        style={{
                            width: '100px',
                            height: '65px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                        }}
                        onError={e => {
                            e.target.src =
                                'https://placehold.co/200x120?text=No+Image';
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{text}</div>
                        <div style={{ fontSize: '11px', color: '#1677ff' }}>
                            <EnvironmentOutlined /> {record.location}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Ban tổ chức',
            dataIndex: 'organizerName',
            key: 'organizer',
            width: 150
        },
        {
            title: 'Thời gian',
            key: 'time',
            width: 200,
            render: (_, record) => (
                <div style={{ fontSize: '12px' }}>
                    <div>
                        <ClockCircleOutlined style={{ color: '#52c41a' }} />{' '}
                        {record.fullStartTime
                            ? dayjs(record.fullStartTime).format(
                                  'HH:mm DD/MM/YYYY'
                              )
                            : '--'}
                    </div>
                    {record.fullEndTime && (
                        <div style={{ color: '#888', paddingLeft: '17px' }}>
                            đến{' '}
                            {dayjs(record.fullEndTime).format(
                                'HH:mm DD/MM/YYYY'
                            )}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'derivedStatus',
            key: 'status',
            width: 120,
            render: status => {
                const statusConfig = {
                    PENDING: { color: 'warning', text: 'Chờ duyệt' },
                    APPROVED: { color: 'success', text: 'Đã duyệt' },
                    PAST: { color: 'default', text: 'Đã qua' },
                    REJECTED: { color: 'error', text: 'Bị từ chối' }
                };
                const config = statusConfig[status] || {
                    color: 'default',
                    text: 'Khác'
                };
                return <Tag color={config.color}>{config.text}</Tag>;
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
                    {record.derivedStatus === 'PENDING' && (
                        <>
                            <Popconfirm
                                title='Duyệt sự kiện này?'
                                onConfirm={() => handleApprove(record.id)}
                                okText='Duyệt'
                                cancelText='Hủy'
                            >
                                <Button
                                    type='primary'
                                    ghost
                                    icon={<CheckCircleOutlined />}
                                >
                                    Duyệt
                                </Button>
                            </Popconfirm>
                            <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => {
                                    setCurrentEventId(record.id);
                                    setIsRejectModalOpen(true);
                                }}
                            >
                                Từ chối
                            </Button>
                        </>
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
                        <Option value='ALL'>Tất cả</Option>
                        <Option value='PENDING'>Chờ duyệt</Option>
                        <Option value='APPROVED'>Đã duyệt</Option>
                        <Option value='REJECTED'>Từ chối</Option>
                        <Option value='PAST'>Đã qua</Option>
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
                        <span>Thông tin chi tiết sự kiện</span>
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
                width={800}
            >
                {selectedEvent && (
                    <div
                        style={{
                            maxHeight: '70vh',
                            overflowY: 'auto',
                            paddingRight: '10px'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                gap: '20px',
                                marginBottom: '20px'
                            }}
                        >
                            <Image
                                width={240}
                                height={160}
                                src={selectedEvent.posterUrl}
                                style={{
                                    borderRadius: '8px',
                                    objectFit: 'cover'
                                }}
                                fallback='https://placehold.co/400x300?text=No+Image'
                            />
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {selectedEvent.name}
                                </Title>
                                <Text type='secondary'>
                                    ID: {selectedEvent.id}
                                </Text>
                                <div style={{ marginTop: '10px' }}>
                                    <Tag
                                        color={
                                            selectedEvent.derivedStatus ===
                                            'APPROVED'
                                                ? 'green'
                                                : 'orange'
                                        }
                                    >
                                        {selectedEvent.derivedStatus}
                                    </Tag>
                                </div>
                            </div>
                        </div>

                        <Descriptions
                            title='Thông tin tổ chức'
                            bordered
                            column={1}
                            size='small'
                        >
                            <Descriptions.Item label='Địa điểm'>
                                <EnvironmentOutlined /> {selectedEvent.location}
                            </Descriptions.Item>
                            <Descriptions.Item label='Thời gian bắt đầu'>
                                {selectedEvent.fullStartTime
                                    ? dayjs(selectedEvent.fullStartTime).format(
                                          'HH:mm - dddd, DD/MM/YYYY'
                                      )
                                    : '--'}
                            </Descriptions.Item>
                            <Descriptions.Item label='Thời gian kết thúc'>
                                {selectedEvent.fullEndTime
                                    ? dayjs(selectedEvent.fullEndTime).format(
                                          'HH:mm - dddd, DD/MM/YYYY'
                                      )
                                    : '--'}
                            </Descriptions.Item>
                            <Descriptions.Item label='Người tạo'>
                                {selectedEvent.organizerName}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation='left'>
                            <FileTextOutlined /> Thông tin pháp lý
                        </Divider>
                        <Descriptions bordered column={2} size='small'>
                            <Descriptions.Item label='Số giấy phép'>
                                {selectedEvent.permitNumber || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label='Nơi cấp'>
                                {selectedEvent.permitIssuedBy || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label='Ngày cấp'>
                                {selectedEvent.permitIssuedAt
                                    ? dayjs(
                                          selectedEvent.permitIssuedAt
                                      ).format('DD/MM/YYYY')
                                    : 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation='left'>Mô tả sự kiện</Divider>
                        <div
                            style={{
                                padding: '10px',
                                background: '#f5f5f5',
                                borderRadius: '4px'
                            }}
                            dangerouslySetInnerHTML={{
                                __html:
                                    selectedEvent.description ||
                                    'Không có mô tả.'
                            }}
                        />

                        {selectedEvent.images &&
                            selectedEvent.images.length > 1 && (
                                <>
                                    <Divider orientation='left'>
                                        Hình ảnh khác
                                    </Divider>
                                    <Space wrap>
                                        {selectedEvent.images
                                            .filter(img => !img.isCover)
                                            .map((img, index) => (
                                                <Image
                                                    key={index}
                                                    width={120}
                                                    src={getEventImageUrl(
                                                        selectedEvent.id,
                                                        img.url
                                                    )}
                                                    style={{
                                                        borderRadius: '4px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ))}
                                    </Space>
                                </>
                            )}
                    </div>
                )}
            </Modal>

            <Modal
                title='Xác nhận từ chối sự kiện'
                open={isRejectModalOpen}
                onOk={handleRejectConfirm}
                onCancel={() => setIsRejectModalOpen(false)}
                okText='Từ chối'
                okButtonProps={{ danger: true }}
                cancelText='Hủy'
            >
                <p>
                    Bạn có chắc chắn muốn từ chối sự kiện này? Sự kiện sẽ được
                    chuyển vào mục <b>Từ chối</b>.
                </p>
            </Modal>
        </div>
    );
}

export default AdminEventManagement;
