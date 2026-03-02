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
    InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { eventApi } from '@apis/eventApi';
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
                const posterObj =
                    event.images?.find(img => img.isCover === true) ||
                    event.images?.[0];
                const posterUrl = getEventImageUrl(event.id, posterObj?.url);

                const isPublished = event.isPublished || event.published;
                const isActive = event.isActive || event.active;

                // Logic trạng thái
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

                // Xử lý thời gian bắt đầu và kết thúc
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
                    derivedStatus,
                    isPublished,
                    isActive,
                    fullStartTime,
                    fullEndTime,
                    organizerName: event.createdBy || 'N/A'
                };
            });

            // Sắp xếp sự kiện từ mới nhất đến cũ nhất dựa trên fullStartTime
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

    const handleViewDetail = record => {
        setSelectedEvent(record);
        setIsDetailModalOpen(true);
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
                        <span>Chi tiết sự kiện</span>
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
                    <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
                            />
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {selectedEvent.name}
                                </Title>
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
                        <Descriptions
                            title='Thông tin'
                            bordered
                            column={1}
                            size='small'
                        >
                            <Descriptions.Item label='Địa điểm'>
                                {selectedEvent.location}
                            </Descriptions.Item>
                            <Descriptions.Item label='Bắt đầu'>
                                {dayjs(selectedEvent.fullStartTime).format(
                                    'HH:mm DD/MM/YYYY'
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label='Kết thúc'>
                                {selectedEvent.fullEndTime
                                    ? dayjs(selectedEvent.fullEndTime).format(
                                          'HH:mm DD/MM/YYYY'
                                      )
                                    : '--'}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <div
                            dangerouslySetInnerHTML={{
                                __html:
                                    selectedEvent.description ||
                                    'Không có mô tả.'
                            }}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default AdminEventManagement;
