// src/components/Common/FormGroup.jsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

const FormGroup = ({
    label,
    type = 'text',
    className,
    error,
    trigger,
    maxLength, // Nhận thêm maxLength
    value = '', // Nhận giá trị để đếm
    ...props
}) => {
    const [localError, setLocalError] = useState(error);

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
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                }}
            >
                <label style={{ margin: 0 }}>{label}</label>
                {/* Hiển thị bộ đếm nếu có maxLength */}
                {maxLength && (
                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {String(value || '').length}/{maxLength}
                    </span>
                )}
            </div>
            <input
                type={type}
                value={value}
                maxLength={maxLength}
                {...props}
                className={classNames({ errorInput: !!localError })}
            />
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
