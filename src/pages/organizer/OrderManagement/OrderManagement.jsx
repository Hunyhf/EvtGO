import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Tag, Card, App, Input, Row, Col } from 'antd';
import dayjs from 'dayjs';
import orderApi from '@apis/orderApi';

const { Search } = Input;
const DEFAULT_PAGE_SIZE = 10;

const OrderManagement = () => {
    const { message } = App.useApp();
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('eventId'); // Lấy ID sự kiện từ URL

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0
    });

    // Cột hiển thị (được tối ưu với useMemo)
    const columns = useMemo(
        () => [
            {
                title: 'Mã đơn hàng',
                dataIndex: 'orderCode',
                key: 'orderCode',
                render: text => (
                    <span style={{ color: '#1890ff', fontWeight: 500 }}>
                        {text}
                    </span>
                )
            },
            {
                title: 'Ngày tạo',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: date =>
                    date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A'
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
                    return (
                        <Tag color={currentStatus.color}>
                            {currentStatus.text}
                        </Tag>
                    );
                }
            }
        ],
        []
    );

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

                let filterArray = [];

                // Lọc theo eventId gửi lên BE
                if (eventId) {
                    filterArray.push(`orderItems.ticket.event.id:${eventId}`);
                }

                if (search) {
                    filterArray.push(
                        `(orderCode~'*${search}*' or user.email~'*${search}*')`
                    );
                }

                if (filterArray.length > 0) {
                    params.append('filter', filterArray.join(' and '));
                }

                const response = await orderApi.getAllOrders(params.toString());
                const responseBody =
                    response?.data?.data || response?.data || response;

                let itemsArray =
                    responseBody?.result || responseBody?.content || [];
                const metaData = responseBody?.meta || {};

                // --- BƯỚC BẢO VỆ: Filter thủ công tại Frontend để đảm bảo 100% đúng sự kiện ---
                if (eventId) {
                    itemsArray = itemsArray.filter(order => {
                        const items = order.orderItems || order.items || [];
                        return items.some(
                            item => item.ticket?.event?.id === Number(eventId)
                        );
                    });
                }

                setOrders(itemsArray);
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize: metaData.pageSize || pageSize,
                    total: metaData.total || itemsArray.length
                }));
            } catch (error) {
                console.error('Lỗi khi fetch đơn hàng:', error);
                message.error('Không thể tải danh sách đơn hàng.');
            } finally {
                setLoading(false);
            }
        },
        [eventId, message]
    );

    useEffect(() => {
        fetchOrders(1, pagination.pageSize, searchText);
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
            title={eventId ? `Đơn hàng sự kiện: ${eventId}` : 'Tất cả đơn hàng'}
            variant='outlined'
        >
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
                columns={columns}
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
