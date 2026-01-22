import Home from '@pages/User/home.jsx';
import Staff from '@pages/Staff/homeStaff.jsx';
import Category from '@pages/User/category.jsx';
import Profile from '@pages/User/profile.jsx';
import Ticket from '@/pages/User/tickets.jsx';
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
