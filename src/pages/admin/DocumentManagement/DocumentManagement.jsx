import React, { useState, useRef } from 'react';
import classNames from 'classnames/bind';
import { aiApi } from '@apis/aiApi';
import styles from './DocumentManagement.module.scss';

const cx = classNames.bind(styles);

const DocumentManagement = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Tách riêng state message và status để quản lý logic UI rõ ràng hơn
    const [notification, setNotification] = useState({ text: '', type: '' });

    // Sử dụng useRef thay cho document.getElementById
    const fileInputRef = useRef(null);

    const handleFileChange = e => {
        const file = e.target.files[0];
        if (file) {
            // Frontend Validation cơ bản (VD: Giới hạn 10MB)
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
            // Chuẩn hóa data nhận được (do interceptor axios trả về data)
            const chunks = response?.totalChunks || 0;

            setNotification({
                text: `Tải lên và huấn luyện thành công! Đã xử lý ${chunks} đoạn dữ liệu.`,
                type: 'success'
            });

            // Reset form chuẩn React
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Upload error: ', error);

            // Lấy trực tiếp error.message do axiosClient đã reject error.response.data
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
            <h2 className={cx('title')}>Thêm Tài Liệu Huấn Luyện AI</h2>

            <div className={cx('uploadCard')}>
                <p>
                    Chọn file (.pdf, .txt, .csv, .md) để thêm kiến thức cho AI
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
                        // className map theo status type
                        className={cx('message', {
                            success: notification.type === 'success',
                            error: notification.type === 'error'
                        })}
                    >
                        {notification.type === 'success' ? '✅ ' : '❌ '}
                        {notification.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentManagement;
