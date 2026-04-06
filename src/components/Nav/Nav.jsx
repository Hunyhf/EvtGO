import { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Nav.module.scss';
import { genresApi } from '@apis/genresApi';
import { AuthContext } from '@contexts/AuthContext';
import { slugify } from '@utils/stringUtils';

const cx = classNames.bind(styles);

// Giữ lại làm fallback khi API lỗi
const DEFAULT_GENRES = [
    { id: 1, name: 'Nhạc sống' },
    { id: 2, name: 'Sân khấu và Nghệ thuật' },
    { id: 3, name: 'Thể thao' },
    { id: 4, name: 'Hội thảo và Workshop' },
    { id: 5, name: 'Tham quan và Trải nghiệm' }
];

function Nav() {
    const [genres, setGenres] = useState(DEFAULT_GENRES);
    const { isAuthenticated } = useContext(AuthContext) || {};

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                // Luôn gọi API để lấy dữ liệu mới nhất từ Database
                const res = await genresApi.getAll();

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
                // Chỉ dùng danh sách cứng khi API gặp lỗi thực sự
                setGenres(DEFAULT_GENRES);
            }
        };

        fetchGenres();
    }, [isAuthenticated]); // Re-fetch khi trạng thái đăng nhập thay đổi để đồng bộ

    return (
        <nav className={cx('wrapper')}>
            <ul className={cx('navList')}>
                {genres.map(item => (
                    <li key={item.id} className={cx('navItem')}>
                        <NavLink
                            to={`/genre/${item.slug || slugify(item.name)}`}
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
