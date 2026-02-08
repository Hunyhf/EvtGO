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

    // 1. Đồng bộ formData với user từ Context
    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id || '',
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                // Hiển thị chuỗi rỗng nếu tuổi là 0 hoặc null
                age: user.age && user.age !== 0 ? user.age : '',
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

        // Chuẩn bị data gửi đi
        const dataToSend = {
            ...formData,
            age: formData.age === '' ? 0 : parseInt(formData.age, 10)
        };

        try {
            const res = await callUpdateUser(dataToSend);

            if (res && res.data) {
                // SỬA LỖI TẠI ĐÂY:
                // 1. Hợp nhất với 'user' cũ để không bị mất 'email' (vì Backend DTO không trả về email)
                // 2. Nếu Backend trả về age = 0 (do lỗi logic BE), ta lấy giá trị từ formData vừa nhập để hiển thị đúng
                const updatedUser = {
                    ...user, // Giữ lại các trường cũ bao gồm email
                    ...res.data, // Ghi đè các trường mới từ backend
                    age:
                        res.data.age === 0 && dataToSend.age !== 0
                            ? dataToSend.age
                            : res.data.age
                };

                // Cập nhật lại Context
                loginContext(updatedUser);
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
