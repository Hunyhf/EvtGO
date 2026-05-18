import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, theme } from 'antd';
import InactivityTimeout from '@components/InactivityTimeout';
import { routes } from './routes';

function App() {
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#2dc275'
                }
            }}
        >
            <AntdApp>
                <div className='App'>
                    <RouterProvider router={routes} />
                    <InactivityTimeout />
                </div>
            </AntdApp>
        </ConfigProvider>
    );
}

export default App;
