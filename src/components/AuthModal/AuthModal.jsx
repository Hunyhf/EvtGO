import { useState, useContext, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './AuthModal.module.scss';
import CloseBtnIcon from '@icons/svgs/closeBtnIcon.svg?react';
import { callLogin, callRegister } from '@apis/authApi';
import { AuthContext } from '@contexts/AuthContext';

const cx = classNames.bind(styles);

function AuthModal({ isOpen, onClose }) {
    const { loginContext } = useContext(AuthContext);
    // Thay đổi từ headear guest thành header user
    const [isLoginMode, setIsLoginMode] = useState(true);
    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});

    // Reset lỗi khi chuyển đổi giữa Đăng nhập/Đăng ký
    useEffect(() => {
        setErrors({});
        setConfirmPassword('');
    }, [isLoginMode]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const timer = setTimeout(() => {
                setErrors({});
            }, 3000); // 3 giây

            return () => clearTimeout(timer); // Dọn dẹp timer nếu component unmount hoặc errors thay đổi
        }
    }, [errors]);

    const validateForm = () => {
        let newErrors = {};

        // Kiểm tra Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = 'Email không được để trống';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Định dạng email không hợp lệ';
        }

        // Kiểm tra Mật khẩu
        if (!password) {
            newErrors.password = 'Mật khẩu không được để trống';
        } else if (password.length < 8) {
            newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
        }
        // Kiểm tra Mật khẩu xác nhận (Chỉ kiểm tra khi ở chế độ Đăng ký)
        if (!isLoginMode) {
            if (!confirmPassword) {
                newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            } else if (password !== confirmPassword) {
                newErrors.confirmPassword = 'Mật khẩu không trùng khớp';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
    };
    // Xử lý submit

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            if (isLoginMode) {
                // Login
                const res = await callLogin(email, password);
                if (res?.data?.access_token) {
                    localStorage.setItem('access_token', res.data.access_token);
                    loginContext(res.data.user); // Cập nhật Context
                    onClose(); // Đóng modal
                }
            } else {
                // Register
                const res = await callRegister(email, password);
                if (res?.data?.id) {
                    alert('Đăng ký thành công! Vui lòng đăng nhập.');
                    setIsLoginMode(true);
                }
            }
        } catch (error) {
            if (error?.message?.includes('email')) {
                setErrors({
                    ...errors,
                    email: 'Email này đã được sử dụng'
                });
            } else {
                setErrors({
                    ...errors,
                    common: 'Mật khẩu hoặc tài khoản không chính xác, vui lòng nhập lại'
                });
            }
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
                    <form
                        className={cx('form')}
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <div className={cx('input-group')}>
                            <input
                                type='email'
                                placeholder='Email'
                                className={cx('input', {
                                    'input-error': errors.email
                                })}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                            {errors.email && (
                                <span className={cx('error-msg')}>
                                    {errors.email}
                                </span>
                            )}
                        </div>
                        <div className={cx('input-group')}>
                            <input
                                type='password'
                                placeholder='Mật khẩu'
                                className={cx('input', {
                                    'input-error': errors.password
                                })}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            {errors.password && (
                                <span className={cx('error-msg')}>
                                    {errors.password}
                                </span>
                            )}
                        </div>
                        {!isLoginMode && (
                            <div className={cx('input-group')}>
                                <input
                                    type='password'
                                    placeholder='Nhập lại mật khẩu'
                                    className={cx('input', {
                                        'input-error': errors.confirmPassword
                                    })}
                                    value={confirmPassword}
                                    onChange={e =>
                                        setConfirmPassword(e.target.value)
                                    }
                                />
                                {errors.confirmPassword && (
                                    <span className={cx('error-msg')}>
                                        {errors.confirmPassword}
                                    </span>
                                )}
                            </div>
                        )}
                        {errors.common && (
                            <div className={cx('error-msg', 'center')}>
                                {errors.common}
                            </div>
                        )}
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
