import Home from '@pages/customer/Home/Home.jsx';
import Staff from '@pages/staff/Staff.jsx';
import Category from '@pages/customer/Category.jsx';
import Profile from '@pages/customer/Profile/Profile.jsx';
import Ticket from '@pages/customer/Ticket/Ticket.jsx';
import NotFound from '@pages/customer/NotFound/NotFound';
const publicRoutes = [
    { path: '/', component: Home },
    { path: '/category', component: Category },
    { path: '/404', component: NotFound, layout: null },
    { path: '*', component: NotFound, layout: null }
];

// Route cần đăng nhập mới vào được
const privateRoutes = [
    // Label là các tên hiển thị của breadcrum
    { path: '/my-tickets', component: Ticket, label: 'Vé của tôi' },
    { path: '/profile', component: Profile, label: 'Hồ sơ cá nhân' }
];

export { publicRoutes, privateRoutes };
