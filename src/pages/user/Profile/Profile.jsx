// src/pages/user/Profile/Profile.jsx
import { useState, useContext, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import { AuthContext } from '@contexts/AuthContext';
import { callUpdateUser } from '@apis/userApi';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const cx = classNames.bind(styles);

function Profile() {
    const { user, loginContext } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: 'MALE',
        address: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id || '',
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                // Hiển thị tuổi từ Context (Context đã lo việc lấy từ Cookie)
                age: user.age || '',
                gender: user.gender || 'MALE',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === 'age') {
            const val = value === '' ? '' : Math.max(0, parseInt(value, 10));
            setFormData(prev => ({ ...prev, age: val }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleUpdate = async e => {
        e.preventDefault();

        const dataToSend = {
            ...formData,
            age: formData.age === '' ? 0 : Number(formData.age)
        };

        try {
            const res = await callUpdateUser(dataToSend);

            if (res && res.data) {
                if (formData.age) {
                    Cookies.set(`user_age_${user.id}`, formData.age, {
                        expires: 7
                    });
                }

                const updatedUser = {
                    ...user,
                    ...res.data,
                    age: formData.age || res.data.age
                };

                await loginContext(updatedUser, null);
                toast.success('Cập nhật thông tin thành công!');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Có lỗi xảy ra khi cập nhật');
        }
    };

    return (
        <div className={cx('container')}>
            <div className={cx('profile-wrapper')}>
                <h2 className={cx('profile-title')}>Thông tin tài khoản</h2>
                <div className={cx('profile-content')}>
                    <div className={cx('avatar-section')}>
                        <img
                            className={cx('avatar-img')}
                            src='https://static.ticketbox.vn/avatar.png'
                            alt='Avatar'
                        />
                    </div>

                    <form
                        className={cx('profile-form')}
                        onSubmit={handleUpdate}
                    >
                        <div className={cx('form-group')}>
                            <label>Họ và tên</label>
                            <input
                                type='text'
                                name='name'
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Số điện thoại</label>
                            <input
                                type='text'
                                name='phone'
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Email </label>
                            <input
                                type='email'
                                value={formData.email}
                                readOnly
                                className={cx('input-disabled')}
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Tuổi</label>
                            <input
                                type='number'
                                name='age'
                                value={formData.age}
                                onChange={handleChange}
                                min='1'
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Địa chỉ</label>
                            <input
                                type='text'
                                name='address'
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Giới tính</label>
                            <div className={cx('radio-group')}>
                                <label className={cx('radio-label')}>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='MALE'
                                        checked={formData.gender === 'MALE'}
                                        onChange={handleChange}
                                    />{' '}
                                    Nam
                                </label>
                                <label className={cx('radio-label')}>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='FEMALE'
                                        checked={formData.gender === 'FEMALE'}
                                        onChange={handleChange}
                                    />{' '}
                                    Nữ
                                </label>
                                <label className={cx('radio-label')}>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='OTHER'
                                        checked={formData.gender === 'OTHER'}
                                        onChange={handleChange}
                                    />{' '}
                                    Khác
                                </label>
                            </div>
                        </div>

                        <button type='submit' className={cx('update-btn')}>
                            Lưu thay đổi
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
