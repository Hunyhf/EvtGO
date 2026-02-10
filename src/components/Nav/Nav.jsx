import { NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Nav.module.scss';

const cx = classNames.bind(styles);

const CATEGORIES = [
    { id: 'nhac-song', name: 'Nhạc sống' },
    { id: 'san-khau-nghe-thuat', name: 'Sân khấu và Nghệ thuật' },
    { id: 'the-thao', name: 'Thể thao' },
    { id: 'hoi-thao-workshop', name: 'Hội thảo và Workshop' },
    { id: 'tham-quan-trai-nghiem', name: 'Tham quan và Trải nghiệm' }
];

function Nav() {
    return (
        <nav className={cx('wrapper')}>
            <ul className={cx('nav-list')}>
                {CATEGORIES.map(item => (
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
