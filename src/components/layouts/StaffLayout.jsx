import { Outlet } from 'react-router-dom';

function StaffLayout() {
    return (
        <div
            className='staff-container'
            style={{ minHeight: '100vh', background: '#141414', color: '#fff' }}
        >
            {/* Header đơn giản cho Staff */}
            <header
                style={{
                    padding: '15px 20px',
                    background: '#1f1f1f',
                    borderBottom: '1px solid #333'
                }}
            >
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
                    Staff Dashboard
                </h2>
            </header>

            <main style={{ padding: '20px' }}>
                {/* Outlet là nơi các nội dung con (index, scan/:eventId) sẽ hiển thị */}
                <Outlet />
            </main>
        </div>
    );
}

export default StaffLayout;
