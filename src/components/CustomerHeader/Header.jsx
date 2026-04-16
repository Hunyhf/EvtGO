import { useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import AuthModal from '@components/AuthModal/AuthModal';
import SearchIcon from '@icons/svgs/searchIcon.svg?react';
import TicketIcon from '@icons/svgs/ticketIcon.svg?react';
import DropDownIcon from '@icons/svgs/dropdownIcon.svg?react';
import UserIcon from '@icons/svgs/userIcon.svg?react';
import LogOutIcon from '@icons/svgs/logOutIcon.svg?react';
import HomeIcon from '@icons/svgs/homeIcon.svg?react';

import logo from '@images/logo.png';
import { AuthContext } from '@contexts/AuthContext';
import { callLogout } from '@apis/authApi';
import { useSearch } from '@hooks/useSearch';
import useModal from '@hooks/useModal';
import { getAvatarUrl } from '@utils/imageHelper';

const cx = classNames.bind(styles);

function Header() {
    // Sử dụng hook useModal để quản lý AuthModal
    const {
        isOpen: showAuthModal,
        open: openAuthModal,
        close: closeAuthModal
    } = useModal(false);

    // Lấy đường dẫn hiện tại
    const { pathname } = useLocation();
    const navigate = useNavigate();

    // Lấy thông tin xác thực người dùng từ Context
    const { isAuthenticated, user, logoutContext } = useContext(AuthContext);

    // Ref để xử lý click outside của search
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

    /**
     * Đóng dropdown search khi click ra ngoài
     */
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

    /**
     * Xử lý đăng xuất
     */
    const handleLogout = async () => {
        try {
            await callLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logoutContext();
        }
    };

    /**
     * Xử lý các action yêu cầu đăng nhập
     */
    const handleProtectedAction = (e, targetPath) => {
        if (!isAuthenticated) {
            e.preventDefault();
            openAuthModal();
        } else if (targetPath) {
            navigate(targetPath);
        }
    };

    return (
        <>
            {/* Header Desktop */}
            <header className={cx('header')}>
                <div className={cx('headerInner')}>
                    <div className={cx('headerLogo')}>
                        <Link to='/'>
                            <img
                                className={cx('logoImg', {
                                    hideMobile: !isHomePage
                                })}
                                src={logo}
                                alt='logo'
                            />
                            {!isHomePage && (
                                <span className={cx('backHomeText')}>
                                    Về trang chủ
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

                        {/* Actions */}
                        <div className={cx('headerActions')}>
                            <Link
                                to={isAuthenticated ? '/my-tickets' : '#'}
                                className={cx('headerTickets')}
                                onClick={e => handleProtectedAction(e)}
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
                                        src={getAvatarUrl(user.id, user.avatar)}
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
                                    onClick={openAuthModal} // Sử dụng hàm mở từ hook
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

            {/* Overlay Search (Mobile) */}
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

            {/* Bottom Navigation (Mobile) */}
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
                    to={isAuthenticated ? '/my-tickets' : '#'}
                    className={cx('bottomNavItemTicket', {
                        active: pathname === '/my-tickets'
                    })}
                    onClick={e => handleProtectedAction(e)}
                >
                    <TicketIcon />
                    <span>Vé của tôi</span>
                </Link>

                <Link
                    to={isAuthenticated ? '/profile' : '#'}
                    className={cx('bottomNavItem', {
                        active: pathname === '/profile'
                    })}
                    onClick={e => handleProtectedAction(e)}
                >
                    <UserIcon />
                    <span>Tài khoản</span>
                </Link>
            </nav>

            {/* Modal xác thực sử dụng hook */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={closeAuthModal} 
            />
        </>
    );
}

export default Header;
