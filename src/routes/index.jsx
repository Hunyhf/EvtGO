import Home from '@/pages/user/Home.jsx';
import Staff from '@/pages/staff/Staff.jsx';
import Category from '@/pages/user/Category.jsx';
import Profile from '@/pages/user/Profile.jsx';
import Ticket from '@/pages/user/Tickets.jsx';
// Các router ko cần đăng nhập vào app

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/staff', component: Staff },
    { path: '/category', component: Category },
    { path: '/my-tickets', component: Ticket },
    { path: '/profile', component: Profile, layout: null }
];
// Các router sau khi đã đăng nhập vào app

const privateRoutes = [];

export { publicRoutes, privateRoutes };
