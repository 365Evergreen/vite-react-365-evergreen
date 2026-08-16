import styles from './SiteFooter.module.css'


export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <p>Helping organisations keep Microsoft 365 evergreen.</p>
      </div>
    </footer>
  )
}
