import React from 'react';
import classNames from 'classnames/bind';
import styles from './PolicyViewer.module.scss';

const cx = classNames.bind(styles);

function PolicyViewer({ fileName }) {
    // Đường dẫn đến file trong thư mục public/documents/
    const fileUrl = `/documents/${fileName}`;

    return (
        <div className={cx('policy-container')}>
            <iframe src={fileUrl} className={cx('pdf-frame')} title={fileName}>
                {/* Trường hợp trình duyệt không hỗ trợ iframe */}
                <div className={cx('fallback-message')}>
                    <p>
                        Trình duyệt của bạn không hỗ trợ hiển thị PDF trực tiếp.
                        <a
                            href={fileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            Nhấn vào đây để tải file.
                        </a>
                    </p>
                </div>
            </iframe>
        </div>
    );
}

export default PolicyViewer;
