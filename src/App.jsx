import { Fragment } from 'react';
import { Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './routes';
import UserLayout from '@components/layouts/UserLayout';
import { AuthProvider } from '@contexts/AuthContext'; // Import AuthProvider
import ProtectedRoute from '@components/ProtectedRoute'; // Import ProtectedRoute

function App() {
    return (
        <AuthProvider>
            <div className='App'>
                <Routes>
                    {/* Public Routes */}
                    {publicRoutes.map((route, index) => {
                        const Page = route.component;
                        let Layout =
                            route.layout === null
                                ? Fragment
                                : route.layout || UserLayout;
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

                    {/* Private Routes */}
                    {privateRoutes.map((route, index) => {
                        const Page = route.component;
                        let Layout =
                            route.layout === null
                                ? Fragment
                                : route.layout || UserLayout;
                        return (
                            <Route
                                key={index + 'private'}
                                path={route.path}
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                        );
                    })}
                </Routes>
            </div>
        </AuthProvider>
    );
}

export default App;
