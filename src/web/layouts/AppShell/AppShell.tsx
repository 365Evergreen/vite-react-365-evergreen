import SiteHeader from '../../components/SiteHeader/SiteHeader'
import SiteFooter from '../../components/SiteFooter/SiteFooter'
import styles from './AppShell.module.css'
import { Outlet } from 'react-router-dom';

export function AppShell(){

    return (
        <div className="app-shell">
            <SiteHeader />
            <main className={styles.mainContainer}>
             <Outlet/>            
            </main>
            <SiteFooter />
        </div>
    );
}

export default AppShell;