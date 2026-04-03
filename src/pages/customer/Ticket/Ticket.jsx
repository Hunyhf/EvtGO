// src/pages/customer/Ticket/Ticket.jsx

import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Pagination, Modal, Tag } from 'antd'; // Thêm Tag từ antd
import dayjs from 'dayjs';
import classNames from 'classnames/bind';

import orderApi from '@apis/orderApi';
import { getEventImageUrl } from '@utils/imageHelper';
import useModal from '@hooks/useModal';
import styles from './Ticket.module.scss';

const cx = classNames.bind(styles);

function Ticket() {
    const [orders, setOrders] = useState([]); // Danh sách đơn hàng
    const [groupedTickets, setGroupedTickets] = useState({}); // Vé được nhóm theo orderId
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); // Đơn hàng đang xem chi tiết
    const [selectedTicketQr, setSelectedTicketQr] = useState(null); // Vé đang xem QR phóng to

    // Modal hiển thị danh sách vé trong 1 đơn hàng
    const {
        isOpen: isOrderModalOpen,
        open: openOrderModal,
        close: closeOrderModal
    } = useModal();

    // Modal phóng to QR (như cũ)
    const {
        isOpen: isQrModalOpen,
        open: openQrModal,
        close: closeQrModal
    } = useModal();

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Lấy danh sách đơn hàng (History)
                const orderRes = await orderApi.getAllOrders('');
                const orderData = orderRes?.result || [];

                // 2. Lấy toàn bộ vé lẻ của user
                const ticketRes = await orderApi.getMyTickets();
                const ticketData = Array.isArray(ticketRes)
                    ? ticketRes
                    : ticketRes?.result || [];

                // 3. Logic nhóm vé theo orderId
                const groups = ticketData.reduce((acc, ticket) => {
                    const oId = ticket.orderId;
                    if (!acc[oId]) acc[oId] = [];
                    acc[oId].push(ticket);
                    return acc;
                }, {});

                // Sắp xếp đơn hàng mới nhất lên đầu
                orderData.sort(
                    (a, b) =>
                        dayjs(b.createdAt).valueOf() -
                        dayjs(a.createdAt).valueOf()
                );

                setOrders(orderData);
                setGroupedTickets(groups);
            } catch (error) {
                console.error('Lỗi tải lịch sử mua hàng:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Xử lý khi nhấn vào 1 đơn hàng
    const handleOrderClick = order => {
        setSelectedOrder(order);
        openOrderModal();
    };

    // Xử lý khi nhấn vào 1 vé trong đơn hàng (để xem QR)
    const handleTicketClick = ticket => {
        setSelectedTicketQr(ticket);
        openQrModal();
    };

    if (loading)
        return (
            <div className={cx('loading')}>Đang tải lịch sử mua hàng...</div>
        );

    return (
        <div className={cx('container')}>
            <h1 className={cx('pageTitle')}>Lịch sử mua vé</h1>

            {/* DANH SÁCH ĐƠN HÀNG */}
            <div className={cx('orderList')}>
                {orders.length > 0 ? (
                    orders.map(order => {
                        // Lấy thông tin từ vé đầu tiên của đơn hàng này để hiển thị ảnh/tên sự kiện
                        const firstTicket = groupedTickets[order.id]?.[0];
                        const eventName =
                            firstTicket?.event?.name ||
                            'Sự kiện không xác định';
                        const imageUrl = firstTicket?.event?.image
                            ? getEventImageUrl(
                                  firstTicket.event.id,
                                  firstTicket.event.image
                              )
                            : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30';

                        return (
                            <div
                                key={order.id}
                                className={cx('orderCard')}
                                onClick={() => handleOrderClick(order)}
                            >
                                <div className={cx('orderCardBody')}>
                                    <div className={cx('eventThumbnail')}>
                                        <img src={imageUrl} alt={eventName} />
                                    </div>

                                    <div className={cx('orderDetails')}>
                                        <div className={cx('orderHeader')}>
                                            <h2
                                                className={cx(
                                                    'eventNameDisplay'
                                                )}
                                            >
                                                {eventName}
                                            </h2>
                                            <span className={cx('orderCode')}>
                                                Mã đơn: {order.orderCode}
                                            </span>
                                        </div>

                                        <div className={cx('orderMeta')}>
                                            <p>
                                                Ngày mua:{' '}
                                                {dayjs(order.createdAt).format(
                                                    'HH:mm DD/MM/YYYY'
                                                )}
                                            </p>
                                            <p>
                                                Số lượng:{' '}
                                                <strong>
                                                    {groupedTickets[order.id]
                                                        ?.length || 0}{' '}
                                                    vé
                                                </strong>
                                            </p>
                                            <p className={cx('totalAmount')}>
                                                Tổng tiền:{' '}
                                                {order.totalAmount?.toLocaleString(
                                                    'vi-VN'
                                                )}{' '}
                                                VNĐ
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className={cx('noData')}>
                        Bạn chưa có giao dịch nào.
                    </div>
                )}
            </div>
            {/* MODAL CHI TIẾT ĐƠN HÀNG (Hiển thị các vé như giao diện cũ) */}
            <Modal
                title={`Chi tiết đơn hàng: ${selectedOrder?.orderCode}`}
                open={isOrderModalOpen}
                onCancel={closeOrderModal}
                footer={null}
                width={850}
                centered
            >
                <div className={cx('ticketListInModal')}>
                    {groupedTickets[selectedOrder?.id]?.map(item => {
                        const imageUrl = item.event?.image
                            ? getEventImageUrl(item.event.id, item.event.image)
                            : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30';

                        return (
                            <div
                                key={item.id}
                                className={cx('ticketRow')}
                                onClick={() => handleTicketClick(item)}
                            >
                                <div className={cx('leftSection')}>
                                    <img
                                        src={imageUrl}
                                        alt={item.event?.name}
                                    />
                                </div>
                                <div className={cx('middleSection')}>
                                    <h2 className={cx('eventName')}>
                                        {item.event?.name}
                                    </h2>
                                    <div className={cx('infoGrid')}>
                                        <p>
                                            <strong>Địa điểm:</strong>{' '}
                                            {item.event?.location}
                                        </p>
                                        <p>
                                            <strong>Thời gian:</strong>{' '}
                                            {dayjs(
                                                item.event?.startTime
                                            ).format('HH:mm DD/MM/YYYY')}
                                        </p>
                                        <p>
                                            <strong>Loại vé:</strong>{' '}
                                            {item.ticket?.ticketType}
                                        </p>
                                        {/* HIỂN THỊ TÊN KHU VỰC VÀ MÃ VÉ THEO YÊU CẦU */}
                                        <p>
                                            <strong>Khu vực:</strong>{' '}
                                            {item.zone}
                                        </p>
                                        <p>
                                            <strong>Vị trí:</strong>{' '}
                                            {item.seatLabel}
                                        </p>
                                        <p>
                                            <strong>Mã vé:</strong> #{item.id}
                                        </p>
                                    </div>
                                </div>
                                <div className={cx('rightSection')}>
                                    <div className={cx('qrContainer')}>
                                        <QRCodeCanvas
                                            value={item.qrCode || 'NO-CODE'}
                                            size={80}
                                            level={'H'}
                                        />
                                    </div>
                                    <p className={cx('qrCodeText')}>
                                        #
                                        {item.qrCode
                                            ?.split('-')[0]
                                            .toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Modal>

            {/* MODAL QR PHÓNG TO */}
            <Modal
                title='Mã vé QR'
                open={isQrModalOpen}
                onCancel={closeQrModal}
                footer={null}
                centered
                width={350}
                zIndex={1100} // Đảm bảo đè lên Modal chi tiết
            >
                {selectedTicketQr && (
                    <div className={cx('qrModalContent')}>
                        <h2 style={{ color: '#000' }}>
                            {selectedTicketQr.event?.name}
                        </h2>
                        <div className={cx('modalQrWrapper')}>
                            <QRCodeCanvas
                                value={selectedTicketQr.qrCode}
                                size={250}
                                level={'H'}
                            />
                        </div>
                        <p
                            className={cx('modalQrText')}
                            style={{ color: '#000' }}
                        >
                            {selectedTicketQr.qrCode?.toUpperCase()}
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Ticket;
