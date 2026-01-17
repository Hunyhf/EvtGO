import Footer from '@components/Footer';
import Header from '@components/Header/index.jsx';
import Nav from '@components/Nav/index.jsx';
function UserLayout({ children }) {
    return (
        <div>
            <Header />
            <div className='container'>
                <Nav />
                <div className='content'>{children}</div>
            </div>

            <Footer />
        </div>
    );
}

export default UserLayout;
