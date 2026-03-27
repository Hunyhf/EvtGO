// src/pages/staff/TicketScanner.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode'; // Thư viện quét camera
import orderApi from '@apis/orderApi';
import styles from './TicketScanner.module.scss';
import { message } from 'antd';

const TicketScanner = () => {
    const { eventId } = useParams();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isScanning, setIsScanning] = useState(false); // Trạng thái đang gọi API

    useEffect(() => {
        const checkDevice = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', checkDevice);

        // Khởi tạo Scanner nếu là mobile
        let scanner = null;
        if (isMobile) {
            scanner = new Html5QrcodeScanner(
                'reader', // ID của thẻ div hiển thị camera
                {
                    fps: 10, // Tốc độ quét (khung hình/giây)
                    qrbox: { width: 250, height: 250 }, // Khung vuông vùng quét
                    aspectRatio: 1.0
                },
                /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanFailure);
        }

        return () => {
            window.removeEventListener('resize', checkDevice);
            if (scanner) {
                scanner
                    .clear()
                    .catch(error => console.error('Lỗi tắt camera', error));
            }
        };
    }, [isMobile]);

    // Hàm xử lý khi camera đọc được mã QR
    const onScanSuccess = async decodedText => {
        if (isScanning) return; // Nếu đang xử lý thì không quét tiếp

        setIsScanning(true);
        try {
            // Gọi API xác thực từ file orderApi.js của bạn
            await orderApi.verifyQrCode(decodedText);
            message.success('Xác thực vé thành công!');
        } catch (error) {
            message.error('Vé không hợp lệ hoặc đã sử dụng!');
        } finally {
            // Chờ 2 giây để nhân viên kịp đọc thông báo rồi mới cho quét tiếp
            setTimeout(() => setIsScanning(false), 2000);
        }
    };

    const onScanFailure = error => {
        // Hàm này chạy liên tục khi chưa thấy mã QR, thường để trống
    };

    if (!isMobile) {
        return (
            <div className={styles.mobileOnly}>
                <h2 style={{ color: '#ff4d4f' }}>Thiết bị không hợp lệ</h2>
                <p>Vui lòng sử dụng điện thoại di động để thực hiện quét vé.</p>
            </div>
        );
    }

    return (
        <div className={styles.scannerBody}>
            <div className={styles.header}>
                <h3>Quét Vé Check-in Camera</h3>
                <p>Sự kiện ID: {eventId}</p>
            </div>

            {/* Vùng hiển thị Camera */}
            <div id='reader' style={{ width: '100%' }}></div>

            <div className={styles.statusArea}>
                {isScanning ? (
                    <p style={{ color: 'blue' }}>
                        Đang kiểm tra thông tin vé...
                    </p>
                ) : (
                    <p>Đưa mã QR vào khung hình để quét</p>
                )}
            </div>
        </div>
    );
};

export default TicketScanner;
