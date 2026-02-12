import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Space,
    Button,
    Typography,
    message,
    Modal,
    Descriptions,
    Skeleton
} from 'antd';
import {
    UserAddOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined, // Import icon xem chi tiết
    ExclamationCircleOutlined
} from '@ant-design/icons';
import classNames from 'classnames/bind';

import styles from './UserManagement.module.scss';
import { callFetchAllUsers, callGetUserById } from '@apis/userApi'; // Import thêm hàm lấy chi tiết

const cx = classNames.bind(styles);
const { Title } = Typography;
const { confirm } = Modal;

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // State cho Modal chi tiết
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        fetchUsers(pagination.current, pagination.pageSize);
    }, []);

    const fetchUsers = async (page, size) => {
        setLoading(true);
        try {
            const query = `page=${page}&size=${size}`;
            const res = await callFetchAllUsers(query);

            if (res && res.result) {
                setUsers(res.result);
                setPagination({
                    current: page,
                    pageSize: size,
                    total: res.meta.total
                });
            }
        } catch (error) {
            message.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý xem chi tiết
    const handleViewDetail = async id => {
        setIsDetailOpen(true);
        setDetailLoading(true);
        try {
            const res = await callGetUserById(id);
            setSelectedUser(res?.data || res);
        } catch (error) {
            message.error('Không thể lấy thông tin chi tiết người dùng');
            setIsDetailOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleTableChange = newPagination => {
        fetchUsers(newPagination.current, newPagination.pageSize);
    };

    const handleDelete = user => {
        confirm({
            title: 'Xác nhận xóa người dùng?',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa ${user.name}?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                message.success('Đã xóa thành công!');
            }
        });
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
            render: text => <strong style={{ color: '#393f4e' }}>{text}</strong>
        },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space className={cx('action-btns')}>
                    {/* Nút Xem Chi Tiết */}
                    <Button
                        type='text'
                        icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                        onClick={() => handleViewDetail(record.id)}
                    />
                    <Button
                        type='text'
                        icon={<EditOutlined style={{ color: '#2dc275' }} />}
                        onClick={() =>
                            message.info('Tính năng đang phát triển')
                        }
                    />
                    <Button
                        type='text'
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            )
        }
    ];

    return (
        <div className={cx('user-management')}>
            <div className={cx('user-management__header')}>
                <Title level={3} className={cx('user-management__title')}>
                    Quản lý người dùng
                </Title>
            </div>

            <div className={cx('user-management__container')}>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey='id'
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showTotal: total => `Tổng cộng ${total} người dùng`
                    }}
                    onChange={handleTableChange}
                />
            </div>

            {/* Modal hiển thị chi tiết người dùng */}
            <Modal
                title='Chi tiết người dùng'
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                footer={[
                    <Button key='close' onClick={() => setIsDetailOpen(false)}>
                        Đóng
                    </Button>
                ]}
                width={700}
            >
                <Skeleton loading={detailLoading} active>
                    {selectedUser && (
                        <Descriptions
                            bordered
                            column={1}
                            labelStyle={{ fontWeight: 'bold', width: '150px' }}
                        >
                            <Descriptions.Item label='ID'>
                                {selectedUser.id}
                            </Descriptions.Item>
                            <Descriptions.Item label='Họ và tên'>
                                {selectedUser.name}
                            </Descriptions.Item>
                            <Descriptions.Item label='Email'>
                                {selectedUser.email}
                            </Descriptions.Item>
                            <Descriptions.Item label='Số điện thoại'>
                                {selectedUser.phone || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label='Tuổi'>
                                {selectedUser.age || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label='Giới tính'>
                                <Tag
                                    color={
                                        selectedUser.gender === 'MALE'
                                            ? 'blue'
                                            : 'magenta'
                                    }
                                >
                                    {selectedUser.gender === 'MALE'
                                        ? 'Nam'
                                        : selectedUser.gender === 'FEMALE'
                                          ? 'Nữ'
                                          : 'Khác'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label='Địa chỉ'>
                                {selectedUser.address || 'Chưa cập nhật'}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                </Skeleton>
            </Modal>
        </div>
    );
}

export default UserManagement;
