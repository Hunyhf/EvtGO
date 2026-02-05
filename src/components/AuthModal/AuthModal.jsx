import { useState, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './AuthModal.module.scss';
import CloseBtnIcon from '@icons/svgs/closeBtnIcon.svg?react';
import { callLogin, callRegister } from '@apis/authApi';
import { AuthContext } from '@contexts/AuthContext';

const cx = classNames.bind(styles);

function AuthModal({ isOpen, onClose }) {
    const { loginContext } = useContext(AuthContext);
    const [isLoginMode, setIsLoginMode] = useState(true); // Toggle Login/Register

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Xử lý submit
    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (isLoginMode) {
                // --- LOGIN ---
                const res = await callLogin(email, password);
                if (res?.data?.access_token) {
                    localStorage.setItem('access_token', res.data.access_token);
                    loginContext(res.data.user); // Cập nhật Context
                    onClose(); // Đóng modal
                }
            } else {
                // Register

                const res = await callRegister(email, password, name);
                if (res?.data?.id) {
                    alert('Đăng ký thành công! Vui lòng đăng nhập.');
                    setIsLoginMode(true);
                }
            }
        } catch (error) {
            alert(error?.message || 'Có lỗi xảy ra');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')} onClick={e => e.stopPropagation()}>
                <button className={cx('close-btn')} onClick={onClose}>
                    <CloseBtnIcon />
                </button>

                <div className={cx('content')}>
                    <h2>{isLoginMode ? 'Đăng nhập' : 'Đăng ký'}</h2>
                    <form className={cx('form')} onSubmit={handleSubmit}>
                        {!isLoginMode && (
                            <input
                                type='text'
                                placeholder='Họ và tên'
                                className={cx('input')}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        )}
                        <input
                            type='email'
                            placeholder='Email'
                            className={cx('input')}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type='password'
                            placeholder='Mật khẩu'
                            className={cx('input')}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />

                        <button type='submit' className={cx('submit-btn')}>
                            {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
                        </button>
                    </form>

                    <div className={cx('footer')}>
                        <span>
                            {isLoginMode
                                ? 'Chưa có tài khoản? '
                                : 'Đã có tài khoản? '}
                            <strong
                                style={{ cursor: 'pointer' }}
                                onClick={() => setIsLoginMode(!isLoginMode)}
                            >
                                {isLoginMode
                                    ? 'Đăng ký ngay'
                                    : 'Đăng nhập ngay'}
                            </strong>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
