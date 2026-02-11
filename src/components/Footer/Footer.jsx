import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
const cx = classNames.bind(styles);

function Footer() {
    return (
        <footer className={cx('footer-container')}>
            <div className={cx('content')}>FOOTER</div>
        </footer>
    );
}

export default Footer;
