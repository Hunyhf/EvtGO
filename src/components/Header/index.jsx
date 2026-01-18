import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './styles.module.scss';
import { useNavigate } from 'react-router-dom';
import searchIcon from '@/assets/icons/svgs/searchIcon.svg';
import ticketIcon from '@/assets/icons/svgs/ticketIcon.svg';
const cx = classNames.bind(styles);

function Header() {
    const navigate = useNavigate();

    return (
        <header className={cx('header')}>
            <div className={cx('grid', 'wide')}>
                <div className={cx('header__inner')}>
                    {/* LOGO */}
                    <div className={cx('header__logo')}>
                        <Link to='/'>EvtGO</Link>
                    </div>

                    {/* RIGHT BLOCK */}
                    <div className={cx('header__right')}>
                        <div className={cx('header__search')}>
                            <div className={cx('header__search-icon')}>
                                <img src={searchIcon} alt='Search Icon' />
                            </div>
                            <input
                                className={cx('header__search-input')}
                                placeholder='Search...'
                            />{' '}
                            <span className={cx('header__search-divider')}>
                                |
                            </span>
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
                                <img src={ticketIcon} alt='Ticket Icon' />
                                <span className={cx('header__text-hidable')}>
                                    Vé của tôi
                                </span>
                            </Link>
                            <div
                                className={cx('header__auth')}
                                onClick={() => navigate('/login')}
                            >
                                <span>Đăng nhập</span>
                                <span className={cx('header__divider')}>|</span>
                                <span className={cx('header__text-hidable')}>
                                    Đăng ký
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
