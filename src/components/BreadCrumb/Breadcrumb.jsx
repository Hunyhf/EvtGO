// src/components/Breadcrumb/Breadcrumb.jsx
import { Link, useLocation } from 'react-router-dom';
import { privateRoutes } from '@/routes';
import classNames from 'classnames/bind';
import styles from './Breadcrumb.module.scss';

const cx = classNames.bind(styles);

function Breadcrumb() {
    const location = useLocation();

    const currentPrivateRoute = privateRoutes.find(
        route => route.path === location.pathname
    );

    if (!currentPrivateRoute) {
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
                    <span className={cx('current')}>
                        {currentPrivateRoute.label}
                    </span>
                </li>
            </ul>
        </nav>
    );
}

export default Breadcrumb;
