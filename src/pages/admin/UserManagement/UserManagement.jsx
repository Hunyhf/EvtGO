import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Tag,
    Space,
    Button,
    Typography,
    Modal,
    Descriptions,
    Skeleton,
    Input,
    Select,
    App,
    Form,
    InputNumber,
    Radio
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    SearchOutlined,
    PlusOutlined
} from '@ant-design/icons';
import classNames from 'classnames/bind';
import debounce from 'lodash/debounce';

import styles from './UserManagement.module.scss';
import {
    callFetchAllUsers,
    callGetUserById,
    callCreateUser
} from '@apis/userApi';
import { ROLE_ID } from '@constants/roles';

const cx = classNames.bind(styles);
const { Title } = Typography;
const { Option } = Select;

const removeAccents = str => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

function UserManagementContent() {
    const { message, modal } = App.useApp();
    const [form] = Form.useForm();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // States cho Detail Modal
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // States cho Add Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addLoading, setAddLoading] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const fetchUsers = async (page, size, search = '', role = 'ALL') => {
        setLoading(true);
        try {
            let query = `page=${page}&size=${size}`;
            let filterParts = [];

            if (role !== 'ALL') {
                filterParts.push(`role.id : ${role}`);
            }

            if (search) {
                const searchVal = removeAccents(search);
                filterParts.push(
                    `(name ~ '${searchVal}' or email ~ '${searchVal}')`
                );
            }

            if (filterParts.length > 0) {
                query += `&filter=${encodeURIComponent(filterParts.join(' and '))}`;
            }

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

    const debounceSearch = useCallback(
        debounce((nextValue, currentRole) => {
            fetchUsers(1, pagination.pageSize, nextValue, currentRole);
        }, 500),
        [pagination.pageSize]
    );

    useEffect(() => {
        fetchUsers(
            pagination.current,
            pagination.pageSize,
            searchText,
            filterRole
        );
    }, []);

    const handleSearchChange = e => {
        const value = e.target.value;
        setSearchText(value);
        debounceSearch(value, filterRole);
    };

    const handleRoleChange = value => {
        setFilterRole(value);
        fetchUsers(1, pagination.pageSize, searchText, value);
    };

    const handleTableChange = newPagination => {
        fetchUsers(
            newPagination.current,
            newPagination.pageSize,
            searchText,
            filterRole
        );
    };

    // Xử lý Thêm Admin
    const handleAddAdmin = async values => {
        setAddLoading(true);
        try {
            const data = {
                ...values,
                role: { id: ROLE_ID.ADMIN } // Cố định role là Admin
            };
            const res = await callCreateUser(data);
            if (res) {
                message.success('Tạo tài khoản Admin thành công!');
                setIsAddModalOpen(false);
                form.resetFields();
                fetchUsers(1, pagination.pageSize, searchText, filterRole);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi tạo Admin');
        } finally {
            setAddLoading(false);
        }
    };

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

    const handleDelete = user => {
        modal.confirm({
            title: 'Xác nhận xóa người dùng?',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa ${user.name}?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                message.success('Tính năng xóa đang được đồng bộ...');
            }
        });
    };

    const renderRoleTag = roleId => {
        switch (roleId) {
            case ROLE_ID.ADMIN:
                return <Tag color='gold'>Quản trị viên</Tag>;
            case ROLE_ID.CUSTOMER:
                return <Tag color='cyan'>Khách hàng</Tag>;
            case ROLE_ID.ORGANIZER:
                return <Tag color='blue'>Nhà tổ chức</Tag>;
            case ROLE_ID.STAFF:
                return <Tag color='purple'>Nhân viên</Tag>;
            default:
                return <Tag>N/A</Tag>;
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
            render: text => <strong>{text}</strong>
        },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Vai trò',
            dataIndex: ['role', 'id'],
            key: 'role',
            render: (_, record) =>
                renderRoleTag(record.role?.id || record.roleId)
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space className={cx('action-btns')}>
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

                <Space size='middle'>
                    <Input
                        placeholder='Tìm tên hoặc email...'
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearchChange}
                        style={{ width: 250 }}
                        allowClear
                    />
                    <Select
                        defaultValue='ALL'
                        style={{ width: 160 }}
                        onChange={handleRoleChange}
                        value={filterRole}
                    >
                        <Option value='ALL'>Tất cả vai trò</Option>
                        <Option value={ROLE_ID.ADMIN}>Quản trị viên</Option>
                        <Option value={ROLE_ID.ORGANIZER}>Nhà tổ chức</Option>
                        <Option value={ROLE_ID.CUSTOMER}>Khách hàng</Option>
                    </Select>
                    <Button
                        type='primary'
                        icon={<PlusOutlined />}
                        className={cx('btn-primary')}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Thêm Admin
                    </Button>
                </Space>
            </div>

            <div className={cx('user-management__container')}>
                <Table
                    className={cx('user-management__table')}
                    columns={columns}
                    dataSource={users}
                    rowKey='id'
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showTotal: total => (
                            <span style={{ color: '#fff' }}>
                                Tổng cộng {total} người dùng
                            </span>
                        )
                    }}
                    onChange={handleTableChange}
                />
            </div>

            {/* Modal Thêm mới Admin */}
            <Modal
                title={
                    <span style={{ color: '#fff' }}>
                        Thêm mới Quản trị viên
                    </span>
                }
                open={isAddModalOpen}
                onCancel={() => {
                    setIsAddModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                confirmLoading={addLoading}
                okText='Lưu'
                cancelText='Hủy'
                width={600}
                className={cx('user-management__modal')}
            >
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={handleAddAdmin}
                    initialValues={{ gender: 'MALE', age: 18 }}
                >
                    <Form.Item
                        label={<span style={{ color: '#fff' }}>Họ và tên</span>}
                        name='name'
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ tên' }
                        ]}
                    >
                        <Input placeholder='Nhập tên đầy đủ' />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ color: '#fff' }}>Email</span>}
                        name='email'
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input placeholder='admin@example.com' />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ color: '#fff' }}>Mật khẩu</span>}
                        name='password'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu'
                            },
                            { min: 6, message: 'Tối thiểu 6 ký tự' }
                        ]}
                    >
                        <Input.Password placeholder='Nhập mật khẩu an toàn' />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <Form.Item
                            label={<span style={{ color: '#fff' }}>Tuổi</span>}
                            name='age'
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                min={1}
                                max={100}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span style={{ color: '#fff' }}>Giới tính</span>
                            }
                            name='gender'
                            style={{ flex: 1 }}
                        >
                            <Radio.Group>
                                <Radio value='MALE'>
                                    <span style={{ color: '#fff' }}>Nam</span>
                                </Radio>
                                <Radio value='FEMALE'>
                                    <span style={{ color: '#fff' }}>Nữ</span>
                                </Radio>
                            </Radio.Group>
                        </Form.Item>
                    </div>

                    <Form.Item
                        label={<span style={{ color: '#fff' }}>Địa chỉ</span>}
                        name='address'
                    >
                        <Input.TextArea
                            rows={2}
                            placeholder='Nhập địa chỉ cư trú'
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Chi tiết */}
            <Modal
                title={
                    <span style={{ color: '#fff' }}>Chi tiết người dùng</span>
                }
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                footer={[
                    <Button key='close' onClick={() => setIsDetailOpen(false)}>
                        Đóng
                    </Button>
                ]}
                width={700}
                className={cx('user-management__modal')}
            >
                <Skeleton loading={detailLoading} active>
                    {selectedUser && (
                        <Descriptions
                            bordered
                            column={1}
                            labelStyle={{
                                fontWeight: 'bold',
                                width: '150px',
                                color: '#fff'
                            }}
                            contentStyle={{ color: '#fff' }}
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
                            <Descriptions.Item label='Vai trò'>
                                {renderRoleTag(
                                    selectedUser.role?.id || selectedUser.roleId
                                )}
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
                                        : 'Nữ'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label='Địa chỉ'>
                                {selectedUser.address || 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                </Skeleton>
            </Modal>
        </div>
    );
}

function UserManagement() {
    return (
        <App>
            <UserManagementContent />
        </App>
    );
}

export default UserManagement;
