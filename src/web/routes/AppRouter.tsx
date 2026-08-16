import {BrowserRouter, Route, Routes} from 'react-router-dom';
import AppShell from '../layouts/AppShell/AppShell';
import HomePage from '../pages/HomePage/HomePage';


export default function AppRouter() {   
    return (
        <BrowserRouter>
         
                <Routes>
                    <Route element={<AppShell />}>
                    <Route path="/" element={<HomePage />} />
                
                    </Route>
                </Routes>
           
        </BrowserRouter>
    );
}
