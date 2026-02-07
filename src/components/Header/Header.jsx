import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import AuthModal from '@components/AuthModal/AuthModal';
import SearchIcon from '@icons/svgs/searchIcon.svg?react';
import TicketIcon from '@icons/svgs/ticketIcon.svg?react';
import DropDownIcon from '@icons/svgs/dropdownIcon.svg?react';
import UserIcon from '@icons/svgs/userIcon.svg?react';
import LogOutIcon from '@icons/svgs/logOutIcon.svg?react';
// 1. Import AuthContext và API logout
import { AuthContext } from '@contexts/AuthContext';
import { callLogout } from '@apis/authApi';

const cx = classNames.bind(styles);

function Header() {
    const [showAuthModal, setShowAuthModal] = useState(false);

    // 2. Lấy dữ liệu từ Context
    const { isAuthenticated, user, logoutContext } = useContext(AuthContext);

    // 3. Xử lý đăng xuất
    const handleLogout = async () => {
        try {
            await callLogout(); // Gọi API logout (tuỳ chọn, nếu server cần)
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logoutContext(); // Xóa state trong Context và localStorage
        }
    };

    return (
        <header className={cx('header')}>
            <div className={cx('header__inner')}>
                <div className={cx('header__logo')}>
                    <Link to='/'>
                        <img
                            src='https://ticketbox.vn/_next/static/images/logo-for-tet.png'
                            alt='logo'
                        />
                    </Link>
                </div>

                <div className={cx('header__right')}>
                    <div className={cx('header-search')}>
                        <div className={cx('header-search__icon')}>
                            <SearchIcon />
                        </div>

                        <input
                            className={cx('header-search__input')}
                            placeholder='Search...'
                        />

                        <span className={cx('header__divider')}>|</span>

                        <button
                            type='button'
                            className={cx('header-search__btn')}
                        >
                            Tìm kiếm
                        </button>
                    </div>

                    <div className={cx('header__actions')}>
                        <Link
                            to='/my-tickets'
                            className={cx('header__tickets')}
                        >
                            <TicketIcon />
                            <span className={cx('header__text--hide')}>
                                Vé của tôi
                            </span>
                        </Link>

                        {/* 4. Render có điều kiện dựa trên isAuthenticated */}
                        {isAuthenticated ? (
                            <div className={cx('header-user')}>
                                <img
                                    className={cx('header-user__avatar')}
                                    src='https://static.ticketbox.vn/avatar.png' // Có thể thay bằng user.avatar nếu có
                                    alt='avatar'
                                />

                                <span className={cx('header__text--hide')}>
                                    Tài khoản
                                </span>

                                <div className={cx('header-user__toggle')}>
                                    <DropDownIcon />
                                </div>

                                <div className={cx('header-user__dropdown')}>
                                    <Link
                                        to='/my-tickets'
                                        className={cx(
                                            'header-user__dropdown-item'
                                        )}
                                    >
                                        <TicketIcon
                                            className={cx(
                                                'header-user__dropdown-icon'
                                            )}
                                        />
                                        Vé của tôi
                                    </Link>

                                    <Link
                                        to='/profile'
                                        className={cx(
                                            'header-user__dropdown-item'
                                        )}
                                    >
                                        <UserIcon
                                            className={cx(
                                                'header-user__dropdown-icon',
                                                'header-user__dropdown-icon--profile'
                                            )}
                                        />
                                        Thông tin cá nhân
                                    </Link>

                                    <span
                                        className={cx(
                                            'header-user__dropdown-item'
                                        )}
                                        onClick={handleLogout}
                                    >
                                        <LogOutIcon
                                            className={cx(
                                                'header-user__dropdown-icon',
                                                'header-user__dropdown-icon--logout'
                                            )}
                                        />
                                        Đăng xuất
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div
                                className={cx('header__guest')}
                                onClick={() => setShowAuthModal(true)}
                            >
                                <span>Đăng nhập</span>
                                <span className={cx('header__text--hide')}>
                                    |
                                </span>
                                <span className={cx('header__text--hide')}>
                                    Đăng ký
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </header>
    );
}

export default Header;
