import React from 'react';
import classNames from 'classnames/bind';

const FormGroup = ({ label, type = 'text', className, ...props }) => {
    return (
        <div className='profile__form-group'>
            <label>{label}</label>
            <input type={type} {...props} required={type !== 'number'} />
        </div>
    );
};

export default FormGroup;
