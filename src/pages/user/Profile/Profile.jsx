import { useState, useContext, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import { AuthContext } from '@contexts/AuthContext';
import { callUpdateUser } from '@apis/userApi';

const cx = classNames.bind(styles);

function Profile() {
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        phone: '', // Hiện tại chưa có trong Entity Backend nhưng cứ để ở FE
        age: '', // Backend dùng trường này
        gender: 'MALE', // Khớp với GenderEnum của Backend
        address: ''
    });

    const [birthDate, setBirthDate] = useState(''); // Dùng để quản lý input date ở FE

    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id || '',
                name: user.name || '',
                email: user.email || '',
                phone: '',
                age: user.age || 0,
                gender: user.gender || 'MALE',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async e => {
        e.preventDefault();

        // Tính toán age từ birthDate nếu cần, hoặc gửi trực tiếp nếu Backend đã đổi logic
        // Ở đây tôi gửi theo cấu trúc Entity User của bạn
        try {
            const res = await callUpdateUser(formData);
            if (res && res.data) {
                alert('Cập nhật thông tin tài khoản thành công!');
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
                            src='https://static.ticketbox.vn/avatar.png' // Ảnh mặc định giống header
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
                            <label>Số điện thoại (Chưa có API)</label>
                            <input
                                type='text'
                                name='phone'
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Email</label>
                            <input
                                type='email'
                                value={formData.email}
                                readOnly
                                className={cx('input-disabled')}
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>
                                Ngày tháng năm sinh (Trường Age trong DB)
                            </label>
                            <input
                                type='date'
                                value={birthDate}
                                onChange={e => setBirthDate(e.target.value)}
                            />
                            {!birthDate && (
                                <span className={cx('status-text')}>
                                    Chưa có
                                </span>
                            )}
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
