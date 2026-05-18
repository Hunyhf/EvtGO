import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import { Link } from 'react-router-dom';
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
                                <Link to='/dieu-khoan-su-dung-cho-khach-hang'>
                                    Điều khoản sử dụng cho khách hàng
                                </Link>
                            </li>
                        </ul>

                        <h3 className={cx('title', 'spacing')}>
                            Dành cho Ban Tổ chức
                        </h3>
                        <ul className={cx('list')}>
                            <li>
                                <Link to='/dieu-khoan-su-dung-cho-ban-to-chuc'>
                                    Điều khoản sử dụng cho ban tổ chức
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 3: Về công ty */}
                    <div className={cx('column')}>
                        <h3 className={cx('title')}>Về công ty chúng tôi</h3>
                        <ul className={cx('list')}>
                            <li>
                                <Link to='/quy-che-hoat-dong'>
                                    Quy chế hoạt động
                                </Link>
                            </li>
                            <li>
                                <Link to='/chinh-sach-bao-mat-thong-tin'>
                                    Chính sách bảo mật thông tin
                                </Link>
                            </li>
                            <li>
                                <Link to='/giai-quyet-tranh-chap-phat-sinh'>
                                    Cơ chế giải quyết tranh chấp/ khiếu nại
                                </Link>
                            </li>
                            <li>
                                <Link to='/chinh-sach-bao-mat-thanh-toan'>
                                    Chính sách bảo mật thanh toán
                                </Link>
                            </li>
                            <li>
                                <Link to='/chinh-sach-kiem-hang'>
                                    Chính sách đổi trả và kiểm hàng
                                </Link>
                            </li>
                            <li>
                                <Link to='/dieu-kien-van-chuyen'>
                                    Điều kiện vận chuyển và giao nhận
                                </Link>
                            </li>
                            <li>
                                <Link to='/phuong-thuc-thanh-toan'>
                                    Phương thức thanh toán
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
