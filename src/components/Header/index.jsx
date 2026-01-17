import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './styles.module.scss';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function Header() {
    const navigate = useNavigate();

    return (
        <header className={cx('header')}>
            <div className='grid wide'>
                <div className={cx('header__inner')}>
                    {/* LOGO */}
                    <div className={cx('header__logo')}>
                        <Link to='/'>EvtGO</Link>
                    </div>

                    {/* RIGHT BLOCK */}
                    <div className={cx('header__right')}>
                        <div className={cx('header__search')}>
                            <div className={cx('header__search-icon')}>
                                {/* svg 16x16 */}
                            </div>
                            <input
                                className={cx('header__search-input')}
                                placeholder='Search...'
                            />
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
                                Vé của tôi
                            </Link>
                            <span
                                className={cx('header__auth')}
                                onClick={() => navigate('/login')}
                            >
                                Đăng nhập | Đăng ký
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
