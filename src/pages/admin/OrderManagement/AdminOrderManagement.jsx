import React, { useEffect, useState, useCallback } from 'react';
import {
    Table,
    Tag,
    Card,
    App,
    Input,
    Row,
    Col,
    Modal,
    Descriptions
} from 'antd';
import {
    ShoppingOutlined,
    MailOutlined,
    CalendarOutlined,
    DollarCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import orderApi from '@apis/orderApi';

const { Search } = Input;
const DEFAULT_PAGE_SIZE = 10;

const AdminOrderManagement = () => {
    const { message } = App.useApp();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Hàm lấy chi tiết đơn hàng khi click vào mã đơn
    const handleViewDetail = async orderId => {
        setModalLoading(true);
        setIsModalOpen(true);
        try {
            const res = await orderApi.getOrderById(orderId);
            setSelectedOrder(res?.data?.data || res?.data || res);
        } catch (error) {
            message.error('Không thể tải thông tin chi tiết đơn hàng.');
            setIsModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (text, record) => (
                <a
                    onClick={() => handleViewDetail(record.id)}
                    style={{ fontWeight: 600 }}
                >
                    {text}
                </a>
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
            title: 'Khách hàng (Email)',
            dataIndex: ['user', 'email'],
            key: 'customer',
            render: email => <span>{email || 'N/A'}</span>
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
                const config = statusConfig[status] || {
                    color: 'default',
                    text: status
                };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        }
    ];

    const fetchOrders = useCallback(
        async (page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '') => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    size: pageSize,
                    page: page - 1,
                    sort: 'createdAt,desc'
                });

                if (search) {
                    // Chỉ lọc theo mã đơn hoặc email khách hàng
                    const filter = `(orderCode~'*${search}*' or user.email~'*${search}*')`;
                    params.append('filter', filter);
                }

                const response = await orderApi.getAllOrders(params.toString());
                const responseBody =
                    response?.data?.data || response?.data || response;

                setOrders(responseBody?.result || responseBody?.content || []);
                setPagination({
                    current: page,
                    pageSize: responseBody?.meta?.pageSize || pageSize,
                    total: responseBody?.meta?.total || 0
                });
            } catch (error) {
                message.error('Lỗi khi tải danh sách đơn hàng.');
            } finally {
                setLoading(false);
            }
        },
        [message]
    );

    useEffect(() => {
        fetchOrders(pagination.current, pagination.pageSize, searchText);
    }, [pagination.current, pagination.pageSize, searchText, fetchOrders]);

    return (
        <Card
            title={
                <span>
                    <ShoppingOutlined /> Quản lý đơn hàng hệ thống
                </span>
            }
            variant='outlined'
        >
            <Row justify='end' style={{ marginBottom: 16 }}>
                <Col xs={24} md={10}>
                    <Search
                        placeholder='Tìm mã đơn hoặc email khách hàng...'
                        allowClear
                        enterButton='Tìm kiếm'
                        onSearch={val => {
                            setSearchText(val);
                            setPagination(p => ({ ...p, current: 1 }));
                        }}
                        loading={loading}
                    />
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={orders}
                rowKey='id'
                loading={loading}
                onChange={p =>
                    setPagination({
                        ...pagination,
                        current: p.current,
                        pageSize: p.pageSize
                    })
                }
                pagination={{ ...pagination, showSizeChanger: true }}
            />

            <Modal
                title={`Chi tiết đơn hàng: ${selectedOrder?.orderCode || ''}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={600}
                loading={modalLoading}
            >
                {selectedOrder && (
                    <>
                        <Descriptions
                            title='Thông tin đơn hàng'
                            bordered
                            column={1}
                            size='small'
                        >
                            <Descriptions.Item
                                label={
                                    <span>
                                        <MailOutlined /> Email khách hàng
                                    </span>
                                }
                            >
                                {selectedOrder.user?.email}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <span>
                                        <CalendarOutlined /> Ngày đặt hàng
                                    </span>
                                }
                            >
                                {dayjs(selectedOrder.createdAt).format(
                                    'DD/MM/YYYY HH:mm:ss'
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <span>
                                        <FileSearchOutlined /> Trạng thái
                                    </span>
                                }
                            >
                                <Tag color='blue'>
                                    {selectedOrder.orderStatus}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <span>
                                        <DollarCircleOutlined /> Tổng tiền thanh
                                        toán
                                    </span>
                                }
                            >
                                <b
                                    style={{
                                        color: '#f5222d',
                                        fontSize: '16px'
                                    }}
                                >
                                    {selectedOrder.totalAmount?.toLocaleString()}{' '}
                                    đ
                                </b>
                            </Descriptions.Item>
                        </Descriptions>

                        <div
                            style={{
                                marginTop: 24,
                                textAlign: 'center',
                                color: '#8c8c8c'
                            }}
                        >
                            <small>Đơn hàng ID: {selectedOrder.id}</small>
                        </div>
                    </>
                )}
            </Modal>
        </Card>
    );
};

export default AdminOrderManagement;
