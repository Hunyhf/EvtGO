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
    EnvironmentOutlined // <-- Đã bổ sung import này
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
    const [rejectReason, setRejectReason] = useState('');

    // === 1. FETCH DATA & MAPPING ===
    const fetchEvents = async () => {
        setLoading(true);
        try {
            // Gọi API lấy tất cả sự kiện (Giả sử BE trả về List ResEventDTO)
            const res = await eventApi.getAll();

            console.log('API Response:', res);

            // Xử lý lấy mảng dữ liệu gốc tùy theo cấu trúc trả về của axiosClient
            let rawEvents = [];
            if (res.result && Array.isArray(res.result)) {
                rawEvents = res.result;
            } else if (res.content && Array.isArray(res.content)) {
                rawEvents = res.content;
            } else if (Array.isArray(res)) {
                rawEvents = res;
            } else if (res.data && Array.isArray(res.data)) {
                rawEvents = res.data;
            }

            // --- QUAN TRỌNG: Map dữ liệu từ ResEventDTO sang cấu trúc hiển thị ---
            const mappedData = rawEvents.map(event => {
                // 1. Xử lý ảnh (Giống logic Organizer)
                const posterObj =
                    event.images?.find(img => img.isCover === true) ||
                    event.images?.[0];
                const posterUrl = posterObj?.url
                    ? `${BASE_URL_IMAGE}/${posterObj.url}`
                    : 'https://placehold.co/150x100?text=No+Image';

                // 2. Xử lý trạng thái dựa trên isPublished
                // BE trả về isPublished: true/false. Ta quy ước True = APPROVED, False = PENDING
                const status = event.isPublished ? 'APPROVED' : 'PENDING';

                // 3. Xử lý thời gian (Ghép Date và Time chuỗi từ BE)
                // ResEventDTO trả về: startDate (String), startTime (String)
                const fullStartTime = event.startDate
                    ? `${event.startDate} ${event.startTime || ''}`
                    : null;
                const fullEndTime = event.endDate
                    ? `${event.endDate} ${event.endTime || ''}`
                    : null;

                return {
                    ...event,
                    key: event.id, // Yêu cầu của Antd Table
                    posterUrl: posterUrl,
                    derivedStatus: status, // Dùng trường này để filter/hiển thị
                    fullStartTime: fullStartTime,
                    fullEndTime: fullEndTime,
                    organizerName: event.createdBy || 'N/A' // ResEventDTO có createdBy
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
            // Gọi API approve
            await eventApi.approve(id);
            message.success('Đã duyệt sự kiện thành công!');
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
        // Lọc theo Status (Dùng derivedStatus đã map ở trên)
        const matchStatus =
            filterStatus === 'ALL' || item.derivedStatus === filterStatus;

        // Lọc theo Search Text (Tên sự kiện hoặc BTC)
        const eventName = item.name || '';
        const organizer = item.organizerName || '';

        const matchSearch =
            eventName.toLowerCase().includes(searchText.toLowerCase()) ||
            organizer.toLowerCase().includes(searchText.toLowerCase());

        return matchStatus && matchSearch;
    });

    // === 4. COLUMNS ===
    const columns = [
        {
            title: 'Sự kiện',
            dataIndex: 'name', // Khớp với ResEventDTO.name
            key: 'name',
            width: 350,
            render: (text, record) => {
                return (
                    <div
                        className={styles.eventInfo}
                        style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
                        }}
                    >
                        <img
                            src={record.posterUrl}
                            alt='cover'
                            className={styles.thumbnail}
                            style={{
                                width: '80px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                            }}
                        />
                        <div className={styles.name}>
                            <div
                                style={{ fontWeight: 'bold', fontSize: '15px' }}
                            >
                                {text}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888' }}>
                                ID: {record.id}
                            </div>
                            <div style={{ fontSize: '12px', color: '#1677ff' }}>
                                <EnvironmentOutlined
                                    style={{ marginRight: 4 }}
                                />
                                {record.location}
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
            width: 150
        },
        {
            title: 'Thời gian tổ chức',
            key: 'time',
            width: 200,
            render: (_, record) => (
                <div style={{ fontSize: '13px' }}>
                    <div>
                        <span style={{ color: '#888' }}>Bắt đầu: </span>
                        {record.fullStartTime
                            ? dayjs(record.fullStartTime).format(
                                  'HH:mm DD/MM/YYYY'
                              )
                            : '--'}
                    </div>
                    <div>
                        <span style={{ color: '#888' }}>Kết thúc: </span>
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
            dataIndex: 'derivedStatus', // Sử dụng trường đã map
            key: 'status',
            width: 120,
            render: status => {
                let color = 'default';
                let text = 'Khác';

                if (status === 'APPROVED') {
                    color = 'success';
                    text = 'Đã duyệt';
                } else if (status === 'PENDING') {
                    color = 'warning';
                    text = 'Chờ duyệt';
                } else if (status === 'REJECTED') {
                    color = 'error';
                    text = 'Đã từ chối';
                }

                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                // Chỉ hiển thị nút duyệt nếu trạng thái là PENDING
                const isPending = record.derivedStatus === 'PENDING';

                return (
                    <Space size='small'>
                        <Tooltip title='Xem chi tiết'>
                            <Button
                                icon={<EyeOutlined />}
                                onClick={() =>
                                    message.info(
                                        `Xem chi tiết sự kiện ID: ${record.id}`
                                    )
                                }
                            />
                        </Tooltip>

                        {isPending && (
                            <>
                                <Popconfirm
                                    title='Duyệt sự kiện này?'
                                    description='Sự kiện sẽ được hiển thị công khai ngay lập tức.'
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
        <div className={styles.content}>
            <div className={styles.header}>
                <Title level={3} className={styles.title}>
                    Quản lý sự kiện
                </Title>
                <div
                    className={styles.actions}
                    style={{ display: 'flex', gap: 10 }}
                >
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
                    </Select>
                </div>
            </div>

            <div className={styles.tableContainer} style={{ marginTop: 20 }}>
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
                okText='Xác nhận từ chối'
                okButtonProps={{ danger: true }}
                cancelText='Hủy'
            >
                <p>Nhập lý do từ chối (bắt buộc):</p>
                <Input.TextArea
                    rows={4}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder='Ví dụ: Hình ảnh không phù hợp, nội dung vi phạm...'
                />
            </Modal>
        </div>
    );
}

export default AdminEventManagement;
