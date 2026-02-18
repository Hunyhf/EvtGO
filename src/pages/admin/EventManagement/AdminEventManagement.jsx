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
// --- LƯU Ý: Import có dấu ngoặc nhọn {} do file api dùng named export ---
import { eventApi } from '@apis/eventApi';
import styles from './AdminEventManagement.module.scss';

const { Title } = Typography;
const { Option } = Select;

function AdminEventManagement() {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // State Modal Từ chối
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [currentEventId, setCurrentEventId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // === 1. FETCH DATA ===
    const fetchEvents = async () => {
        setLoading(true);
        try {
            // Truyền params để lấy list (ví dụ page 1, size 100)
            const params = {
                page: 0,
                size: 100
                // sort: 'createdAt,desc' // Nếu BE hỗ trợ sort
            };
            const res = await eventApi.getAll(params);

            // Log dữ liệu để xem cấu trúc BE trả về (quan trọng)
            console.log('API Response:', res);

            // Xử lý dữ liệu: Tùy BE trả về res.data hay res.data.content
            const events = res.content || res.data || [];
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

    // Xử lý Duyệt
    const handleApprove = async id => {
        try {
            await eventApi.approve(id);
            message.success('Đã duyệt sự kiện!');
            fetchEvents(); // Reload lại bảng
        } catch (error) {
            console.error(error);
            message.error('Lỗi khi duyệt sự kiện.');
        }
    };

    // Mở modal từ chối
    const openRejectModal = id => {
        setCurrentEventId(id);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    // Xử lý Từ chối (Submit)
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
    // (Lọc tạm thời ở FE, tốt nhất là gọi API filter nếu dữ liệu lớn)
    const filteredData = dataSource.filter(item => {
        // Giả sử status BE trả về là: "PENDING", "APPROVED", "REJECTED"
        const status = item.status ? item.status.toUpperCase() : '';

        const matchStatus = filterStatus === 'ALL' || status === filterStatus;
        // Kiểm tra tên sự kiện (item.name) và tên BTC (item.organizerName)
        // Hãy sửa 'name' và 'organizerName' đúng theo key mà API trả về
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
            dataIndex: 'name', // Check key API trả về (name hay eventName?)
            key: 'name',
            width: 300,
            render: (text, record) => {
                // Check key ảnh (imageUrl, coverImage...?)
                const imgUrl =
                    record.imageUrl || 'https://via.placeholder.com/150';
                return (
                    <div className={styles.eventInfo}>
                        <img
                            src={imgUrl}
                            alt='cover'
                            className={styles.thumbnail}
                        />
                        <div className={styles.name}>
                            <div style={{ fontWeight: 'bold' }}>{text}</div>
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
            dataIndex: 'organizerName', // Check key API
            key: 'organizer',
            render: text => text || 'Đang cập nhật'
        },
        {
            title: 'Thời gian',
            dataIndex: 'startTime', // Check key API (startTime, startDate...?)
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

                // Mapping màu sắc
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
                // Chỉ hiện nút duyệt nếu chưa duyệt (PENDING)
                // Bạn có thể sửa điều kiện này tùy logic
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
        <div className={styles.container}>
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
