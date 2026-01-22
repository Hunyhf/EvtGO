import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import SearchIcon from '@/assets/icons/svgs/searchIcon.svg?react';
import TicketIcon from '@/assets/icons/svgs/ticketIcon.svg?react';
import DropDownIcon from '@/assets/icons/svgs/dropdownIcon.svg?react';
import UserIcon from '@/assets/icons/svgs/userIcon.svg?react';
import LogOutIcon from '@/assets/icons/svgs/logOutIcon.svg?react';

const cx = classNames.bind(styles);

function Header() {
    const navigate = useNavigate();

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
                        <div
                            className={cx('header__guest')}
                            onClick={() => navigate('/login')}
                        >
                            <span>Đăng nhập</span>
                            <span className={cx('header__text--hide')}>|</span>
                            <span className={cx('header__text--hide')}>
                                Đăng ký
                            </span>
                        </div>{' '}
                        {/* <div className={cx('header-user')}>
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

                            <div className={cx('header-user__dropdown')}>
                                <span
                                    className={cx('header-user__dropdown-item')}
                                >
                                    <TicketIcon
                                        className={cx(
                                            'header-user__dropdown-icon'
                                        )}
                                    />
                                    Vé của tôi
                                </span>

                                <span
                                    className={cx('header-user__dropdown-item')}
                                >
                                    <UserIcon
                                        className={cx(
                                            'header-user__dropdown-icon',
                                            'header-user__dropdown-icon--profile'
                                        )}
                                    />
                                    Thông tin cá nhân
                                </span>

                                <span
                                    className={cx('header-user__dropdown-item')}
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
                        </div> */}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
