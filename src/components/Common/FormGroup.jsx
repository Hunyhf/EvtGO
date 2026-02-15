import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

const FormGroup = ({ label, type = 'text', className, error, ...props }) => {
    // Trạng thái để quản lý việc hiển thị lỗi cục bộ
    const [localError, setLocalError] = useState(error);

    useEffect(() => {
        // Cập nhật lỗi nội bộ mỗi khi prop error thay đổi
        setLocalError(error);

        // Nếu có lỗi, thiết lập timer để xóa lỗi sau 2000ms (2 giây)
        if (error) {
            const timer = setTimeout(() => {
                setLocalError('');
            }, 2000);

            // Dọn dẹp timer nếu component unmount hoặc error thay đổi trước khi hết 2 giây
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className={classNames('formGroupContainer', className)}>
            <label>{label}</label>
            <input
                type={type}
                {...props}
                // Sử dụng localError để giữ màu viền đỏ đồng bộ với thông báo
                className={classNames({ errorInput: !!localError })}
            />
            {/* Hiển thị lỗi ngay bên dưới input nếu localError tồn tại */}
            {localError && (
                <span
                    style={{
                        color: '#ff4d4f',
                        fontSize: '12px',
                        marginTop: '4px',
                        display: 'block'
                    }}
                >
                    {localError}
                </span>
            )}
        </div>
    );
};

export default FormGroup;
