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
    { path: '/my-tickets', component: Ticket },
    { path: '/profile', component: Profile }
];

export { publicRoutes, privateRoutes };
