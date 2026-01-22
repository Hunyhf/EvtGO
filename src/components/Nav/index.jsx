import classNames from 'classnames/bind';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);
function Nav() {
    return (
        <nav className={cx('nav')}>
            <div className={cx('nav__inner')}>
                <ul className={cx('nav__list')}>
                    <li className={cx('nav__item')}>1</li>
                    <li className={cx('nav__item')}>2</li>
                    <li className={cx('nav__item')}>3</li>
                </ul>
            </div>
        </nav>
    );
}

export default Nav;
