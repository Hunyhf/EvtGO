import { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Nav.module.scss';
// Đảm bảo genresApi được export đúng trong file @apis/genresApi
import { genresApi } from '@apis/genresApi';
import { AuthContext } from '@contexts/AuthContext';
import Cookies from 'js-cookie';

const cx = classNames.bind(styles);

const DEFAULT_GENRES = [
    { id: 1, name: 'Nhạc sống' },
    { id: 2, name: 'Sân khấu và Nghệ thuật' },
    { id: 3, name: 'Thể thao' },
    { id: 4, name: 'Hội thảo và Workshop' },
    { id: 5, name: 'Tham quan và Trải nghiệm' }
];

const slugify = str => {
    if (!str) return '';
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
};

function Nav() {
    const [genres, setGenres] = useState(DEFAULT_GENRES);
    const { isAuthenticated, isLoading } = useContext(AuthContext);

    useEffect(() => {
        const fetchGenres = async () => {
            // Nếu API lấy danh mục là Public (ai cũng xem được), bạn nên bỏ đoạn check token này
            // để khách vãng lai cũng thấy được menu động từ database.
            // Nếu API yêu cầu đăng nhập mới được xem danh mục thì giữ nguyên.
            const token = Cookies.get('access_token');
            if (!token) {
                setGenres(DEFAULT_GENRES);
                return;
            }

            try {
                // --- SỬA LỖI TẠI ĐÂY ---
                // Dùng genresApi thay vì categoryApi
                const res = await genresApi.getAll();

                // Kiểm tra response trả về (tùy cấu trúc backend trả về result hay data)
                if (res && res.result) {
                    setGenres(res.result);
                } else if (res && Array.isArray(res)) {
                    setGenres(res);
                }
            } catch (error) {
                console.warn(
                    '>>> [Nav] Không thể lấy danh mục từ API, sử dụng fallback.'
                );
                // Fallback về danh sách mặc định nếu lỗi
                setGenres(DEFAULT_GENRES);
            }
        };

        fetchGenres();
    }, [isAuthenticated, isLoading]); // Dependency array

    return (
        <nav className={cx('wrapper')}>
            <ul className={cx('navList')}>
                {genres.map(item => (
                    <li key={item.id} className={cx('navItem')}>
                        <NavLink
                            to={`/category?name=${slugify(item.name)}`}
                            className={({ isActive }) =>
                                cx('navLink', { active: isActive })
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
