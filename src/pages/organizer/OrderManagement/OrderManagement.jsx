import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Tag, Card, App } from 'antd';
import dayjs from 'dayjs';
import orderApi from '@apis/orderApi';

const DEFAULT_PAGE_SIZE = 10;

// Đưa baseColumns ra ngoài hoặc vào trong đều được, nhưng cần sửa lại logic đếm vé
const baseColumns = [
    {
        title: 'Mã đơn hàng',
        dataIndex: 'orderCode',
        key: 'orderCode',
        render: text => (
            <span style={{ color: '#1890ff', fontWeight: 500 }}>{text}</span>
        )
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: date => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A')
    },
    {
        title: 'Người mua',
        dataIndex: 'user',
        key: 'user',
        render: user => user?.email || 'N/A'
    },
    {
        title: 'Số lượng',
        key: 'totalQuantity',
        render: (_, record) => {
            // FIX LỖI 3: Fallback an toàn cho cả `orderItems` và `items`
            const itemsList = record.orderItems || record.items || [];
            const total = itemsList.reduce(
                (acc, item) => acc + (item.quantity || 1),
                0
            );
            return <span>{total} vé</span>;
        }
    },
    {
        title: 'Tổng tiền',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: price => <b>{price?.toLocaleString('vi-VN')} đ</b>
    },
    {
        title: 'Trạng thái',
        dataIndex: 'orderStatus',
        key: 'orderStatus',
        render: status => {
            const statusConfig = {
                PAID: { color: 'green', text: 'Đã thanh toán' },
                PENDING: { color: 'gold', text: 'Chờ thanh toán' },
                CANCELLED: { color: 'red', text: 'Đã hủy' },
                REFUNDED: { color: 'blue', text: 'Hoàn tiền' }
            };

            const currentStatus = statusConfig[status] || {
                color: 'default',
                text: status
            };
            return <Tag color={currentStatus.color}>{currentStatus.text}</Tag>;
        }
    }
];

const OrderManagement = () => {
    const { message } = App.useApp();
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('eventId');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0
    });

    // BỌC USECALLBACK CHO HÀM CALL API
    const fetchOrders = useCallback(
        async (page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
            setLoading(true);
            try {
                const pageForBE = page - 1;

                // FIX LỖI 2: Sử dụng URLSearchParams để build query an toàn
                const params = new URLSearchParams({
                    size: pageSize,
                    page: pageForBE,
                    sort: 'createdAt,desc'
                });

                // SỬ DỤNG SPRING FILTER SYNTAX - Đã đổi `orderItems` thành `items`
                if (eventId) {
                    params.append('filter', `items.ticket.event.id:${eventId}`);
                }

                const response = await orderApi.getAllOrders(params.toString());

                // FIX LỖI 1: Trích xuất response an toàn (hỗ trợ nhiều cấp bọc trả về do class RestResponse)
                const responseBody =
                    response?.data?.data || response?.data || response;

                // Lấy mảng dữ liệu và metadata
                const itemsArray =
                    responseBody?.result || responseBody?.content || [];
                const metaData = responseBody?.meta || {};

                if (Array.isArray(itemsArray)) {
                    setOrders(itemsArray);
                    setPagination({
                        current: page,
                        pageSize: metaData.pageSize || DEFAULT_PAGE_SIZE,
                        total: metaData.total || 0
                    });
                } else {
                    setOrders([]);
                    setPagination(prev => ({ ...prev, total: 0 }));
                }
            } catch (error) {
                console.error('Lỗi khi fetch đơn hàng:', error);
                message.error(
                    'Không thể tải danh sách đơn hàng. Vui lòng thử lại.'
                );
            } finally {
                setLoading(false);
            }
        },
        [eventId, message]
    );

    useEffect(() => {
        fetchOrders(1, pagination.pageSize);
    }, [fetchOrders, pagination.pageSize]);

    const handleTableChange = newPagination => {
        fetchOrders(newPagination.current, newPagination.pageSize);
    };

    return (
        <Card
            title={eventId ? `Đơn hàng sự kiện #${eventId}` : 'Tất cả đơn hàng'}
            variant='outlined'
        >
            <Table
                columns={baseColumns}
                dataSource={orders}
                rowKey='id'
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: total => `Tổng cộng ${total} đơn hàng`
                }}
                onChange={handleTableChange}
            />
        </Card>
    );
};

export default OrderManagement;
