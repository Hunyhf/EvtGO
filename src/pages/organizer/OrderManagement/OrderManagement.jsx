import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Tag, Card, App, Input, Row, Col } from 'antd'; // Thêm Input, Row, Col để làm thanh tìm kiếm
import dayjs from 'dayjs';
import orderApi from '@apis/orderApi';

const { Search } = Input;
const DEFAULT_PAGE_SIZE = 10;

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
    const [searchText, setSearchText] = useState(''); // State lưu trữ từ khóa tìm kiếm

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0
    });

    /**
     * Hàm lấy danh sách đơn hàng
     * @param {number} page - Trang hiện tại (bắt đầu từ 1)
     * @param {number} pageSize - Số lượng item mỗi trang
     * @param {string} search - Từ khóa tìm kiếm
     */
    const fetchOrders = useCallback(
        async (page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '') => {
            setLoading(true);
            try {
                const pageForBE = page - 1;

                const params = new URLSearchParams({
                    size: pageSize,
                    page: pageForBE,
                    sort: 'createdAt,desc'
                });

                // Xây dựng chuỗi Filter
                let filterArray = [];

                // 1. Lọc theo eventId nếu có
                if (eventId) {
                    filterArray.push(`orderItems.ticket.event.id:${eventId}`);
                }

                // 2. Lọc theo từ khóa tìm kiếm (Mã đơn hàng hoặc Email)
                if (search) {
                    // Cú pháp: (field ~ '*value*' or field2 ~ '*value*')
                    filterArray.push(
                        `(orderCode~'*${search}*' or user.email~'*${search}*')`
                    );
                }

                // Kết hợp các điều kiện bằng 'and'
                if (filterArray.length > 0) {
                    params.append('filter', filterArray.join(' and '));
                }

                const response = await orderApi.getAllOrders(params.toString());
                const responseBody =
                    response?.data?.data || response?.data || response;

                const itemsArray =
                    responseBody?.result || responseBody?.content || [];
                const metaData = responseBody?.meta || {};

                if (Array.isArray(itemsArray)) {
                    setOrders(itemsArray);
                    setPagination({
                        current: page,
                        pageSize: metaData.pageSize || pageSize,
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

    // Gọi API lần đầu hoặc khi pageSize thay đổi
    useEffect(() => {
        fetchOrders(1, pagination.pageSize, searchText);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, pagination.pageSize]);

    const handleTableChange = newPagination => {
        fetchOrders(newPagination.current, newPagination.pageSize, searchText);
    };

    const onSearch = value => {
        setSearchText(value);
        fetchOrders(1, pagination.pageSize, value);
    };

    return (
        <Card
            title={eventId ? `Đơn hàng sự kiện ${eventId}` : 'Tất cả đơn hàng'}
            variant='outlined'
        >
            {/* Khu vực thanh tìm kiếm */}
            <Row justify='end' style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8}>
                    <Search
                        placeholder='Tìm mã đơn hoặc email khách...'
                        allowClear
                        enterButton='Tìm kiếm'
                        size='middle'
                        onSearch={onSearch}
                        loading={loading}
                    />
                </Col>
            </Row>

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
