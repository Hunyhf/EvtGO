import classNames from 'classnames/bind';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);
function Nav() {
    return (
        <nav className={cx('grid', 'nav')}>
            <div className={cx('grid', 'wide', 'nav-item')}>
                <ul>
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
                    <li>4</li>
                </ul>
            </div>
        </nav>
    );
}

export default Nav;
