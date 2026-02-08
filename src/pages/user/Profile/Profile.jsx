import { useState, useContext, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import { AuthContext } from '@contexts/AuthContext';
import { callUpdateUser } from '@apis/userApi';

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

    // 1. Luôn đồng bộ formData với user từ Context
    // Khi loginContext(res.data) được gọi, user sẽ thay đổi và useEffect này chạy lại
    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id || '',
                name: user.name || '',
                email: user.email || '', // Lấy từ context
                phone: user.phone || '',
                // Fix lỗi tuổi về 0: Nếu backend trả về 0 hoặc null thì hiện chuỗi rỗng
                age: user.age && user.age !== 0 ? user.age : '',
                gender: user.gender || 'MALE',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = e => {
        const { name, value } = e.target;

        if (name === 'age') {
            // Đảm bảo giá trị là số nguyên và không âm
            const val = value === '' ? '' : Math.max(0, parseInt(value, 10));
            setFormData(prev => ({ ...prev, age: val }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleUpdate = async e => {
        e.preventDefault();

        // Chuẩn bị data gửi đi: Đảm bảo age là số nguyên
        const dataToSend = {
            ...formData,
            age: formData.age === '' ? 0 : formData.age
        };

        try {
            const res = await callUpdateUser(dataToSend);

            if (res && res.data) {
                // 2. CẬP NHẬT LẠI CONTEXT bằng dữ liệu mới nhất từ Backend
                // Backend trả về User object đầy đủ, bao gồm cả email cũ
                loginContext(res.data);
                alert('Cập nhật thông tin thành công!');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Có lỗi xảy ra khi cập nhật');
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
                                placeholder='Nhập họ tên'
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Số điện thoại</label>
                            <input
                                type='text'
                                name='phone'
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder='Nhập số điện thoại'
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Email (Không đổi)</label>
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
                                placeholder='Nhập số tuổi'
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
                                placeholder='Nhập địa chỉ'
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Giới tính</label>
                            <div className={cx('radio-group')}>
                                <label>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='MALE'
                                        checked={formData.gender === 'MALE'}
                                        onChange={handleChange}
                                    />{' '}
                                    Nam
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='FEMALE'
                                        checked={formData.gender === 'FEMALE'}
                                        onChange={handleChange}
                                    />{' '}
                                    Nữ
                                </label>
                            </div>
                        </div>

                        <button type='submit' className={cx('update-btn')}>
                            Cập nhật
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
