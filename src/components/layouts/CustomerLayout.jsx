import Header from '@components/CustomerHeader/Header';
import Footer from '@components/Footer/Footer';
import Breadcrumb from '@components/BreadCrumb/Breadcrumb';
import Chatbot from '@components/Chatbot/Chatbot';
import { Outlet, useLocation } from 'react-router-dom';
function CustomerLayout() {
    const location = useLocation();
    const isGenrePage = location.pathname === '/genre';
    return (
        <div className='customer-layout'>
            {' '}
            <Header />
            <main className='content'>
                <div className='container'>
                    {!isGenrePage && <Breadcrumb />}
                    <Outlet />
                    <Chatbot />
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default CustomerLayout;
