import React from 'react';
import { Link } from 'react-router-dom'
import styles from './SiteHeader.module.css'
import SiteNav from '../SiteNav/SiteNav';


const SiteHeader: React.FC = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.left}>
                    <Link
                        className={styles.brand}
                        to="/"
                        aria-label="365 Evergreen home">
                        <img className={styles.brandLogo}
                            src="https://cdn.365evergreen.com/media/home/365-evergreen-logo.svg"
                            alt="365 Evergreen" />
                        <span className={styles.brandText}>365 Evergreen</span>

                    </Link>
                    </div>
                    <div className={styles.navigationContainer}>
                        <nav
                            id="primary-navigation"
                            className={styles.navigation}
                            aria-label="Main navigation"
                        >
                            <SiteNav />
                        </nav>
                    </div>
                </div>
           
        </header>)}
     

export default SiteHeader;