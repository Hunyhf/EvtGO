// src/components/Common/FormGroup.jsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

const FormGroup = ({
    label,
    type = 'text',
    className,
    error,
    trigger,
    ...props
}) => {
    const [localError, setLocalError] = useState(error);

    useEffect(() => {
        setLocalError(error);

        if (error) {
            const timer = setTimeout(() => {
                setLocalError('');
            }, 2000); // Biến mất sau 2 giây
            return () => clearTimeout(timer);
        }
    }, [error, trigger]); // Lắng nghe cả nội dung lỗi và trigger bấm nút

    return (
        <div className={classNames('formGroupContainer', className)}>
            <label>{label}</label>
            <input
                type={type}
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
