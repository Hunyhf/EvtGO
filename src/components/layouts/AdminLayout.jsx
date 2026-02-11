import Header from '@components/Header/Header';
import Footer from '@components/Footer/Footer';
import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
    return (
        <div className='admin-layout'>
            <main className='admin-content'>
                <div className='container'>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
