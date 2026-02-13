import React from 'react';
import classNames from 'classnames'; // Không dùng bind ở đây để component dùng chung được nhiều nơi

const FormGroup = ({ label, type = 'text', className, ...props }) => {
    return (
        /* Sử dụng className truyền từ cha vào để ăn theo CSS Module của cha */
        <div className={classNames('form-group-container', className)}>
            <label>{label}</label>
            <input type={type} {...props} required={type !== 'number'} />
        </div>
    );
};

export default FormGroup;
