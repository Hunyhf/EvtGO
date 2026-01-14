import Header from '@components/Header/index.jsx';
import Footer from '@components/Footer/index.jsx';
function UserLayout({ children }) {
    return (
        <div>
            <Header />
            <div className='container'>
                <div className='content'>{children}</div>
            </div>
            <Footer />
        </div>
    );
}

export default UserLayout;
