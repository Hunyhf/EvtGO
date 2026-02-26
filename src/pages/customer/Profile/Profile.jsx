import { useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import { useProfileLogic } from '@hooks/useProfileLogic';
import FormGroup from '@components/Common/FormGroup';
import { getAvatarUrl } from '@utils/imageHelper';

const cx = classNames.bind(styles);

function Profile() {
    // Lấy dữ liệu và các hàm xử lý từ hook useProfileLogic
    const {
        formData,
        isUpdating,
        handleChange,
        submitUpdate,
        handleAvatarChange
    } = useProfileLogic();

    // Tạo ref để điều khiển input file ẩn
    const fileInputRef = useRef(null);

    // Hàm kích hoạt chọn file khi nhấn vào vùng avatar
    const handleAvatarClick = () => {
        if (!isUpdating) {
            fileInputRef.current.click();
        }
    };

    /**
     * Logic xử lý hiển thị ảnh:
     * 1. Nếu formData.avatar bắt đầu bằng 'blob:', đó là ảnh preview tạm thời -> Hiển thị trực tiếp.
     * 2. Nếu không, đó là tên file từ database -> Dùng hàm getAvatarUrl để lấy link từ server.
     */
    const avatarSrc = formData.avatar?.startsWith('blob:')
        ? formData.avatar
        : getAvatarUrl(formData.id, formData.avatar);

    return (
        <div className={cx('profile')}>
            <div className={cx('wrapper')}>
                <h2 className={cx('title')}>Thông tin tài khoản</h2>

                {/* Phần hiển thị Avatar */}
                <div
                    className={cx('avatarSection')}
                    onClick={handleAvatarClick}
                    title='Nhấn để đổi ảnh đại diện'
                >
                    <img
                        className={cx('avatarImg')}
                        src={avatarSrc}
                        alt='Avatar'
                    />

                    {/* Lớp phủ hiển thị chữ "Đổi ảnh" khi di chuột vào */}
                    <div className={cx('avatarOverlay')}>
                        <span>Đổi ảnh</span>
                    </div>

                    {/* Input chọn file ẩn (chỉ chấp nhận định dạng ảnh) */}
                    <input
                        type='file'
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept='image/*'
                        style={{ display: 'none' }}
                    />
                </div>

                <form className={cx('form')} onSubmit={submitUpdate}>
                    <FormGroup
                        label='Họ tên'
                        name='name'
                        value={formData.name || ''}
                        onChange={handleChange}
                        placeholder='Nhập họ và tên'
                        className={cx('formGroup')}
                    />

                    <FormGroup
                        label='Email'
                        name='email'
                        value={formData.email || ''}
                        readOnly
                        className={cx('formGroup')}
                    />

                    <FormGroup
                        label='Tuổi'
                        name='age'
                        type='number'
                        value={formData.age ?? ''}
                        onChange={handleChange}
                        placeholder='Nhập tuổi'
                        className={cx('formGroup')}
                    />

                    <FormGroup
                        label='Địa chỉ'
                        name='address'
                        value={formData.address || ''}
                        onChange={handleChange}
                        placeholder='Nhập địa chỉ cư trú'
                        className={cx('formGroup')}
                    />

                    <div className={cx('radioContainer')}>
                        <span className={cx('label')}>Giới tính</span>
                        <div className={cx('radioGroup')}>
                            {[
                                { val: 'MALE', lab: 'Nam' },
                                { val: 'FEMALE', lab: 'Nữ' },
                                { val: 'OTHER', lab: 'Khác' }
                            ].map(item => (
                                <label
                                    key={item.val}
                                    className={cx('radioItem')}
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
                        className={cx('updateBtn', { loading: isUpdating })}
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
