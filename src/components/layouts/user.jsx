import Footer from '@components/Footer';
import Header from '@components/Header/index.jsx';

function UserLayout({ children }) {
    return (
        <div className='grid wide'>
            <Header />
            <div className='container'>
                <div className='content'>{children}</div>
            </div>

            <Footer />
        </div>
    );
}

export default UserLayout;
