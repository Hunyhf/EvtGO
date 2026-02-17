// src/App.jsx
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, theme } from 'antd'; // Import thêm
import { routes } from './routes';

function App() {
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm, // Hoặc theme.defaultAlgorithm
                token: {
                    colorPrimary: '#2dc275' // Màu chủ đạo của bạn
                }
            }}
        >
            {/* Bắt buộc bọc AntdApp để dùng hook useApp() */}
            <AntdApp>
                <div className='App'>
                    <RouterProvider router={routes} />
                </div>
            </AntdApp>
        </ConfigProvider>
    );
}

export default App;
