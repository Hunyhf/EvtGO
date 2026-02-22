import { Link, useLocation } from 'react-router-dom';
import { BREADCRUMB_LABELS } from '@/routes';
import classNames from 'classnames/bind';
import styles from './Breadcrumb.module.scss';

const cx = classNames.bind(styles);

// Component hiển thị breadcrumb theo đường dẫn hiện tại
function Breadcrumb() {
    const location = useLocation();
    const { pathname } = location;

    // Lấy label tương ứng với pathname
    const currentLabel = BREADCRUMB_LABELS[pathname];

    // Không hiển thị nếu không có label hoặc đang ở trang chủ
    if (!currentLabel || pathname === '/') {
        return null;
    }

    return (
        <nav className={cx('wrapper')}>
            <ul className={cx('list')}>
                {/* Link về trang chủ */}
                <li className={cx('item')}>
                    <Link to='/' className={cx('link')}>
                        Trang chủ
                    </Link>
                    <span className={cx('separator')}> {'>'} </span>
                </li>

                {/* Trang hiện tại */}
                <li className={cx('item')}>
                    <span className={cx('current')}>{currentLabel}</span>
                </li>
            </ul>
        </nav>
    );
}

export default Breadcrumb;
