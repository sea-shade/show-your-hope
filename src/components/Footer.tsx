import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.columns}>
          <div>
            <div className={styles.title}>Contact</div>
            <div className={styles.social}>
              <a href="https://www.facebook.com/Show-Your-Hope-171779936237674/" target="_blank" rel="noreferrer">Facebook</a>
              <a href="https://www.youtube.com/channel/UCgZ2s8Tx1JxwM2LBTbN35CA" target="_blank" rel="noreferrer">YouTube</a>
              <a href="https://www.instagram.com/showyourhope/" target="_blank" rel="noreferrer">Instagram</a>
            </div>
            <p>Foundation 80 Questions, Eindhoven, Netherlands</p>
            <p><a href="mailto:info@showyourhope.net">info@showyourhope.net</a></p>
            <p>+31 40 8488230</p>
          </div>
          <div>
            <div className={styles.title}>Bits &amp; pieces</div>
            <p>© 2013-now - Show Your Hope</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
