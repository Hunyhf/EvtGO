import React, { useState } from 'react';
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
import styles from './AdminEventManagement.module.scss';

const { Title } = Typography;
const { Option } = Select;

function AdminEventManagement() {
    // === 1. MOCK DATA (Dữ liệu giả lập) ===
    const initialData = [
        {
            id: 'EVT001',
            name: 'Đêm nhạc Mùa Thu Hà Nội',
            organizer: 'Công ty Giải trí A',
            location: 'Nhà hát lớn, Hà Nội',
            startDate: '2023-11-20 19:30',
            status: 'PENDING', // PENDING, APPROVED, REJECTED
            image: 'https://via.placeholder.com/150'
        },
        {
            id: 'EVT002',
            name: 'Triển lãm tranh Đương Đại',
            organizer: 'Studio Nghệ thuật B',
            location: 'Bảo tàng Mỹ thuật',
            startDate: '2023-12-05 09:00',
            status: 'APPROVED',
            image: 'https://via.placeholder.com/150'
        },
        {
            id: 'EVT003',
            name: 'Workshop Lập trình ReactJS',
            organizer: 'Tech Community',
            location: 'Online Zoom',
            startDate: '2023-10-15 14:00',
            status: 'REJECTED',
            image: 'https://via.placeholder.com/150'
        }
    ];

    const [dataSource, setDataSource] = useState(initialData);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // State cho Modal từ chối
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [currentEventId, setCurrentEventId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // === 2. XỬ LÝ LOGIC ===

    // Duyệt sự kiện
    const handleApprove = id => {
        const newData = dataSource.map(item =>
            item.id === id ? { ...item, status: 'APPROVED' } : item
        );
        setDataSource(newData);
        message.success('Đã duyệt sự kiện thành công!');
    };

    // Mở modal từ chối
    const openRejectModal = id => {
        setCurrentEventId(id);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    // Xác nhận từ chối
    const handleRejectConfirm = () => {
        if (!rejectReason.trim()) {
            message.warning('Vui lòng nhập lý do từ chối!');
            return;
        }

        const newData = dataSource.map(item =>
            item.id === currentEventId ? { ...item, status: 'REJECTED' } : item
        );
        setDataSource(newData);
        setIsRejectModalOpen(false);
        message.info('Đã từ chối sự kiện.');
    };

    // Lọc dữ liệu hiển thị
    const filteredData = dataSource.filter(item => {
        const matchStatus =
            filterStatus === 'ALL' || item.status === filterStatus;
        const matchSearch =
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.organizer.toLowerCase().includes(searchText.toLowerCase());
        return matchStatus && matchSearch;
    });

    // === 3. ĐỊNH NGHĨA CỘT (COLUMNS) ===
    const columns = [
        {
            title: 'Sự kiện',
            dataIndex: 'name',
            key: 'name',
            width: 300,
            render: (text, record) => (
                <div className={styles.eventInfo}>
                    <img
                        src={record.image}
                        alt='thumbnail'
                        className={styles.thumbnail}
                    />
                    <div className={styles.name}>
                        <div>{text}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                            ID: {record.id}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Ban tổ chức',
            dataIndex: 'organizer',
            key: 'organizer'
        },
        {
            title: 'Thời gian',
            dataIndex: 'startDate',
            key: 'startDate'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: status => {
                let color = 'default';
                let text = 'Không xác định';
                if (status === 'APPROVED') {
                    color = 'success';
                    text = 'Đã duyệt';
                }
                if (status === 'PENDING') {
                    color = 'processing';
                    text = 'Chờ duyệt';
                }
                if (status === 'REJECTED') {
                    color = 'error';
                    text = 'Từ chối';
                }

                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size='middle'>
                    <Tooltip title='Xem chi tiết'>
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() =>
                                message.info(`Xem chi tiết: ${record.name}`)
                            } // Sau này navigate tới trang detail
                        />
                    </Tooltip>

                    {/* Chỉ hiện nút Duyệt/Từ chối nếu trạng thái là PENDING */}
                    {record.status === 'PENDING' && (
                        <>
                            <Popconfirm
                                title='Duyệt sự kiện này?'
                                description='Sự kiện sẽ được hiển thị công khai.'
                                onConfirm={() => handleApprove(record.id)}
                                okText='Duyệt'
                                cancelText='Hủy'
                            >
                                <Button
                                    type='primary'
                                    icon={<CheckCircleOutlined />}
                                    ghost
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
            )
        }
    ];

    return (
        <div className={styles.container}>
            {/* Header & Filter */}
            <div className={styles.header}>
                <Title level={3} className={styles.title}>
                    Quản lý sự kiện
                </Title>

                <div className={styles.actions}>
                    <Input
                        placeholder='Tìm theo tên sự kiện, BTC...'
                        prefix={<SearchOutlined />}
                        style={{ width: 250 }}
                        onChange={e => setSearchText(e.target.value)}
                    />

                    <Select
                        defaultValue='ALL'
                        style={{ width: 150 }}
                        onChange={value => setFilterStatus(value)}
                    >
                        <Option value='ALL'>Tất cả trạng thái</Option>
                        <Option value='PENDING'>Chờ duyệt</Option>
                        <Option value='APPROVED'>Đã duyệt</Option>
                        <Option value='REJECTED'>Đã từ chối</Option>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey='id'
                    pagination={{ pageSize: 10 }}
                />
            </div>

            {/* Modal Từ chối */}
            <Modal
                title='Từ chối sự kiện'
                open={isRejectModalOpen}
                onOk={handleRejectConfirm}
                onCancel={() => setIsRejectModalOpen(false)}
                okText='Xác nhận từ chối'
                okButtonProps={{ danger: true }}
                cancelText='Hủy bỏ'
            >
                <p>
                    Vui lòng nhập lý do từ chối sự kiện này. Lý do sẽ được gửi
                    thông báo đến Ban tổ chức.
                </p>
                <Input.TextArea
                    rows={4}
                    placeholder='Nhập lý do (ví dụ: Nội dung không phù hợp, hình ảnh kém chất lượng...)'
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                />
            </Modal>
        </div>
    );
}

export default AdminEventManagement;
