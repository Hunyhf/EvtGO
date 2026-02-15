import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import { useProfileLogic } from '@hooks/useProfileLogic';
import FormGroup from '@components/Common/FormGroup';

const cx = classNames.bind(styles);

function Profile() {
    const { formData, isUpdating, handleChange, submitUpdate } =
        useProfileLogic();

    return (
        <div className={cx('profile')}>
            <div className={cx('wrapper')}>
                <h2 className={cx('title')}>Thông tin tài khoản</h2>

                <div className={cx('avatarSection')}>
                    {' '}
                    {/* Đổi từ avatar-section */}
                    <img
                        className={cx('avatarImg')} // Đổi từ avatar-img
                        src='https://static.ticketbox.vn/avatar.png'
                        alt='Avatar'
                    />
                </div>

                <form className={cx('form')} onSubmit={submitUpdate}>
                    <FormGroup
                        label='Họ tên'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        placeholder='Nhập họ và tên'
                        className={cx('formGroup')} // Đổi từ form-group
                    />

                    <FormGroup
                        label='Email'
                        name='email'
                        value={formData.email}
                        readOnly
                        className={cx('formGroup')}
                    />

                    <FormGroup
                        label='Tuổi'
                        name='age'
                        type='number'
                        value={formData.age}
                        onChange={handleChange}
                        placeholder='Nhập tuổi'
                        className={cx('formGroup')}
                    />

                    <FormGroup
                        label='Địa chỉ'
                        name='address'
                        value={formData.address}
                        onChange={handleChange}
                        placeholder='Nhập địa chỉ cư trú'
                        className={cx('formGroup')}
                    />

                    <div className={cx('radioContainer')}>
                        {' '}
                        {/* Đổi từ radio-container */}
                        <span className={cx('label')}>Giới tính</span>
                        <div className={cx('radioGroup')}>
                            {' '}
                            {/* Đổi từ radio-group */}
                            {[
                                { val: 'MALE', lab: 'Nam' },
                                { val: 'FEMALE', lab: 'Nữ' },
                                { val: 'OTHER', lab: 'Khác' }
                            ].map(item => (
                                <label
                                    key={item.val}
                                    className={cx('radioItem')} // Đổi từ radio-item
                                >
                                    <input
                                        type='radio'
                                        name='gender'
                                        value={item.val}
                                        checked={formData.gender === item.val}
                                        onChange={handleChange}
                                    />
                                    {item.lab}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type='submit'
                        className={cx('updateBtn', { loading: isUpdating })} // Đổi từ update-btn
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Profile;
