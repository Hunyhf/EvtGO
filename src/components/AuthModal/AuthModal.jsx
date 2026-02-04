import classNames from 'classnames/bind';
import styles from './AuthModal.module.scss';
import CloseBtnIcon from '@icons/svgs/closeBtnIcon.svg?react';
const cx = classNames.bind(styles);

function AuthModal({ isOpen, onClose }) {
    if (!isOpen) return null; // Nếu không mở thì không render gì cả

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')} onClick={e => e.stopPropagation()}>
                <button className={cx('close-btn')} onClick={onClose}>
                    <CloseBtnIcon />
                </button>

                <div className={cx('content')}>
                    <h2>Đăng nhập / Đăng ký</h2>
                    <form className={cx('form')}>
                        <input
                            type='email'
                            placeholder='Email'
                            className={cx('input')}
                        />
                        <input
                            type='password'
                            placeholder='Mật khẩu'
                            className={cx('input')}
                        />
                        <button type='submit' className={cx('submit-btn')}>
                            Đăng nhập
                        </button>
                    </form>
                    <div className={cx('footer')}>
                        <span>
                            Chưa có tài khoản? <strong>Đăng ký ngay</strong>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
