// src/components/layouts/UserLayout.jsx
import Header from '@components/Header/Header';
import Footer from '@components/Footer/Footer';
import Breadcrumb from '@components/Breadcrumb/Breadcrumb';

function UserLayout({ children }) {
    return (
        <div className='user-layout'>
            <Header />
            <main className='content'>
                <div className='container'>
                    <Breadcrumb /> {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default UserLayout;
