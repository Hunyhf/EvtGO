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

function Header() {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { pathname } = useLocation();
    const { isAuthenticated, logoutContext } = useContext(AuthContext);
    const searchRef = useRef(null);

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
            <header className={cx('header')}>
                <div className={cx('headerInner')}>
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
                        {/* Search Bar */}
                        <div className={cx('headerSearch')} ref={searchRef}>
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

                            {/* Dropdown History */}
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
                            <button
                                type='button'
                                className={cx('headerSearchBtn')}
                                onClick={handleSearch}
                            >
                                Tìm kiếm
                            </button>
                        </div>

                        <div className={cx('headerActions')}>
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

            {/* Mobile Search Overlay */}
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

            {/* Bottom Nav Mobile */}
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

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    );
}

export default Header;
