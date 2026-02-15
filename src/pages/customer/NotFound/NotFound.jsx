import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './NotFound.module.scss';

const cx = classNames.bind(styles);

function NotFound() {
    const navigate = useNavigate();

    return (
        <div className={cx('wrapper')}>
            <h1 className={cx('title')}>404</h1>
            <p className={cx('desc')}>
                Oops! Trang bạn đang tìm kiếm không tồn tại.
            </p>
            <button className={cx('backBtn')} onClick={() => navigate('/')}>
                Quay lại Trang chủ
            </button>
        </div>
    );
}

export default NotFound;
