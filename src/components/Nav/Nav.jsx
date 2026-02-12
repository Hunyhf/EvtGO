import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Nav.module.scss';
import categoryApi from '@apis/categoryApi';

const cx = classNames.bind(styles);

// Dữ liệu dự phòng khớp với cấu trúc trong Database
const DEFAULT_GENRES = [
    { id: 1, name: 'Nhạc sống' },
    { id: 2, name: 'Sân khấu và Nghệ thuật' },
    { id: 3, name: 'Thể thao' },
    { id: 4, name: 'Hội thảo và Workshop' },
    { id: 5, name: 'Tham quan và Trải nghiệm' }
];

/**
 * Hàm chuyển đổi Tiếng Việt có dấu thành không dấu, thay khoảng trắng bằng gạch nối
 */
const slugify = str => {
    if (!str) return '';
    return str
        .normalize('NFD') // Chuyển về dạng tổ hợp
        .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu phụ
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch nối
        .replace(/[^\w-]+/g, ''); // Xóa ký tự đặc biệt khác
};

function Nav() {
    const [genres, setGenres] = useState(DEFAULT_GENRES);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await categoryApi.getAll();
                // Dữ liệu nằm trong res.data.result theo định dạng của Backend
                if (res?.data?.result) {
                    setGenres(res.data.result);
                }
            } catch (error) {
                console.warn(
                    'API bị chặn (403). Đang hiển thị danh mục mặc định.'
                );
            }
        };
        fetchGenres();
    }, []);

    return (
        <nav className={cx('wrapper')}>
            <ul className={cx('nav-list')}>
                {genres.map(item => (
                    <li key={item.id} className={cx('nav-item')}>
                        <NavLink
                            to={`/category?name=${slugify(item.name)}`}
                            className={({ isActive }) =>
                                cx('nav-link', { active: isActive })
                            }
                        >
                            {item.name}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default Nav;
