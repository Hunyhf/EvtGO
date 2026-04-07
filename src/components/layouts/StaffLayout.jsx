import { useContext } from 'react'; //
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext'; //

function StaffLayout() {
    // Lấy hàm logoutContext từ AuthContext
    const { logoutContext } = useContext(AuthContext);

    return (
        <div
            className='staff-container'
            style={{ minHeight: '100vh', background: '#141414', color: '#fff' }}
        >
            {/* Header với nút đăng xuất */}
            <header
                style={{
                    padding: '15px 20px',
                    background: '#1f1f1f',
                    borderBottom: '1px solid #333',
                    display: 'flex', // Sử dụng flexbox để căn chỉnh
                    justifyContent: 'space-between', // Đẩy 2 phần tử về 2 phía
                    alignItems: 'center'
                }}
            >
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
                    Staff Dashboard
                </h2>

                <button
                    onClick={logoutContext} // Gọi hàm đăng xuất khi click
                    style={{
                        background: 'transparent',
                        border: '1px solid #ff4d4f',
                        color: '#ff4d4f',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s'
                    }}
                    onMouseOver={e => {
                        e.target.style.background = '#ff4d4f';
                        e.target.style.color = '#fff';
                    }}
                    onMouseOut={e => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#ff4d4f';
                    }}
                >
                    Đăng xuất
                </button>
            </header>

            <main style={{ padding: '20px' }}>
                <Outlet />
            </main>
        </div>
    );
}

export default StaffLayout;
