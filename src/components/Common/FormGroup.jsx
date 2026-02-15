import React from 'react';
import classNames from 'classnames'; // Không dùng bind ở đây để component dùng chung được nhiều nơi

const FormGroup = ({ label, type = 'text', className, ...props }) => {
    return (
        <div className={classNames('formGroupContainer', className)}>
            <label>{label}</label>
            <input type={type} {...props} required={type !== 'number'} />
        </div>
    );
};

export default FormGroup;
