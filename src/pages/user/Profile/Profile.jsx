import { useState, useContext, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import { AuthContext } from '@contexts/AuthContext';
import { callUpdateUser } from '@apis/userApi';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

function Profile() {
    // FIX: Lấy thêm loginContext để cập nhật lại state toàn cục sau khi sửa
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

    // Đồng bộ dữ liệu từ Context vào Form khi user thay đổi (hoặc lúc mới load)
    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id || '',
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                // Logic Senior: Tránh hiển thị số 0 xấu xí nếu chưa có dữ liệu tuổi
                age: user.age && user.age !== 0 ? user.age : '',
                gender: user.gender || 'MALE',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = e => {
        const { name, value } = e.target;

        if (name === 'age') {
            // Chỉ cho phép nhập số dương hoặc để trống
            const val = value === '' ? '' : Math.max(0, parseInt(value, 10));
            setFormData(prev => ({ ...prev, age: val }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleUpdate = async e => {
        e.preventDefault();

        // 1. Chuẩn bị dữ liệu: Ép kiểu dữ liệu đúng format Backend yêu cầu (age là number)
        const dataToSend = {
            ...formData,
            age: formData.age === '' ? 0 : Number(formData.age)
        };

        try {
            const res = await callUpdateUser(dataToSend);

            // Backend trả về ResUpdateUserDTO nằm trong res.data (nhờ axios interceptor)
            if (res && res.data) {
                // 2. Hợp nhất dữ liệu cũ và mới để đảm bảo không mất thông tin
                const updatedUser = {
                    ...user,
                    ...res.data
                };

                // 3. Cập nhật lại Context để toàn bộ App (Header, v.v.) nhận thông tin mới
                // Vì không đổi token nên ta truyền null cho tham số accessToken
                await loginContext(updatedUser, null);

                toast.success('Cập nhật thông tin thành công!');
            }
        } catch (error) {
            console.error('Update error:', error);
            // Lấy message lỗi từ backend nếu có
            const msg =
                error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật';
            toast.error(msg);
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

                        {/* Email thường là duy nhất và dùng làm định danh, không nên cho sửa */}
                        <div className={cx('form-group')}>
                            <label>Email (Không được thay đổi)</label>
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
                                <label className={cx('radio-label')}>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='MALE'
                                        checked={formData.gender === 'MALE'}
                                        onChange={handleChange}
                                    />
                                    <span>Nam</span>
                                </label>
                                <label className={cx('radio-label')}>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='FEMALE'
                                        checked={formData.gender === 'FEMALE'}
                                        onChange={handleChange}
                                    />
                                    <span>Nữ</span>
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
