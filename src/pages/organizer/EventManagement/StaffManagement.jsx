import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Input,
    Button,
    message,
    Typography,
    Table,
    Space,
    Popconfirm
} from 'antd';
import {
    SearchOutlined,
    DeleteOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { callFetchAllUsers, callUpdateUser } from '@apis/userApi';
import { ROLE_ID } from '@constants/roles';
import styles from './StaffManagement.module.scss';
import { isValidEmail } from '@utils/validation'; // Giả sử bạn có alias @utils
const { Text, Title } = Typography;

const StaffManagement = () => {
    const { id: eventId } = useParams();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [fetching, setFetching] = useState(false);

    // 1. Hàm lấy danh sách nhân viên (Role ID = 4)
    const fetchStaffMembers = useCallback(async () => {
        setFetching(true);
        try {
            // Lấy tất cả user và lọc những người có role STAFF
            const res = await callFetchAllUsers();
            const users = res?.result?.content || res?.result || res || [];

            // Lọc danh sách staff (role.id === 4)
            const list = users.filter(user => user.role?.id === ROLE_ID.STAFF);
            setStaffList(list);
        } catch (error) {
            message.error('Không thể tải danh sách nhân viên');
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        fetchStaffMembers();
    }, [fetchStaffMembers]);

    // 2. Thêm Staff mới
    const handleAddStaff = async () => {
        if (!email) return message.warning('Vui lòng nhập email');

        // Sử dụng hàm dùng chung
        if (!isValidEmail(email)) {
            return message.error('Định dạng email không hợp lệ!');
        }
        setLoading(true);
        try {
            const res = await callFetchAllUsers(`email=${email}`);
            const users = res?.result?.content || res?.result || res || [];
            const foundUser = users.find(u => u.email === email);

            if (!foundUser) {
                return message.error('Email này chưa đăng ký tài khoản!');
            }

            if (foundUser.role?.id === ROLE_ID.STAFF) {
                return message.warning('Người dùng này đã là nhân viên!');
            }

            // Cập nhật lên role STAFF (ID: 4)
            const updatedData = {
                ...foundUser,
                role: { id: ROLE_ID.STAFF }
            };
            await callUpdateUser(updatedData);

            message.success('Đã cấp quyền Staff thành công!');
            setEmail('');
            fetchStaffMembers(); // Refresh danh sách
        } catch (error) {
            message.error('Không thể thêm staff. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // 3. Xóa Staff (Chuyển về Customer - ID: 2)
    const handleRemoveStaff = async user => {
        try {
            const updatedData = {
                ...user,
                role: { id: ROLE_ID.CUSTOMER }
            };
            await callUpdateUser(updatedData);
            message.success(`Đã hủy quyền nhân viên của ${user.email}`);
            fetchStaffMembers();
        } catch (error) {
            message.error('Lỗi khi thực hiện thao tác xóa.');
        }
    };

    // 4. Lọc danh sách theo ô tìm kiếm
    const filteredStaff = staffList.filter(
        item =>
            item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.name?.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Họ và Tên',
            dataIndex: 'name',
            key: 'name',
            render: text => <strong>{text || 'N/A'}</strong>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Popconfirm
                    title='Hủy quyền nhân viên'
                    description={`Bạn có chắc muốn chuyển ${record.email} về người dùng thường?`}
                    onConfirm={() => handleRemoveStaff(record)}
                    okText='Đồng ý'
                    cancelText='Hủy'
                >
                    <Button
                        type='text'
                        danger
                        icon={<DeleteOutlined />}
                        title='Xóa nhân viên'
                    />
                </Popconfirm>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Title level={2}>Quản lý Nhân sự Sự kiện</Title>
                <Text className={styles.subtitle}>
                    Tìm kiếm và quản lý nhân viên hỗ trợ quét vé cho hệ thống.
                </Text>
            </div>

            {/* Khu vực thêm nhân viên */}
            <div className={styles.addSection}>
                <label className={styles.label}>
                    Thêm Staff mới (qua Email):
                </label>
                <div className={styles.inputGroup}>
                    <Input
                        placeholder='Nhập email nhân viên đã đăng ký...'
                        prefix={<UserAddOutlined />}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={styles.input}
                    />
                    <Button
                        type='primary'
                        onClick={handleAddStaff}
                        loading={loading}
                        className={styles.btnAdd}
                    >
                        Thêm Staff
                    </Button>
                </div>
            </div>

            {/* Danh sách và Tìm kiếm */}
            <div className={styles.listSection}>
                <div className={styles.listHeader}>
                    <Title level={4} style={{ margin: 0, color: '#fff' }}>
                        Danh sách Staff
                    </Title>
                    <Input
                        placeholder='Tìm theo tên hoặc email...'
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredStaff}
                    rowKey='id'
                    loading={fetching}
                    pagination={{ pageSize: 5 }}
                    className={styles.customTable}
                    locale={{ emptyText: 'Chưa có nhân viên nào' }}
                />
            </div>
        </div>
    );
};

export default StaffManagement;
