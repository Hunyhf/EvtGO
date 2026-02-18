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
    message,
    Typography,
    Popconfirm
} from 'antd';
import {
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { eventApi } from '@apis/eventApi';
// Import styles
import styles from './AdminEventManagement.module.scss';

const { Title } = Typography;
const { Option } = Select;

// Định nghĩa URL ảnh giống bên Organizer
const BASE_URL_IMAGE = 'http://localhost:8080/api/v1/files';

function AdminEventManagement() {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [currentEventId, setCurrentEventId] = useState(null);

    // === 1. FETCH DATA & MAPPING ===
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await eventApi.getAll();

            // Xử lý lấy mảng dữ liệu từ ResEventDTO
            let rawEvents =
                res?.result ||
                res?.content ||
                res?.data ||
                (Array.isArray(res) ? res : []);

            const now = dayjs();

            const mappedData = rawEvents.map(event => {
                // Xử lý ảnh bìa
                const posterObj =
                    event.images?.find(img => img.isCover === true) ||
                    event.images?.[0];
                const posterUrl = posterObj?.url
                    ? `${BASE_URL_IMAGE}/${posterObj.url}`
                    : 'https://placehold.co/150x100?text=No+Image';

                // Ghép Date và Time chuỗi từ BE để so sánh chính xác
                const fullStartTimeStr = event.startDate
                    ? `${event.startDate} ${event.startTime || '00:00:00'}`
                    : null;
                const fullEndTimeStr = event.endDate
                    ? `${event.endDate} ${event.endTime || '23:59:59'}`
                    : null;

                const eventStartTime = fullStartTimeStr
                    ? dayjs(fullStartTimeStr)
                    : null;

                // --- LOGIC TRẠNG THÁI ---
                // Sử dụng isPublished thay vì published để đồng bộ với Organizer
                let derivedStatus = 'PENDING';

                if (eventStartTime && eventStartTime.isBefore(now)) {
                    derivedStatus = 'PAST'; // Đã qua giờ tổ chức
                } else if (event.isPublished || event.published) {
                    derivedStatus = 'UPCOMING'; // Đã duyệt và chưa đến giờ
                } else {
                    derivedStatus = 'PENDING'; // Chưa duyệt và chưa đến giờ
                }

                return {
                    ...event,
                    key: event.id,
                    posterUrl: posterUrl,
                    derivedStatus: derivedStatus,
                    fullStartTime: fullStartTimeStr,
                    fullEndTime: fullEndTimeStr,
                    organizerName: event.createdBy || 'N/A'
                };
            });

            setDataSource(mappedData);
        } catch (error) {
            console.error('Lỗi tải sự kiện:', error);
            message.error('Không thể tải danh sách sự kiện.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // === 2. ACTIONS ===
    const handleApprove = async id => {
        try {
            await eventApi.approve(id);
            message.success('Đã duyệt sự kiện thành công!');
            fetchEvents();
        } catch (error) {
            // Hiển thị lỗi từ Backend nếu sự kiện đã qua thời gian bắt đầu
            message.error(
                error.response?.data?.message || 'Lỗi khi duyệt sự kiện.'
            );
        }
    };

    const handleRejectConfirm = async () => {
        try {
            await eventApi.reject(currentEventId);
            message.success('Đã xóa (từ chối) sự kiện.');
            setIsRejectModalOpen(false);
            fetchEvents();
        } catch (error) {
            message.error('Lỗi khi từ chối sự kiện.');
        }
    };

    // === 3. FILTER CLIENT-SIDE ===
    const filteredData = dataSource.filter(item => {
        const matchStatus =
            filterStatus === 'ALL' || item.derivedStatus === filterStatus;
        const matchSearch =
            (item.name || '')
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
            (item.organizerName || '')
                .toLowerCase()
                .includes(searchText.toLowerCase());
        return matchStatus && matchSearch;
    });

    // === 4. COLUMNS ===
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
                        gap: '12px',
                        alignItems: 'center'
                    }}
                >
                    <img
                        src={record.posterUrl}
                        alt='cover'
                        style={{
                            width: '80px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                            {text}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                            ID: {record.id}
                        </div>
                        <div style={{ fontSize: '12px', color: '#1677ff' }}>
                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                            {record.location}
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
            title: 'Thời gian tổ chức',
            key: 'time',
            width: 200,
            render: (_, record) => (
                <div style={{ fontSize: '12px' }}>
                    <div>
                        <ClockCircleOutlined
                            style={{ marginRight: 5, color: '#888' }}
                        />
                        {record.fullStartTime
                            ? dayjs(record.fullStartTime).format(
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
            width: 120,
            render: status => {
                const statusConfig = {
                    PENDING: { color: 'warning', text: 'Chờ duyệt' },
                    UPCOMING: { color: 'processing', text: 'Sắp tới' },
                    PAST: { color: 'default', text: 'Đã qua' }
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
            render: (_, record) => {
                // Hiển thị nút nếu sự kiện chưa được duyệt
                const isNotPublished = !(
                    record.isPublished || record.published
                );

                return (
                    <Space size='small'>
                        <Tooltip title='Xem chi tiết'>
                            <Button
                                icon={<EyeOutlined />}
                                onClick={() =>
                                    message.info(`Sự kiện: ${record.name}`)
                                }
                            />
                        </Tooltip>

                        {isNotPublished && (
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

                        {/* Cảnh báo thêm nếu sự kiện đã quá hạn nhưng chưa duyệt */}
                        {record.derivedStatus === 'PAST' && isNotPublished && (
                            <Tag color='error' style={{ marginLeft: 8 }}>
                                Quá hạn
                            </Tag>
                        )}
                    </Space>
                );
            }
        }
    ];

    return (
        <div className={styles.content}>
            <div className={styles.header}>
                <Title level={3}>Quản lý sự kiện</Title>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Input
                        placeholder='Tìm tên sự kiện, BTC...'
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
                        <Option value='UPCOMING'>Sắp tới</Option>
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
                title='Xác nhận từ chối sự kiện'
                open={isRejectModalOpen}
                onOk={handleRejectConfirm}
                onCancel={() => setIsRejectModalOpen(false)}
                okText='Xóa sự kiện'
                okButtonProps={{ danger: true }}
                cancelText='Hủy'
            >
                <p>
                    Bạn có chắc chắn muốn từ chối sự kiện này? Hành động này sẽ{' '}
                    <b>xóa vĩnh viễn</b> sự kiện khỏi hệ thống.
                </p>
            </Modal>
        </div>
    );
}

export default AdminEventManagement;
