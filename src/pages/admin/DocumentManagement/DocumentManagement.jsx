import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { aiApi } from '@apis/aiApi';
import styles from './DocumentManagement.module.scss';

const cx = classNames.bind(styles);

const DocumentManagement = () => {
    const policyFiles = [
        {
            name: 'Chính sách bảo mật thanh toán',
            path: '/chinh-sach-bao-mat-thanh-toan',
            fileName: 'chinh-sach-bao-mat-thanh-toan.pdf'
        },
        {
            name: 'Chính sách kiểm hàng và đổi trả',
            path: '/chinh-sach-kiem-hang',
            fileName: 'chinh-sach-kiem-hang.pdf'
        },
        {
            name: 'Điều kiện vận chuyển và giao nhận',
            path: '/dieu-kien-van-chuyen',
            fileName: 'dieu-kien-van-chuyen.pdf'
        },
        {
            name: 'Chính sách bảo mật thông tin',
            path: '/chinh-sach-bao-mat-thong-tin',
            fileName: 'chinh-sach-bao-mat-thong-tin.pdf'
        },
        {
            name: 'Cơ chế giải quyết tranh chấp/khiếu nại',
            path: '/giai-quyet-tranh-chap-phat-sinh',
            fileName: 'giai-quyet-tranh-chap-phat-sinh.pdf'
        },
        {
            name: 'Phương thức thanh toán',
            path: '/phuong-thuc-thanh-toan',
            fileName: 'phuong-thuc-thanh-toan.pdf'
        },
        {
            name: 'Quy chế hoạt động',
            path: '/quy-che-hoat-dong',
            fileName: 'quy-che-hoat-dong.pdf'
        }
    ];

    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ text: '', type: '' });

    const fileInputRef = useRef(null);

    const handleFileChange = e => {
        const file = e.target.files[0];
        if (file) {
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                setNotification({
                    text: 'File phải nhỏ hơn 10MB!',
                    type: 'error'
                });
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            setSelectedFile(file);
            setNotification({ text: '', type: '' });
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setNotification({
                text: 'Vui lòng chọn một file trước khi tải lên.',
                type: 'error'
            });
            return;
        }

        setIsLoading(true);
        setNotification({ text: '', type: '' });

        try {
            const response = await aiApi.uploadDocument(selectedFile);
            const chunks = response?.totalChunks || 0;

            setNotification({
                text: `Tải lên và huấn luyện thành công! Đã xử lý ${chunks} đoạn dữ liệu.`,
                type: 'success'
            });

            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Upload error: ', error);
            const errorMessage =
                error?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
            setNotification({
                text: `Lỗi khi tải file: ${errorMessage}`,
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cx('container')}>
            <h2 className={cx('title')}>Quản Lý Tài Liệu & Điều Khoản</h2>

            {/* PHẦN 1: TẢI LÊN TÀI LIỆU AI */}
            <div className={cx('uploadCard')}>
                <h3 className={cx('cardTitle')}>Huấn Luyện AI</h3>
                <p>
                    Chọn file (.pdf, .txt, .csv, .md) để thêm kiến thức cho
                    Chatbot
                </p>

                <input
                    ref={fileInputRef}
                    type='file'
                    accept='.pdf, .txt, .csv, .md'
                    onChange={handleFileChange}
                    className={cx('fileInput')}
                    disabled={isLoading}
                />

                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isLoading}
                    className={cx('uploadBtn')}
                >
                    {isLoading
                        ? 'Đang đọc và vector hóa...'
                        : 'Tải lên & Huấn luyện'}
                </button>

                {notification.text && (
                    <div
                        className={cx('message', {
                            success: notification.type === 'success',
                            error: notification.type === 'error'
                        })}
                    >
                        {notification.type === 'success' ? '✅  ' : '❌ '}
                        {notification.text}
                    </div>
                )}
            </div>

            {/* PHẦN 2: DANH SÁCH ĐIỀU KHOẢN (HIỂN THỊ CỨNG) */}
            <div className={cx('policyCard')}>
                <h3 className={cx('cardTitle')}>
                    Danh Sách Điều Khoản Hệ Thống
                </h3>
                <div className={cx('tableResponsive')}>
                    <table className={cx('policyTable')}>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên chính sách</th>
                                <th>Tên tệp</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policyFiles.map((policy, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className={cx('policyName')}>
                                        {policy.name}
                                    </td>
                                    <td>
                                        <span className={cx('fileNameTag')}>
                                            {policy.fileName}
                                        </span>
                                    </td>
                                    <td>
                                        <Link
                                            to={policy.path}
                                            target='_blank'
                                            className={cx('viewBtn')}
                                        >
                                            Xem nội dung
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DocumentManagement;
