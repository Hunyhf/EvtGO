import Header from '@components/Header/Header';
import Footer from '@components/Footer/Footer';
import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import { Outlet } from 'react-router-dom'; // TƯ DUY SENIOR: Dùng Outlet để render con

function AdminLayout() {
    return (
        <div className='admin-layout'>
            <Header />
            <main className='admin-content'>
                <div className='container'>
                    <Breadcrumb />
                    {/* - Outlet sẽ render các component con từ routes/index.jsx */}
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
}

// LỖI CỦA BẠN LÀ THIẾU DÒNG NÀY
export default AdminLayout;
