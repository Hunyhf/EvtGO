import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Nav.module.scss';
import categoryApi from '@apis/categoryApi';

const cx = classNames.bind(styles);

// Dữ liệu dự phòng khi API bị lỗi 403 hoặc không có dữ liệu
const FALLBACK_CATEGORIES = [
    { id: 1, name: 'Nhạc sống' },
    { id: 2, name: 'Sân khấu và Nghệ thuật' },
    { id: 3, name: 'Thể thao' },
    { id: 4, name: 'Hội thảo và Workshop' },
    { id: 5, name: 'Tham quan và Trải nghiệm' }
];

function Nav() {
    // Khởi tạo state với danh sách dự phòng để Nav luôn có dữ liệu hiển thị
    const [genres, setGenres] = useState(FALLBACK_CATEGORIES);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await categoryApi.getAll();
                // Nếu gọi API thành công, cập nhật lại dữ liệu thật từ DB
                if (res?.data?.result) {
                    setGenres(res.data.result);
                }
            } catch (error) {
                // Khi lỗi 403 xảy ra, code sẽ rơi vào đây
                // Chúng ta giữ nguyên dữ liệu FALLBACK_CATEGORIES đã set ở useState
                console.warn(
                    'Backend đang chặn API (403). FE đang hiển thị dữ liệu dự phòng.'
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
                            to={`/category/${item.id}`}
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
