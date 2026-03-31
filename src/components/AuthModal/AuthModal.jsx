import { useState, useContext, useEffect } from 'react';
import { App as AntdApp } from 'antd';
import classNames from 'classnames/bind';
import styles from './AuthModal.module.scss';
import CloseBtnIcon from '@icons/svgs/closeBtnIcon.svg?react';
import UnHidePassIcon from '@icons/svgs/unHidePassIcon.svg?react';
import HidePassIcon from '@icons/svgs/hidePassIcon.svg?react';
import { callLogin, callRegister } from '@apis/authApi';
import { AuthContext } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROLE_ID } from '@constants/roles.js';
import { isValidEmail } from '@utils/validation';

const cx = classNames.bind(styles);

function AuthModal({ isOpen, onClose }) {
    // Lấy context đăng nhập
    const { loginContext } = useContext(AuthContext);

    // Điều hướng trang
    const navigate = useNavigate();

    // Hiển thị message từ Ant Design
    const { message } = AntdApp.useApp();

    // State điều khiển chế độ login/register
    const [isLoginMode, setIsLoginMode] = useState(true);

    // State xác định đăng ký organizer hay user thường
    const [isOrganizerMode, setIsOrganizerMode] = useState(false);

    // State hiển thị/ẩn mật khẩu
    const [showPassword, setShowPassword] = useState(false);

    // State lưu dữ liệu form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State lưu lỗi validation
    const [errors, setErrors] = useState({});

    // Reset toàn bộ form khi đóng modal
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

    // Reset lỗi và trạng thái khi chuyển mode
    useEffect(() => {
        setErrors({});
        setConfirmPassword('');
        setShowPassword(false);
        if (isLoginMode) setIsOrganizerMode(false);
    }, [isLoginMode]);

    // Xóa lỗi chung khi user nhập lại dữ liệu
    useEffect(() => {
        if (errors.common) {
            setErrors(prev => {
                const { common, ...rest } = prev;
                return rest;
            });
        }
    }, [email, password]);

    // Tự động ẩn lỗi sau 3 giây
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const timer = setTimeout(() => {
                setErrors({});
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    // Validate dữ liệu form trước khi submit
    const validateForm = () => {
        let newErrors = {};

        if (!email) {
            newErrors.email = 'Email không được để trống';
        } else if (!isValidEmail(email)) {
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

    // Xử lý submit form login/register
    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;

        const submitEmail = email.trim();
        const submitPassword = password;

        try {
            if (isLoginMode) {
                // Gọi API đăng nhập
                const res = await callLogin(submitEmail, submitPassword);
                const data = res?.data || res;

                if (data?.access_token) {
                    const { user, access_token } = data;

                    // Kiểm tra email trả về
                    if (user.email !== submitEmail) {
                        setErrors({
                            ...errors,
                            common: 'Tài khoản hoặc mật khẩu chưa chính xác'
                        });
                        return;
                    }

                    // Lưu thông tin đăng nhập vào context
                    await loginContext(user, access_token);
                    onClose();
                }
            } else {
                // Xử lý đăng ký
                const defaultName = submitEmail.split('@')[0];

                const roleToRegister = isOrganizerMode
                    ? ROLE_ID.ORGANIZER
                    : ROLE_ID.CUSTOMER;

                const res = await callRegister(
                    submitEmail,
                    submitPassword,
                    defaultName,
                    roleToRegister
                );

                if (res) {
                    message.success('Đăng ký thành công! Vui lòng đăng nhập');
                    setIsLoginMode(true);
                    setIsOrganizerMode(false);
                    setPassword('');
                    setConfirmPassword('');
                }
            }
        } catch (error) {
            const serverMessage =
                error?.response?.data?.message || error?.message;

            if (isLoginMode) {
                // Lỗi đăng nhập
                setErrors({
                    ...errors,
                    common: 'Tài khoản hoặc mật khẩu chưa chính xác'
                });
            } else {
                // Lỗi đăng ký
                if (serverMessage?.toLowerCase().includes('email')) {
                    setErrors({
                        ...errors,
                        email: 'Email này đã được sử dụng'
                    });
                } else {
                    setErrors({
                        ...errors,
                        common: serverMessage || 'Đăng ký không thành công'
                    });
                }
            }
        }
    };

    // Không render nếu modal đóng
    if (!isOpen) return null;

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')} onClick={e => e.stopPropagation()}>
                <button className={cx('closeBtn')} onClick={onClose}>
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

                        {/* Input mật khẩu */}
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

                        {/* Input xác nhận mật khẩu khi đăng ký */}
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

                        {/* Hiển thị lỗi chung */}
                        {errors.common && (
                            <div className={cx('errorMsg', 'center')}>
                                {errors.common}
                            </div>
                        )}

                        <button type='submit' className={cx('submitBtn')}>
                            {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
                        </button>
                    </form>

                    <div className={cx('footer')}>
                        {/* Link đăng ký organizer */}
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

                        {/* Chuyển đổi giữa login và register */}
                        <span className={cx('switchModeBtn')}>
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
