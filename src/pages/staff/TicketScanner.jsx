import React, { useState, useEffect, useRef } from 'react';

import { useParams } from 'react-router-dom';

import { Html5Qrcode } from 'html5-qrcode';

import orderApi from '@apis/orderApi';

import styles from './TicketScanner.module.scss';

import { message, Card, Descriptions, Tag, Button, Alert, Spin } from 'antd';

const TicketScanner = () => {
    const { eventId } = useParams();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Quản lý kết quả quét: null (đang quét), { type: 'success', data }, { type: 'error', message }

    const [scanResult, setScanResult] = useState(null);

    const [isCameraReady, setIsCameraReady] = useState(false);

    // Refs để quản lý instance scanner và chống spam API

    const scannerRef = useRef(null);

    const isProcessing = useRef(false);

    // Kiểm tra thiết bị

    useEffect(() => {
        const checkDevice = () => setIsMobile(window.innerWidth <= 768);

        window.addEventListener('resize', checkDevice);

        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Khởi tạo và Tự động bật Camera khi vào trang

    useEffect(() => {
        if (!isMobile) return;

        const html5QrCode = new Html5Qrcode('reader');

        scannerRef.current = html5QrCode;

        const config = {
            fps: 10,

            qrbox: { width: 250, height: 250 },

            aspectRatio: 1.0
        };

        const onScanSuccess = async decodedText => {
            // Khóa luồng nếu đang xử lý hoặc đang hiển thị kết quả

            if (isProcessing.current) return;

            isProcessing.current = true;

            try {
                const res = await orderApi.verifyQrCode(decodedText);

                const data = res.data || res;

                setScanResult({ type: 'success', data: data });

                message.success('Xác thực vé thành công!');
            } catch (error) {
                setScanResult({
                    type: 'error',

                    message:
                        error.response?.data?.message ||
                        'Vé không hợp lệ hoặc đã được sử dụng!'
                });

                message.warning('Phát hiện vé lỗi!');
            }
        };

        const startScanner = async () => {
            try {
                await html5QrCode.start(
                    { facingMode: 'environment' },

                    config,

                    onScanSuccess
                );

                setIsCameraReady(true);
            } catch (err) {
                console.error('Lỗi camera:', err);

                message.error('Không thể truy cập camera.');
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current

                    .stop()

                    .catch(err => console.error('Lỗi tắt camera:', err));
            }
        };
    }, [isMobile]);

    // Hàm reset để tiếp tục quét

    const handleScanNext = () => {
        setScanResult(null);

        // Delay 1s để nhân viên kịp dời điện thoại, tránh quét lặp lại mã cũ ngay lập tức

        setTimeout(() => {
            isProcessing.current = false;
        }, 1000);
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
                <h3>Quét Vé Check-in</h3>

                <p>Sự kiện ID: {eventId}</p>
            </div>

            <div className={styles.scannerWrapper}>
                {/* 1. Hiệu ứng loading khi chờ camera */}

                {!isCameraReady && !scanResult && (
                    <div className={styles.cameraLoading}>
                        <Spin size='large' tip='Đang khởi động camera...' />
                    </div>
                )}

                {/* 2. Vùng Camera (ẩn đi khi có kết quả để staff tập trung đọc thông tin) */}

                <div
                    id='reader'
                    className={styles.readerCanvas}
                    style={{ display: scanResult ? 'none' : 'block' }}
                />

                {/* 3. Hiển thị kết quả chi tiết (Success / Error) */}

                {scanResult && (
                    <div className={styles.resultContainer}>
                        {scanResult.type === 'success' ? (
                            <Card
                                title={
                                    <span style={{ color: '#52c41a' }}>
                                        Xác thực thành công
                                    </span>
                                }
                                className={styles.resultCard}
                                style={{
                                    textAlign: 'left',

                                    borderColor: '#b7eb8f'
                                }}
                            >
                                <Descriptions column={1} bordered size='small'>
                                    <Descriptions.Item label='Sự kiện'>
                                        <strong>
                                            {scanResult.data?.event?.name}
                                        </strong>
                                    </Descriptions.Item>

                                    <Descriptions.Item label='Loại vé'>
                                        <Tag color='blue'>
                                            {
                                                scanResult.data?.ticket
                                                    ?.ticketType
                                            }
                                        </Tag>
                                    </Descriptions.Item>

                                    {scanResult.data?.seatLabel && (
                                        <Descriptions.Item label='Vị trí'>
                                            <Tag color='orange'>
                                                Khu: {scanResult.data?.zone}
                                            </Tag>

                                            <Tag color='volcano'>
                                                Ghế:{' '}
                                                {scanResult.data?.seatLabel}
                                            </Tag>
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>

                                <Button
                                    type='primary'
                                    size='large'
                                    block
                                    onClick={handleScanNext}
                                    style={{ marginTop: 20 }}
                                >
                                    Quét vé tiếp theo
                                </Button>
                            </Card>
                        ) : (
                            <Card
                                title={
                                    <span style={{ color: '#ff4d4f' }}>
                                        ❌ Từ chối Check-in
                                    </span>
                                }
                                className={styles.resultCard}
                                style={{
                                    textAlign: 'left',

                                    borderColor: '#ffa39e'
                                }}
                            >
                                <Alert
                                    message='Lỗi xác thực'
                                    description={scanResult.message}
                                    type='error'
                                    showIcon
                                />

                                <Button
                                    type='primary'
                                    danger
                                    size='large'
                                    block
                                    onClick={handleScanNext}
                                    style={{ marginTop: 20 }}
                                >
                                    Đóng & Quét mã khác
                                </Button>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Hint hướng dẫn chỉ hiện khi đang quét */}

            {!scanResult && isCameraReady && (
                <div className={styles.scanHint}>
                    <p>Vui lòng đưa mã QR vào khung hình</p>
                </div>
            )}
        </div>
    );
};

export default TicketScanner;
