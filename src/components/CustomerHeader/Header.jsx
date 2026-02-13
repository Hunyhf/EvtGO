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

    // Sử dụng logic từ Custom Hook
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

    // Click ra ngoài để đóng history (Vẫn giữ Ref ở UI để quản lý DOM)
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
                <div className={cx('header__inner')}>
                    <div className={cx('header__logo')}>
                        <Link to='/'>
                            <img
                                className={cx('logo-img', {
                                    'hide-mobile': !isHomePage
                                })}
                                src='https://ticketbox.vn/_next/static/images/logo-for-tet.png'
                                alt='logo'
                            />
                            {!isHomePage && (
                                <span className={cx('back-home-text')}>
                                    ← Về trang chủ
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className={cx('header__right')}>
                        {/* Search Bar */}
                        <div className={cx('header-search')} ref={searchRef}>
                            <div
                                className={cx('header-search__icon')}
                                onClick={() =>
                                    isMobileSearchOpen
                                        ? handleSearch()
                                        : setIsMobileSearchOpen(true)
                                }
                            >
                                <SearchIcon />
                            </div>
                            <input
                                className={cx('header-search__input')}
                                placeholder='Search...'
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onFocus={() => setShowHistory(true)}
                                onKeyDown={e =>
                                    e.key === 'Enter' && handleSearch()
                                }
                            />

                            {/* Dropdown History (Desktop) */}
                            {showHistory && searchHistory.length > 0 && (
                                <div className={cx('search-history')}>
                                    <div
                                        className={cx('search-history__title')}
                                    >
                                        Tìm kiếm gần đây
                                    </div>
                                    <ul className={cx('search-history__list')}>
                                        {searchHistory.map((item, index) => (
                                            <li
                                                key={index}
                                                className={cx(
                                                    'search-history__item'
                                                )}
                                                onClick={() =>
                                                    handleSearch(item)
                                                }
                                            >
                                                <span>{item}</span>
                                                <button
                                                    className={cx(
                                                        'search-history__remove'
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

                            <span className={cx('header__divider')}>|</span>
                            <button
                                type='button'
                                className={cx('header-search__btn')}
                                onClick={handleSearch}
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

                            {isAuthenticated ? (
                                <div className={cx('header-user')}>
                                    <img
                                        className={cx('header-user__avatar')}
                                        src='https://static.ticketbox.vn/avatar.png'
                                        alt='avatar'
                                    />
                                    <span className={cx('header__text--hide')}>
                                        Tài khoản
                                    </span>
                                    <div className={cx('header-user__toggle')}>
                                        <DropDownIcon />
                                    </div>
                                    <div
                                        className={cx('header-user__dropdown')}
                                    >
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
            </header>

            {/* Mobile Search Overlay */}
            {isMobileSearchOpen && (
                <div className={cx('mobile-search-overlay')}>
                    <div className={cx('mobile-search-header')}>
                        <button
                            className={cx('mobile-search-back')}
                            onClick={() => setIsMobileSearchOpen(false)}
                        >
                            ←
                        </button>
                        <input
                            autoFocus
                            className={cx('mobile-search-input')}
                            placeholder='Tìm sự kiện, nghệ sĩ...'
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className={cx('mobile-search-body')}>
                        <div className={cx('search-history__title')}>
                            Tìm kiếm gần đây
                        </div>
                        {searchHistory.length > 0 ? (
                            <ul className={cx('search-history__list')}>
                                {searchHistory.map((item, index) => (
                                    <li
                                        key={index}
                                        className={cx('search-history__item')}
                                        onClick={() => handleSearch(item)}
                                    >
                                        <span>{item}</span>
                                        <button
                                            className={cx(
                                                'search-history__remove'
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
                            <p className={cx('empty-text')}>
                                Bạn chưa tìm kiếm gì gần đây
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Bottom Nav Mobile */}
            <nav className={cx('bottom-nav')}>
                <Link
                    to='/'
                    className={cx('bottom-nav__item', {
                        active: pathname === '/'
                    })}
                >
                    <HomeIcon />
                    <span>Trang chủ</span>
                </Link>
                <Link
                    to='/my-tickets'
                    className={cx('bottom-nav__item', {
                        active: pathname === '/my-tickets'
                    })}
                >
                    <TicketIcon />
                    <span>Vé của tôi</span>
                </Link>
                <Link
                    to='/profile'
                    className={cx('bottom-nav__item', {
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
