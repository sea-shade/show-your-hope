import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { assetUrl } from '../lib/assets'
import styles from './Footer.module.css'

export default function Footer() {
  const cookies = useRef<HTMLDialogElement>(null)

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
            <p><Link to="/tunisia">The Tunisia tour</Link></p>
            <button className={styles.cookiesLink} onClick={() => cookies.current?.showModal()}>
              <img src={assetUrl('icons/cookies.png')} alt="" className={styles.cookiesIcon} />
              Cookies
            </button>
            <p>© 2013-now - Show Your Hope</p>
          </div>
        </div>
      </div>

      {/* A dialog rather than a div, so that the backdrop, Escape and the
          focus trap are the browser's job rather than ours. */}
      <dialog
        ref={cookies}
        className={styles.dialog}
        onClick={e => {
          if (e.target === cookies.current) cookies.current?.close()
        }}
      >
        <button
          className={styles.dialogClose}
          onClick={() => cookies.current?.close()}
          aria-label="Close"
        >
          ×
        </button>
        <h1 className={styles.dialogTitle}>
          Where are the <span className={`syh-logo ${styles.hope}`}>cookies?</span>
        </h1>
        <h2 className={styles.dialogLead}>
          This website uses no cookies that are worth bothering you about, see{' '}
          <a
            href="http://www.cookie-checker.com/check-cookies.php?url=www.showyourhope.net&amp;cache=false"
            target="_blank"
            rel="noreferrer"
          >
            Cookie-Checker.com
          </a>
        </h2>
        <p>
          We store one thing, in your own browser: the last painting you looked at in the{' '}
          <Link to="/gallery" onClick={() => cookies.current?.close()}>Gallery</Link>, so that
          you see the same painting the next time you return. We thought that would be nice.
        </p>
        <p>
          Cookies from the embedded YouTube videos are avoided by using www.youtube-nocookie.com
          for our embedded videos.
        </p>
        <p>
          The links to our social media are plain text. Official social media icons are typically
          downloaded from servers owned by third-parties, giving them the possibility of following
          you around the Internet.
        </p>
      </dialog>
    </footer>
  )
}
