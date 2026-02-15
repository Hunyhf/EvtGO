import { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Nav.module.scss';
import categoryApi from '@apis/categoryApi';
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
            if (isLoading) return;

            const token = Cookies.get('access_token');
            if (!token) {
                setGenres(DEFAULT_GENRES);
                return;
            }

            try {
                const res = await categoryApi.getAll();

                if (res && (res.result || Array.isArray(res))) {
                    setGenres(res.result || res);
                }
            } catch (error) {
                console.warn(
                    '>>> [Nav] Không thể lấy danh mục từ API, sử dụng fallback.'
                );
                setGenres(DEFAULT_GENRES);
            }
        };

        fetchGenres();
    }, [isAuthenticated, isLoading]);

    return (
        <nav className={cx('wrapper')}>
            <ul className={cx('navList')}>
                {' '}
                {/* Đổi từ nav-list */}
                {genres.map(item => (
                    <li key={item.id} className={cx('navItem')}>
                        {' '}
                        {/* Đổi từ nav-item */}
                        <NavLink
                            to={`/category?name=${slugify(item.name)}`}
                            className={
                                ({ isActive }) =>
                                    cx('navLink', { active: isActive }) // Đổi từ nav-link
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
