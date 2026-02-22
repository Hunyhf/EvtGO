import { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Nav.module.scss';
// Đảm bảo import đúng genresApi (Named import)
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

    // Thêm giá trị mặc định {} phòng trường hợp AuthContext bị undefined
    const { isAuthenticated, isLoading } = useContext(AuthContext) || {};

    useEffect(() => {
        const fetchGenres = async () => {
            // Kiểm tra token
            const token = Cookies.get('access_token');

            // Nếu không có token, dùng danh mục mặc định
            if (!token) {
                setGenres(DEFAULT_GENRES);
                return;
            }

            try {
                // Gọi API lấy danh sách thể loại
                const res = await genresApi.getAll();

                // Kiểm tra cấu trúc trả về từ Backend Spring Boot
                if (res && res.result) {
                    setGenres(res.result);
                } else if (Array.isArray(res)) {
                    setGenres(res);
                }
            } catch (error) {
                console.warn(
                    '>>> [Nav] Lỗi lấy danh mục, dùng mặc định:',
                    error
                );
                setGenres(DEFAULT_GENRES);
            }
        };

        fetchGenres();
    }, [isAuthenticated, isLoading]);

    return (
        <nav className={cx('wrapper')}>
            <ul className={cx('navList')}>
                {genres.map(item => (
                    <li key={item.id} className={cx('navItem')}>
                        <NavLink
                            to={`/genre?id=${item.id}&name=${slugify(item.name)}`}
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
