import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import { useProfileLogic } from '@hooks/useProfileLogic';

const cx = classNames.bind(styles);

function Profile() {
    const { formData, isUpdating, handleChange, submitUpdate } =
        useProfileLogic();

    return (
        <div className={cx('profile')}>
            <div className={cx('profile__wrapper')}>
                <h2 className={cx('profile__title')}>Thông tin tài khoản</h2>

                <div className={cx('profile__avatar-section')}>
                    <img
                        className={cx('profile__avatar-img')}
                        src='https://static.ticketbox.vn/avatar.png'
                        alt='Avatar'
                    />
                </div>

                <form className={cx('profile__form')} onSubmit={submitUpdate}>
                    <FormGroup
                        label='Họ tên'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                    />

                    <div className={cx('profile__form-group')}>
                        <label>Email</label>
                        <input
                            value={formData.email}
                            readOnly
                            className={cx('profile__input--disabled')}
                        />
                    </div>

                    <FormGroup
                        label='Tuổi'
                        name='age'
                        type='number'
                        value={formData.age}
                        onChange={handleChange}
                    />
                    <FormGroup
                        label='Địa chỉ'
                        name='address'
                        value={formData.address}
                        onChange={handleChange}
                    />

                    <div className={cx('profile__form-group')}>
                        <label>Giới tính</label>
                        <div className={cx('profile__radio-group')}>
                            {['MALE', 'FEMALE', 'OTHER'].map(gender => (
                                <label
                                    key={gender}
                                    className={cx('profile__radio-label')}
                                >
                                    <input
                                        type='radio'
                                        name='gender'
                                        value={gender}
                                        checked={formData.gender === gender}
                                        onChange={handleChange}
                                    />
                                    {gender === 'MALE'
                                        ? 'Nam'
                                        : gender === 'FEMALE'
                                          ? 'Nữ'
                                          : 'Khác'}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type='submit'
                        className={cx('profile__update-btn', {
                            loading: isUpdating
                        })}
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const FormGroup = ({ label, type = 'text', ...props }) => (
    <div className={cx('profile__form-group')}>
        <label>{label}</label>
        <input type={type} {...props} required={type !== 'number'} />
    </div>
);

export default Profile;
