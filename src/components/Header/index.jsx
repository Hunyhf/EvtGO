import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './styles.module.scss';
import SearchIcon from '@/assets/icons/svgs/searchIcon.svg?react';
import TicketIcon from '@/assets/icons/svgs/ticketIcon.svg?react';
import DropDownIcon from '@/assets/icons/svgs/dropdownIcon.svg?react';
const cx = classNames.bind(styles);

function Header() {
    const navigate = useNavigate();

    return (
        <header className={cx('header')}>
            <div className={cx('header__inner')}>
                <div className={cx('header__logo')}>
                    <Link to='/'>EvtGO</Link>
                </div>

                <div className={cx('header__right')}>
                    <div className={cx('header__search')}>
                        <div className={cx('header__search-icon')}>
                            <SearchIcon />
                        </div>
                        <input
                            className={cx('header__search-input')}
                            placeholder='Search...'
                        />
                        <span className={cx('header__search-divider')}>|</span>
                        <button
                            type='button'
                            className={cx('header__search-btn')}
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
                        {/* <div
                            className={cx('header__guest')}
                            onClick={() => navigate('/login')}
                        >
                            <span>Đăng nhập</span>
                            <span className={cx('header__divider')}>|</span>
                            <span className={cx('header__text--hide')}>
                                Đăng ký
                            </span>
                        </div>{' '} */}
                        <div className={cx('header__user')}>
                            <img
                                src='https://static.ticketbox.vn/avatar.png'
                                alt='avatar'
                            />
                            Tài khoản
                            <div className={cx('header__user-dropdown-icon')}>
                                <DropDownIcon />
                            </div>
                            <div className={cx('header__user-dropdown')}>
                                {' '}
                                <span
                                    className={cx('header__user-dropdown-item')}
                                >
                                    <TicketIcon />
                                    Vé của tôi
                                </span>
                                <div
                                    className={cx('header__user-dropdown-item')}
                                >
                                    <span>Thông tin cá nhân</span>
                                </div>
                                <div
                                    className={cx('header__user-dropdown-item')}
                                >
                                    <span>Đăng xuất</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
