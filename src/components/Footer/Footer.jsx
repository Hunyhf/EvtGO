import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
const cx = classNames.bind(styles);

function Footer() {
    return (
        <footer className={cx('footerContainer')}>
            <div className={cx('content')}>
                <div className={cx('grid')}>
                    {/* Cột 1: Thông tin liên hệ */}
                    <div className={cx('column')}>
                        <h3 className={cx('title')}>Hotline</h3>
                        <p className={cx('text')}>
                            Thứ 2 - Chủ Nhật (8:00 - 23:00)
                        </p>
                        <p className={cx('highlight')}>1900.6408</p>

                        <h3 className={cx('title', 'spacing')}>Email</h3>
                        <p className={cx('text')}>evtgo.support@gmail.com</p>

                        <h3 className={cx('title', 'spacing')}>
                            Văn phòng chính
                        </h3>
                        <p className={cx('text')}>
                            613 Âu Cơ, Phú Trung, Tân Phú, Hồ Chí Minh
                        </p>
                    </div>

                    {/* Cột 2: Dành cho Khách hàng */}
                    <div className={cx('column')}>
                        <h3 className={cx('title')}>Dành cho Khách hàng</h3>
                        <ul className={cx('list')}>
                            <li>
                                <a href='#'>
                                    Điều khoản sử dụng cho khách hàng
                                </a>
                            </li>
                        </ul>

                        <h3 className={cx('title', 'spacing')}>
                            Dành cho Ban Tổ chức
                        </h3>
                        <ul className={cx('list')}>
                            <li>
                                <a href='#'>
                                    Điều khoản sử dụng cho ban tổ chức
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 3: Về công ty */}
                    <div className={cx('column')}>
                        <h3 className={cx('title')}>Về công ty chúng tôi</h3>
                        <ul className={cx('list')}>
                            <li>
                                <a href='#'>Quy chế hoạt động</a>
                            </li>
                            <li>
                                <a href='#'>Chính sách bảo mật thông tin</a>
                            </li>
                            <li>
                                <a href='#'>
                                    Cơ chế giải quyết tranh chấp/ khiếu nại
                                </a>
                            </li>
                            <li>
                                <a href='#'>Chính sách bảo mật thanh toán</a>
                            </li>
                            <li>
                                <a href='#'>Chính sách đổi trả và kiểm hàng</a>
                            </li>
                            <li>
                                <a href='#'>
                                    Điều kiện vận chuyển và giao nhận
                                </a>
                            </li>
                            <li>
                                <a href='#'>Phương thức thanh toán</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
