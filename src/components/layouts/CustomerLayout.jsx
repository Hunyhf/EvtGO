import Header from '@components/CustomerHeader/Header';
import Footer from '@components/Footer/Footer';
import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import { Outlet } from 'react-router-dom';

function CustomerLayout() {
    return (
        <div className='customer-layout'>
            {' '}
            <Header />
            <main className='content'>
                <div className='container'>
                    <Breadcrumb />
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default CustomerLayout;
