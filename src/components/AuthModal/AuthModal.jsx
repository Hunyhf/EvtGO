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
import { ROLE_ID } from '@constants/roles.js';

const cx = classNames.bind(styles);

// Modal dùng cho đăng nhập và đăng ký
function AuthModal({ isOpen, onClose }) {
    const { loginContext } = useContext(AuthContext);
    const navigate = useNavigate();

    // State điều khiển mode hiển thị
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isOrganizerMode, setIsOrganizerMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // State dữ liệu form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});

    // Reset toàn bộ state khi đóng modal
    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setErrors({});
            setShowPassword(false);
            setIsLoginMode(true);
            setIsOrganizerMode(false);
        }
    }, [isOpen]);

    // Reset error và confirm password khi đổi mode
    useEffect(() => {
        setErrors({});
        setConfirmPassword('');
        setShowPassword(false);
        if (isLoginMode) setIsOrganizerMode(false);
    }, [isLoginMode]);

    // Tự động ẩn error sau 3 giây
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const timer = setTimeout(() => {
                setErrors({});
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    // Validate dữ liệu trước khi submit
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

        // Kiểm tra confirm password khi ở mode đăng ký
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

    // Xử lý submit form (login / register)
    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (isLoginMode) {
                // Gọi API đăng nhập
                const res = await callLogin(email, password);
                const data = res?.data || res;

                if (data?.access_token) {
                    const { user, access_token } = data;
                    await loginContext(user, access_token);
                    onClose();
                }
            } else {
                // Gọi API đăng ký
                const defaultName = email.split('@')[0];
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
                    setIsLoginMode(true);
                    setIsOrganizerMode(false);
                    setPassword('');
                    setConfirmPassword('');
                }
            }
        } catch (error) {
            // Xử lý lỗi từ server
            const serverMessage =
                error?.response?.data?.message || error?.message;

            if (serverMessage?.toLowerCase().includes('email')) {
                setErrors({ ...errors, email: 'Email này đã được sử dụng' });
            } else {
                setErrors({
                    ...errors,
                    common: isLoginMode
                        ? 'Tài khoản hoặc mật khẩu chưa chính xác'
                        : serverMessage || 'Đăng ký không thành công'
                });
            }
        }
    };

    // Không render khi modal đóng
    if (!isOpen) return null;

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')} onClick={e => e.stopPropagation()}>
                {/* Nút đóng modal */}
                <button className={cx('closeBtn')} onClick={onClose}>
                    <CloseBtnIcon />
                </button>

                <div className={cx('content')}>
                    {/* Tiêu đề theo mode */}
                    <h2>
                        {isLoginMode
                            ? 'Đăng nhập'
                            : isOrganizerMode
                              ? 'Đăng ký Organizer'
                              : 'Đăng ký'}
                    </h2>

                    {/* Form đăng nhập / đăng ký */}
                    <form
                        className={cx('form')}
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        {/* Input email */}
                        <div className={cx('inputGroup')}>
                            <input
                                type='email'
                                placeholder='Email'
                                className={cx('input', {
                                    inputError: errors.email
                                })}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                            {errors.email && (
                                <span className={cx('errorMsg')}>
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        {/* Input password */}
                        <div className={cx('inputGroup')}>
                            <div className={cx('passwordWrapper')}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Mật khẩu'
                                    className={cx('input', {
                                        inputError: errors.password
                                    })}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <span
                                    className={cx('toggleIcon')}
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
                                <span className={cx('errorMsg')}>
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        {/* Confirm password khi đăng ký */}
                        {!isLoginMode && (
                            <div className={cx('inputGroup')}>
                                <div className={cx('passwordWrapper')}>
                                    <input
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        placeholder='Nhập lại mật khẩu'
                                        className={cx('input', {
                                            inputError: errors.confirmPassword
                                        })}
                                        value={confirmPassword}
                                        onChange={e =>
                                            setConfirmPassword(e.target.value)
                                        }
                                    />
                                    <span
                                        className={cx('toggleIcon')}
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
                                    <span className={cx('errorMsg')}>
                                        {errors.confirmPassword}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Lỗi chung */}
                        {errors.common && (
                            <div className={cx('errorMsg', 'center')}>
                                {errors.common}
                            </div>
                        )}

                        <button type='submit' className={cx('submitBtn')}>
                            {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
                        </button>
                    </form>

                    {/* Footer chuyển mode */}
                    <div className={cx('footer')}>
                        {isLoginMode && (
                            <div className={cx('organizerLink')}>
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
