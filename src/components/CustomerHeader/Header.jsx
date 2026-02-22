import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import AuthModal from '@components/AuthModal/AuthModal';
import SearchIcon from '@icons/svgs/searchIcon.svg?react';
import TicketIcon from '@icons/svgs/ticketIcon.svg?react';
import DropDownIcon from '@icons/svgs/dropdownIcon.svg?react';
import UserIcon from '@icons/svgs/userIcon.svg?react';
import LogOutIcon from '@icons/svgs/logOutIcon.svg?react';
import HomeIcon from '@icons/svgs/homeIcon.svg?react';

import { AuthContext } from '@contexts/AuthContext';
import { callLogout } from '@apis/authApi';
import { useSearch } from '@hooks/useSearch';

const cx = classNames.bind(styles);

// Header chính của website (logo, search, user, mobile nav)
function Header() {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { pathname } = useLocation();
    const { isAuthenticated, logoutContext } = useContext(AuthContext);
    const searchRef = useRef(null);

    // Custom hook quản lý logic tìm kiếm + lịch sử
    const {
        searchTerm,
        setSearchTerm,
        searchHistory,
        showHistory,
        setShowHistory,
        isMobileSearchOpen,
        setIsMobileSearchOpen,
        handleSearch,
        removeHistoryItem
    } = useSearch();

    const isHomePage = pathname === '/';

    // Ẩn dropdown search khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = event => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setShowHistory(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowHistory]);

    // Xử lý đăng xuất
    const handleLogout = async () => {
        try {
            await callLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logoutContext();
        }
    };

    return (
        <>
            {/* ===== Header Desktop ===== */}
            <header className={cx('header')}>
                <div className={cx('headerInner')}>
                    {/* Logo + link về trang chủ */}
                    <div className={cx('headerLogo')}>
                        <Link to='/'>
                            <img
                                className={cx('logoImg', {
                                    hideMobile: !isHomePage
                                })}
                                src='https://ticketbox.vn/_next/static/images/logo-for-tet.png'
                                alt='logo'
                            />
                            {!isHomePage && (
                                <span className={cx('backHomeText')}>
                                    ← Về trang chủ
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className={cx('headerRight')}>
                        {/* ===== Search Bar ===== */}
                        <div className={cx('headerSearch')} ref={searchRef}>
                            {/* Icon search (mở mobile search hoặc submit) */}
                            <div
                                className={cx('headerSearchIcon')}
                                onClick={() =>
                                    isMobileSearchOpen
                                        ? handleSearch()
                                        : setIsMobileSearchOpen(true)
                                }
                            >
                                <SearchIcon />
                            </div>

                            {/* Input tìm kiếm */}
                            <input
                                className={cx('headerSearchInput')}
                                placeholder='Search...'
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onFocus={() => setShowHistory(true)}
                                onKeyDown={e =>
                                    e.key === 'Enter' && handleSearch()
                                }
                            />

                            {/* Dropdown lịch sử tìm kiếm */}
                            {showHistory && searchHistory.length > 0 && (
                                <div className={cx('searchHistory')}>
                                    <div className={cx('searchHistoryTitle')}>
                                        Tìm kiếm gần đây
                                    </div>
                                    <ul className={cx('searchHistoryList')}>
                                        {searchHistory.map((item, index) => (
                                            <li
                                                key={index}
                                                className={cx(
                                                    'searchHistoryItem'
                                                )}
                                                onClick={() =>
                                                    handleSearch(item)
                                                }
                                            >
                                                <span>{item}</span>
                                                <button
                                                    className={cx(
                                                        'searchHistoryRemove'
                                                    )}
                                                    onClick={e =>
                                                        removeHistoryItem(
                                                            e,
                                                            item
                                                        )
                                                    }
                                                >
                                                    ✕
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <span className={cx('headerDivider')}>|</span>

                            {/* Nút tìm kiếm */}
                            <button
                                type='button'
                                className={cx('headerSearchBtn')}
                                onClick={handleSearch}
                            >
                                Tìm kiếm
                            </button>
                        </div>

                        {/* ===== Khu vực user / guest ===== */}
                        <div className={cx('headerActions')}>
                            {/* Link vé của tôi */}
                            <Link
                                to='/my-tickets'
                                className={cx('headerTickets')}
                            >
                                <TicketIcon />
                                <span className={cx('textHide')}>
                                    Vé của tôi
                                </span>
                            </Link>

                            {isAuthenticated ? (
                                // ===== Dropdown tài khoản =====
                                <div className={cx('headerUser')}>
                                    <img
                                        className={cx('userAvatar')}
                                        src='https://static.ticketbox.vn/avatar.png'
                                        alt='avatar'
                                    />
                                    <span className={cx('textHide')}>
                                        Tài khoản
                                    </span>
                                    <div className={cx('userToggle')}>
                                        <DropDownIcon />
                                    </div>

                                    <div className={cx('userDropdown')}>
                                        <Link
                                            to='/my-tickets'
                                            className={cx('dropdownItem')}
                                        >
                                            <TicketIcon
                                                className={cx('dropdownIcon')}
                                            />
                                            Vé của tôi
                                        </Link>

                                        <Link
                                            to='/profile'
                                            className={cx('dropdownItem')}
                                        >
                                            <UserIcon
                                                className={cx(
                                                    'dropdownIcon',
                                                    'profileIcon'
                                                )}
                                            />
                                            Thông tin cá nhân
                                        </Link>

                                        <div
                                            className={cx('dropdownItem')}
                                            onClick={handleLogout}
                                        >
                                            <LogOutIcon
                                                className={cx(
                                                    'dropdownIcon',
                                                    'logoutIcon'
                                                )}
                                            />
                                            Đăng xuất
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // ===== Trạng thái chưa đăng nhập =====
                                <div
                                    className={cx('headerGuest')}
                                    onClick={() => setShowAuthModal(true)}
                                >
                                    <span>Đăng nhập</span>
                                    <span className={cx('textHide')}> | </span>
                                    <span className={cx('textHide')}>
                                        Đăng ký
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== Mobile Search Overlay ===== */}
            {isMobileSearchOpen && (
                <div className={cx('mobileSearchOverlay')}>
                    <div className={cx('mobileSearchHeader')}>
                        <button
                            className={cx('mobileSearchBack')}
                            onClick={() => setIsMobileSearchOpen(false)}
                        >
                            ←
                        </button>

                        <input
                            autoFocus
                            className={cx('mobileSearchInput')}
                            placeholder='Tìm sự kiện, nghệ sĩ...'
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    {/* Lịch sử tìm kiếm mobile */}
                    <div className={cx('mobileSearchBody')}>
                        <div className={cx('searchHistoryTitle')}>
                            Tìm kiếm gần đây
                        </div>

                        {searchHistory.length > 0 ? (
                            <ul className={cx('searchHistoryList')}>
                                {searchHistory.map((item, index) => (
                                    <li
                                        key={index}
                                        className={cx('searchHistoryItem')}
                                        onClick={() => handleSearch(item)}
                                    >
                                        <span>{item}</span>
                                        <button
                                            className={cx(
                                                'searchHistoryRemove'
                                            )}
                                            onClick={e =>
                                                removeHistoryItem(e, item)
                                            }
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={cx('emptyText')}>
                                Bạn chưa tìm kiếm gì gần đây
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ===== Bottom Navigation (Mobile) ===== */}
            <nav className={cx('bottomNav')}>
                <Link
                    to='/'
                    className={cx('bottomNavItem', {
                        active: pathname === '/'
                    })}
                >
                    <HomeIcon />
                    <span>Trang chủ</span>
                </Link>

                <Link
                    to='/my-tickets'
                    className={cx('bottomNavItem', {
                        active: pathname === '/my-tickets'
                    })}
                >
                    <TicketIcon />
                    <span>Vé của tôi</span>
                </Link>

                <Link
                    to='/profile'
                    className={cx('bottomNavItem', {
                        active: pathname === '/profile'
                    })}
                >
                    <UserIcon />
                    <span>Tài khoản</span>
                </Link>
            </nav>

            {/* Modal đăng nhập / đăng ký */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    );
}

export default Header;
