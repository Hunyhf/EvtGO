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
    SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { eventApi } from '@apis/eventApi';
// Import styles
import styles from './AdminEventManagement.module.scss';

const { Title } = Typography;
const { Option } = Select;

function AdminEventManagement() {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [currentEventId, setCurrentEventId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // === 1. FETCH DATA ===
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = {
                page: 1, // API của bạn trả về page: 1, có thể start từ 1
                size: 100
            };
            const res = await eventApi.getAll(params);

            console.log('API Response:', res);

            // --- SỬA TẠI ĐÂY: Lấy dữ liệu từ res.result ---
            let events = [];
            if (res.result && Array.isArray(res.result)) {
                events = res.result; // Cấu trúc Backend của bạn
            } else if (Array.isArray(res)) {
                events = res;
            } else if (res.content && Array.isArray(res.content)) {
                events = res.content;
            } else if (res.data && Array.isArray(res.data)) {
                events = res.data;
            }

            setDataSource(events);
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
            message.success('Đã duyệt sự kiện!');
            fetchEvents();
        } catch (error) {
            console.error(error);
            message.error('Lỗi khi duyệt sự kiện.');
        }
    };

    const openRejectModal = id => {
        setCurrentEventId(id);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (!rejectReason.trim()) {
            message.warning('Vui lòng nhập lý do!');
            return;
        }
        try {
            await eventApi.reject(currentEventId, rejectReason);
            message.info('Đã từ chối sự kiện.');
            setIsRejectModalOpen(false);
            fetchEvents();
        } catch (error) {
            console.error(error);
            message.error('Lỗi khi từ chối sự kiện.');
        }
    };

    // === 3. FILTER CLIENT-SIDE ===
    const filteredData = dataSource.filter(item => {
        const status = item.status ? item.status.toUpperCase() : '';
        const matchStatus = filterStatus === 'ALL' || status === filterStatus;

        // Kiểm tra an toàn null cho các trường
        const eventName = item.eventName || item.name || '';
        const organizerName = item.organizerName || '';

        const matchSearch =
            eventName.toLowerCase().includes(searchText.toLowerCase()) ||
            organizerName.toLowerCase().includes(searchText.toLowerCase());

        return matchStatus && matchSearch;
    });

    // === 4. COLUMNS ===
    const columns = [
        {
            title: 'Sự kiện',
            dataIndex: 'eventName',
            key: 'eventName',
            width: 300,
            render: (text, record) => {
                // Xử lý ảnh
                let imgUrl = 'https://via.placeholder.com/150';
                if (record.eventImages && record.eventImages.length > 0) {
                    imgUrl = record.eventImages[0].imageUrl;
                } else if (record.imageUrl) {
                    imgUrl = record.imageUrl;
                }

                return (
                    <div className={styles.eventInfo}>
                        <img
                            src={imgUrl}
                            alt='cover'
                            className={styles.thumbnail}
                        />
                        <div className={styles.name}>
                            <div style={{ fontWeight: 'bold' }}>
                                {text || record.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888' }}>
                                ID: {record.id}
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Ban tổ chức',
            dataIndex: 'organizerName',
            key: 'organizer',
            render: text => text || 'Đang cập nhật'
        },
        {
            title: 'Thời gian',
            dataIndex: 'startTime',
            key: 'startTime',
            render: date =>
                date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '--'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: status => {
                let color = 'default';
                let text = 'Khác';
                const s = status ? status.toUpperCase() : '';

                if (s === 'PUBLISHED' || s === 'APPROVED' || s === 'ACTIVE') {
                    color = 'success';
                    text = 'Đã duyệt';
                }
                if (s === 'PENDING' || s === 'WAITING') {
                    color = 'warning';
                    text = 'Chờ duyệt';
                }
                if (s === 'REJECTED' || s === 'CANCELLED') {
                    color = 'error';
                    text = 'Từ chối';
                }

                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                const s = record.status ? record.status.toUpperCase() : '';
                const isPending = s === 'PENDING' || s === 'WAITING';

                return (
                    <Space size='small'>
                        <Tooltip title='Xem chi tiết'>
                            <Button
                                icon={<EyeOutlined />}
                                onClick={() =>
                                    message.info('Tính năng đang phát triển')
                                }
                            />
                        </Tooltip>

                        {isPending && (
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
                                    onClick={() => openRejectModal(record.id)}
                                >
                                    Từ chối
                                </Button>
                            </>
                        )}
                    </Space>
                );
            }
        }
    ];

    return (
        // SỬA TẠI ĐÂY: Đổi styles.container thành styles.content theo yêu cầu
        <div className={styles.content}>
            <div className={styles.header}>
                <Title level={3} className={styles.title}>
                    Quản lý sự kiện
                </Title>
                <div className={styles.actions}>
                    <Input
                        placeholder='Tìm tên sự kiện, BTC...'
                        prefix={<SearchOutlined />}
                        style={{ width: 250 }}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Select
                        defaultValue='ALL'
                        style={{ width: 150 }}
                        onChange={value => setFilterStatus(value)}
                    >
                        <Option value='ALL'>Tất cả</Option>
                        <Option value='PENDING'>Chờ duyệt</Option>
                        <Option value='APPROVED'>Đã duyệt</Option>
                        <Option value='REJECTED'>Đã từ chối</Option>
                    </Select>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey='id'
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </div>

            <Modal
                title='Từ chối sự kiện'
                open={isRejectModalOpen}
                onOk={handleRejectConfirm}
                onCancel={() => setIsRejectModalOpen(false)}
                okText='Xác nhận'
                okButtonProps={{ danger: true }}
                cancelText='Hủy'
            >
                <p>Nhập lý do từ chối (bắt buộc):</p>
                <Input.TextArea
                    rows={4}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder='Ví dụ: Hình ảnh không phù hợp...'
                />
            </Modal>
        </div>
    );
}

export default AdminEventManagement;
