import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { callFetchAllEvents, callDeleteEvent } from '@apis/eventApi';
import styles from './EventManagement.module.scss';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Chạy fetchEvents một lần khi trang vừa load
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // Thay đổi: Sử dụng callFetchAllEvents()
            const response = await callFetchAllEvents();

            // Giả định backend Spring Boot trả về dữ liệu nằm trong biến 'content' của ResultPaginationDTO
            if (response && response.data && response.data.content) {
                setEvents(response.data.content);
            } else if (Array.isArray(response.data)) {
                setEvents(response.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sự kiện:', error);
            alert('Không thể tải danh sách sự kiện.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async id => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
            try {
                // Thay đổi: Sử dụng callDeleteEvent()
                await callDeleteEvent(id);
                alert('Xóa thành công!');
                fetchEvents(); // Gọi lại hàm lấy danh sách để làm mới bảng
            } catch (error) {
                console.error('Lỗi khi xóa:', error);
                alert('Xóa thất bại!');
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Quản lý sự kiện</h2>
                {/* Nút chuyển hướng sang trang tạo sự kiện */}
                <Link
                    to='/organizer/events/create'
                    className={styles.createBtn}
                >
                    + Thêm sự kiện
                </Link>
            </div>

            {loading ? (
                <p className={styles.loading}>Đang tải dữ liệu...</p>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên sự kiện</th>
                                <th>Địa điểm</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <tr key={event.id}>
                                    <td>{event.id}</td>
                                    <td>{event.name}</td>
                                    <td>{event.location}</td>
                                    <td>
                                        <span
                                            className={
                                                event.active
                                                    ? styles.statusActive
                                                    : styles.statusInactive
                                            }
                                        >
                                            {event.active
                                                ? 'Hoạt động'
                                                : 'Tạm dừng'}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <Link
                                            to={`/organizer/events/edit/${event.id}`}
                                            className={styles.editBtn}
                                        >
                                            Sửa
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(event.id)
                                            }
                                            className={styles.deleteBtn}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && (
                                <tr>
                                    <td colSpan='5' className={styles.empty}>
                                        Bạn chưa có sự kiện nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EventManagement;
