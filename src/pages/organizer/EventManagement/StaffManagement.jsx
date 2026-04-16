import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Input, Button, message, Typography, Table, Popconfirm } from 'antd';
import {
    SearchOutlined,
    DeleteOutlined,
    UserAddOutlined
} from '@ant-design/icons';

import { callFetchAllUsers, callUpdateUser } from '@apis/userApi';
import {
    callGetStaffsByEventId,
    callAddStaffToEvent,
    callRemoveStaffFromEvent
} from '@apis/eventStaffApi';

import { ROLE_ID } from '@constants/roles';
import styles from './StaffManagement.module.scss';
import { isValidEmail } from '@utils/validation';

const { Text, Title } = Typography;

const StaffManagement = () => {
    const params = useParams();
    // Lấy id hoặc eventId tùy thuộc vào đường dẫn URL hiện tại
    const eventId = params.id || params.eventId;
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [fetching, setFetching] = useState(false);

    // 1. Lấy danh sách nhân viên ĐÃ ĐƯỢC GÁN vào sự kiện này
    const fetchEventStaffs = useCallback(async () => {
        setFetching(true);
        try {
            const res = await callGetStaffsByEventId(eventId);
            // Giả định backend trả về mảng trực tiếp hoặc nằm trong res.result
            const staffs = res?.result || res || [];

            // Map lại dữ liệu để lấy thông tin user hiển thị ra bảng
            const formattedList = staffs.map(item => ({
                eventStaffId: item.id,
                name: item.userName,
                email: item.userEmail
            }));

            setStaffList(formattedList);
        } catch (error) {
            message.error('Không thể tải danh sách nhân viên của sự kiện');
        } finally {
            setFetching(false);
        }
    }, [eventId]);

    useEffect(() => {
        if (eventId) {
            fetchEventStaffs();
        }
    }, [eventId, fetchEventStaffs]);

    // 2. Thêm Staff vào sự kiện
    const handleAddStaff = async () => {
        if (!email) return message.warning('Vui lòng nhập email');

        if (!isValidEmail(email)) {
            return message.error('Định dạng email không hợp lệ!');
        }

        setLoading(true);
        try {
            // Bước A: Tìm user theo email trên hệ thống
            const res = await callFetchAllUsers(`email=${email}`);
            const users = res?.result?.content || res?.result || res || [];
            const foundUser = users.find(u => u.email === email);

            if (!foundUser) {
                return message.error(
                    'Email này chưa đăng ký tài khoản trên hệ thống!'
                );
            }

            // (Tuỳ chọn) Nếu user chưa phải là STAFF, bạn có thể tự động cập nhật Role cho họ
            if (foundUser.role?.id !== ROLE_ID.STAFF) {
                await callUpdateUser({
                    ...foundUser,
                    role: { id: ROLE_ID.STAFF }
                });
            }

            // Kiểm tra xem nhân viên đã có trong sự kiện chưa
            const isAlreadyInEvent = staffList.some(
                staff => staff.email === email
            );
            if (isAlreadyInEvent) {
                return message.warning(
                    'Nhân viên này đã được phân công vào sự kiện!'
                );
            }

            // Bước B: Gọi API gán Staff vào Event
            // Tham số truyền vào phụ thuộc vào cấu trúc ReqEventStaffDTO ở BE
            const payload = {
                eventId: Number(eventId),
                userId: foundUser.id
            };

            await callAddStaffToEvent(payload);

            message.success('Đã thêm nhân viên vào sự kiện thành công!');
            setEmail('');
            fetchEventStaffs(); // Cập nhật lại danh sách
        } catch (error) {
            message.error('Không thể thêm nhân viên. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // 3. Xóa Staff khỏi sự kiện (chỉ xóa liên kết Event-Staff, không đổi role toàn hệ thống của họ)
    const handleRemoveStaff = async record => {
        try {
            // Sử dụng ID của bản ghi event_staff (được map là eventStaffId ở hàm fetch)
            await callRemoveStaffFromEvent(record.eventStaffId);
            message.success(`Đã xóa nhân viên ${record.email} khỏi sự kiện`);
            fetchEventStaffs();
        } catch (error) {
            message.error(
                'Lỗi khi thực hiện thao tác xóa nhân viên khỏi sự kiện.'
            );
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
                    title='Xóa khỏi sự kiện'
                    description={`Bạn có chắc muốn xóa ${record.email} khỏi sự kiện này?`}
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
                    rowKey='eventStaffId' // Dùng ID của bảng event_staff làm key
                    loading={fetching}
                    pagination={{ pageSize: 5 }}
                    className={styles.customTable}
                    locale={{
                        emptyText: 'Chưa có nhân viên nào trong sự kiện này'
                    }}
                />
            </div>
        </div>
    );
};

export default StaffManagement;
