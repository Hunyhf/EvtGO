import Header from '@components/Header/Header';
import Footer from '@components/Footer/Footer';
import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import { Outlet } from 'react-router-dom';

function OrganizerLayout() {
    return (
        <div className='organizer-layout'>
            <Header />
            <main className='organizer-content'>
                <div className='container'>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default OrganizerLayout;
