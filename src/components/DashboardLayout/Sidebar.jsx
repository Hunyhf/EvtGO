import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';

const cx = classNames.bind(styles);

const Sidebar = ({ items, collapsed, onLogoClick }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className={cx('sidebar', { collapsed })}>
            <div
                className={cx('logoArea')}
                onClick={onLogoClick || (() => navigate('/organizer/events'))}
            >
                <img
                    src='https://ticketbox.vn/_next/static/images/logo-for-tet.png'
                    alt='Logo'
                    className={cx('logoImg')}
                />
            </div>

            <ul className={cx('navMenu')}>
                {items.map(item => (
                    <li
                        key={item.path}
                        className={cx('menuItem', {
                            active: location.pathname === item.path
                        })}
                        onClick={() => navigate(item.path)}
                    >
                        <span className={cx('icon')}>{item.icon}</span>
                        {!collapsed && (
                            <span className={cx('label')}>{item.label}</span>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
