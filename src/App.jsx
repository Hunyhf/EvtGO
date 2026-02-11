// src/App.jsx
import { RouterProvider } from 'react-router-dom';
import { routes } from './routes'; // Import duy nhất object routes

function App() {
    return (
        <div className='App'>
            <RouterProvider router={routes} />
        </div>
    );
}

export default App;
