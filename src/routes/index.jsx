import Home from '@pages/user/home.jsx';
import Staff from '@pages/staff/homeStaff.jsx';
import Category from '@pages/user/category.jsx';
import Profile from '@pages/user/profile.jsx';
// Các router ko cần đăng nhập vào app

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/staff', component: Staff },
    { path: '/category', component: Category },
    { path: '/profile', component: Profile, layout: null }
];
// Các router sau khi đã đăng nhập vào app

const privateRoutes = [];

export { publicRoutes, privateRoutes };
