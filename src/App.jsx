import { Fragment } from 'react';
import { Routes, Route } from 'react-router-dom';
import { publicRoutes } from './routes';
import UserLayout from '@/components/layouts/User';
function App() {
    return (
        <div className='App'>
            <Routes>
                {publicRoutes.map((route, index) => {
                    const Layout =
                        route.layout === null ? Fragment : UserLayout;
                    const Page = route.component;
                    return (
                        <Route
                            key={index}
                            path={route.path}
                            element={
                                <Layout>
                                    <Page />
                                </Layout>
                            }
                        />
                    );
                })}
            </Routes>
        </div>
    );
}

export default App;
