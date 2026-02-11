import { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import classNames from 'classnames/bind';
import styles from './AuthModal.module.scss';
import CloseBtnIcon from '@icons/svgs/closeBtnIcon.svg?react';
import UnHidePassIcon from '@icons/svgs/unHidePassIcon.svg?react';
import HidePassIcon from '@icons/svgs/hidePassIcon.svg?react';
import { callLogin, callRegister } from '@apis/authApi';
import { AuthContext } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROLE_REDIRECT_MAP, ROLE_ID } from '@constants/roles.js';

const cx = classNames.bind(styles);

function AuthModal({ isOpen, onClose }) {
    const { loginContext } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isOrganizerMode, setIsOrganizerMode] = useState(false); // Thêm state quản lý vai trò tổ chức
    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setErrors({});
        setConfirmPassword('');
        setShowPassword(false);
        // Reset mode Organizer nếu quay lại màn hình đăng nhập
        if (isLoginMode) setIsOrganizerMode(false);
    }, [isLoginMode]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const timer = setTimeout(() => {
                setErrors({});
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    const validateForm = () => {
        let newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = 'Email không được để trống';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Định dạng email không hợp lệ';
        }

        if (!password) {
            newErrors.password = 'Mật khẩu không được để trống';
        } else if (password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        if (!isLoginMode) {
            if (!confirmPassword) {
                newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            } else if (password !== confirmPassword) {
                newErrors.confirmPassword = 'Mật khẩu không trùng khớp';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            if (isLoginMode) {
                const res = await callLogin(email, password);
                const data = res?.data || res;
                if (data?.access_token) {
                    const { user, access_token } = data;
                    await loginContext(user, access_token);
                    onClose();
                }
            } else {
                const defaultName = email.split('@')[0];
                // Gán role_id dựa trên chế độ đang chọn (Organizer hoặc Customer)
                const roleToRegister = isOrganizerMode
                    ? ROLE_ID.ORGANIZER
                    : ROLE_ID.CUSTOMER;

                const res = await callRegister(
                    email,
                    password,
                    defaultName,
                    roleToRegister
                );

                if (res) {
                    toast.success(
                        'Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục.'
                    );

                    // CHỈNH SỬA: Không tự động đăng nhập, chuyển về chế độ Login
                    setIsLoginMode(true);
                    setIsOrganizerMode(false);
                    setPassword('');
                    setConfirmPassword('');
                }
            }
        } catch (error) {
            const serverMessage =
                error?.response?.data?.message || error?.message;

            if (serverMessage?.toLowerCase().includes('email')) {
                setErrors({
                    ...errors,
                    email: 'Email này đã được sử dụng hoặc không hợp lệ'
                });
            } else {
                setErrors({
                    ...errors,
                    common: isLoginMode
                        ? 'Tài khoản hoặc mật khẩu chưa chính xác, vui lòng thử lại'
                        : serverMessage ||
                          'Đăng ký không thành công, vui lòng thử lại sau'
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
                    <h2>
                        {isLoginMode
                            ? 'Đăng nhập'
                            : isOrganizerMode
                              ? 'Đăng ký Organizer'
                              : 'Đăng ký'}
                    </h2>

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
                            <div className={cx('password-wrapper')}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Mật khẩu'
                                    className={cx('input', {
                                        'input-error': errors.password
                                    })}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <span
                                    className={cx('toggle-icon')}
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <UnHidePassIcon />
                                    ) : (
                                        <HidePassIcon />
                                    )}
                                </span>
                            </div>
                            {errors.password && (
                                <span className={cx('error-msg')}>
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        {!isLoginMode && (
                            <div className={cx('input-group')}>
                                <div className={cx('password-wrapper')}>
                                    <input
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        placeholder='Nhập lại mật khẩu'
                                        className={cx('input', {
                                            'input-error':
                                                errors.confirmPassword
                                        })}
                                        value={confirmPassword}
                                        onChange={e =>
                                            setConfirmPassword(e.target.value)
                                        }
                                    />
                                    <span
                                        className={cx('toggle-icon')}
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <UnHidePassIcon />
                                        ) : (
                                            <HidePassIcon />
                                        )}
                                    </span>
                                </div>
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
                        {/* Mục Đăng ký dành cho Organizer */}
                        {isLoginMode && (
                            <div className={cx('footer__organizer')}>
                                Bạn muốn tổ chức sự kiện?{' '}
                                <strong
                                    onClick={() => {
                                        setIsLoginMode(false);
                                        setIsOrganizerMode(true);
                                    }}
                                >
                                    Đăng ký ngay
                                </strong>
                            </div>
                        )}

                        <span>
                            {isLoginMode
                                ? 'Chưa có tài khoản? '
                                : 'Đã có tài khoản? '}
                            <strong
                                onClick={() => {
                                    setIsLoginMode(!isLoginMode);
                                    setIsOrganizerMode(false);
                                }}
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
