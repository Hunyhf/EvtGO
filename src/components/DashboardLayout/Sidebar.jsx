import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.scss';

const Sidebar = ({ items, collapsed, onLogoClick }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside
            className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
        >
            <div
                className={styles.logoArea}
                onClick={onLogoClick || (() => navigate('/'))}
            >
                <img
                    src='https://ticketbox.vn/_next/static/images/logo-for-tet.png'
                    alt='Logo'
                    className={styles.logoImg}
                />
                {!collapsed && <span className={styles.logoText}>EvtGO</span>}
            </div>

            <ul className={styles.navMenu}>
                {items.map(item => (
                    <li
                        key={item.path}
                        className={
                            location.pathname === item.path ? styles.active : ''
                        }
                        onClick={() => navigate(item.path)}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        {!collapsed && (
                            <span className={styles.label}>{item.label}</span>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
