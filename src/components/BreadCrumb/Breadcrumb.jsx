import { Link, useLocation } from 'react-router-dom';
import { BREADCRUMB_LABELS } from '@/routes'; // Import cái map mới tạo
import classNames from 'classnames/bind';
import styles from './Breadcrumb.module.scss';

const cx = classNames.bind(styles);

function Breadcrumb() {
    const location = useLocation();
    const { pathname } = location;

    // Lấy nhãn dựa trên đường dẫn hiện tại
    const currentLabel = BREADCRUMB_LABELS[pathname];

    // KISS: Nếu không có nhãn hoặc đang ở trang chủ thì không hiện Breadcrumb
    if (!currentLabel || pathname === '/') {
        return null;
    }

    return (
        <nav className={cx('wrapper')}>
            <ul className={cx('list')}>
                <li className={cx('item')}>
                    <Link to='/' className={cx('link')}>
                        Trang chủ
                    </Link>
                    <span className={cx('separator')}> {'>'} </span>
                </li>
                <li className={cx('item')}>
                    <span className={cx('current')}>{currentLabel}</span>
                </li>
            </ul>
        </nav>
    );
}

export default Breadcrumb;
