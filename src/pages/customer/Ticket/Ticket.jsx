import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Pagination, Modal } from 'antd';
import dayjs from 'dayjs';

import orderApi from '@apis/orderApi';
import { eventApi } from '@apis/eventApi';
import { getEventImageUrl } from '@utils/imageHelper';
import useModal from '@hooks/useModal'; // 1. Import hook

import styles from './Ticket.module.scss';

function Ticket() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eventImages, setEventImages] = useState({});
    const [selectedTicket, setSelectedTicket] = useState(null);

    // 2. Khởi tạo useModal (Đổi tên để tường minh logic QR)
    const {
        isOpen: isQrModalOpen,
        open: openQrModal,
        close: closeQrModal
    } = useModal();

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    useEffect(() => {
        const fetchMyTickets = async () => {
            try {
                const response = await orderApi.getMyTickets();
                let ticketData = Array.isArray(response)
                    ? response
                    : response?.result || [];

                ticketData.sort(
                    (a, b) =>
                        dayjs(b.issuedAt).valueOf() -
                        dayjs(a.issuedAt).valueOf()
                );
                setTickets(ticketData);

                // Logic fetch ảnh bổ sung cho các event thiếu ảnh
                const uniqueEventIdsMissingImg = [
                    ...new Set(
                        ticketData
                            .filter(t => t.event && !t.event.image)
                            .map(t => t.event.id)
                    )
                ];

                uniqueEventIdsMissingImg.forEach(async id => {
                    try {
                        const res = await eventApi.getById(id);
                        const eventDetail = res?.result || res;
                        const detailImageName =
                            eventDetail?.image || eventDetail?.images?.[0]?.url;

                        if (detailImageName) {
                            setEventImages(prev => ({
                                ...prev,
                                [id]: detailImageName
                            }));
                        }
                    } catch (err) {
                        console.error(
                            `Không thể lấy ảnh cho sự kiện ${id}:`,
                            err
                        );
                    }
                });
            } catch (error) {
                console.error('Lỗi lấy danh sách vé:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyTickets();
    }, []);

    // Logic phân trang local
    const indexOfLastTicket = currentPage * pageSize;
    const indexOfFirstTicket = indexOfLastTicket - pageSize;
    const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

    const handlePageChange = page => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // 3. Cập nhật hàm mở Modal
    const handleOpenQr = ticket => {
        setSelectedTicket(ticket);
        openQrModal();
    };

    // 4. Cập nhật hàm đóng Modal (Vẫn cần reset selectedTicket)
    const handleCloseQr = () => {
        closeQrModal();
        setSelectedTicket(null);
    };

    if (loading) return <div className={styles.loading}>Đang tải vé...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Vé của tôi</h1>

            <div className={styles.ticketList}>
                {currentTickets.length > 0 ? (
                    currentTickets.map(item => {
                        const currentImageName =
                            item.event?.image || eventImages[item.event?.id];
                        const imageUrl = currentImageName
                            ? getEventImageUrl(item.event.id, currentImageName)
                            : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30';

                        return (
                            <div
                                key={item.id}
                                className={styles.ticketRow}
                                onClick={() => handleOpenQr(item)}
                            >
                                <div className={styles.leftSection}>
                                    <img
                                        src={imageUrl}
                                        alt={item.event?.name}
                                        onError={e => {
                                            e.target.src =
                                                'https://placehold.co/400x600?text=No+Image';
                                        }}
                                    />
                                    <span
                                        className={`${styles.statusBadge} ${styles[item.status?.toLowerCase()]}`}
                                    >
                                        {item.status}
                                    </span>
                                </div>

                                <div className={styles.middleSection}>
                                    <h2 className={styles.eventName}>
                                        {item.event?.name}
                                    </h2>
                                    <div className={styles.infoGrid}>
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
                                        <p>
                                            <strong>Ngày mua:</strong>{' '}
                                            {dayjs(item.issuedAt).format(
                                                'DD/MM/YYYY'
                                            )}
                                        </p>
                                        <p className={styles.price}>
                                            <strong>Giá:</strong>{' '}
                                            {item.ticket?.price?.toLocaleString(
                                                'vi-VN'
                                            )}{' '}
                                            VNĐ
                                        </p>
                                    </div>
                                </div>

                                <div className={styles.rightSection}>
                                    <div className={styles.qrContainer}>
                                        <QRCodeCanvas
                                            value={item.qrCode || 'NO-CODE'}
                                            size={100}
                                            level={'H'}
                                        />
                                    </div>
                                    <p className={styles.qrCodeText}>
                                        #
                                        {item.qrCode
                                            ?.split('-')[0]
                                            .toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.noData}>Bạn chưa sở hữu vé nào.</div>
                )}
            </div>

            {/* 5. Sử dụng biến và hàm từ hook vào Modal */}
            <Modal
                title='Mã vé QR'
                open={isQrModalOpen}
                onCancel={handleCloseQr}
                footer={null}
                centered
                width={350}
            >
                {selectedTicket && (
                    <div className={styles.qrModalContent}>
                        <h2>{selectedTicket.event?.name}</h2>
                        <div className={styles.modalQrWrapper}>
                            <QRCodeCanvas
                                value={selectedTicket.qrCode || 'NO-CODE'}
                                size={250}
                                level={'H'}
                            />
                        </div>
                        <p className={styles.modalQrText}>
                            {selectedTicket.qrCode?.toUpperCase()}
                        </p>
                        <p className={styles.modalHint}>
                            Sử dụng mã này để check-in tại sự kiện
                        </p>
                    </div>
                )}
            </Modal>

            {tickets.length > pageSize && (
                <div className={styles.paginationWrapper}>
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={tickets.length}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                    />
                </div>
            )}
        </div>
    );
}

export default Ticket;
