// src/components/Common/FormGroup.jsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

// Component dùng chung cho input + label + hiển thị lỗi
const FormGroup = ({
    label,
    type = 'text',
    className,
    error,
    trigger,
    maxLength, // Giới hạn số ký tự (nếu có)
    value = '', // Giá trị input để hỗ trợ đếm ký tự
    ...props
}) => {
    const [localError, setLocalError] = useState(error);

    // Đồng bộ và tự động ẩn lỗi sau 2 giây
    useEffect(() => {
        setLocalError(error);
        if (error) {
            const timer = setTimeout(() => {
                setLocalError('');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [error, trigger]);

    return (
        <div className={classNames('formGroupContainer', className)}>
            {/* Label + bộ đếm ký tự */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                }}
            >
                <label style={{ margin: 0 }}>{label}</label>

                {/* Hiển thị số ký tự hiện tại / maxLength */}
                {maxLength && (
                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {String(value || '').length}/{maxLength}
                    </span>
                )}
            </div>

            {/* Input chính */}
            <input
                type={type}
                value={value}
                maxLength={maxLength}
                {...props}
                className={classNames({ errorInput: !!localError })}
            />

            {/* Thông báo lỗi */}
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
