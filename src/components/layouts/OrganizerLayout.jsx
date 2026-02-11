import Header from '@components/Header/Header';
import Footer from '@components/Footer/Footer';
import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import { Outlet } from 'react-router-dom'; // TƯ DUY SENIOR: Dùng Outlet để render con

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
