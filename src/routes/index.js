import Home from '@pages/user/Home.jsx';
import Staff from '@pages/staff/Staff.jsx';
import Category from '@pages/user/Category.jsx';
import Profile from '@pages/user/Profile.jsx';
import Ticket from '@pages/user/Tickets.jsx';

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/category', component: Category }
];

// Route cần đăng nhập mới vào được
const privateRoutes = [
    // Label là các tên hiển thị của breadcrum
    { path: '/my-tickets', component: Ticket, label: 'Vé của tôi' },
    { path: '/profile', component: Profile, label: 'Hồ sơ cá nhân' }
];

export { publicRoutes, privateRoutes };
