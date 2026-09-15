import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.show}>Show</span>{' '}
          <span className={styles.your}>Your</span>{' '}
          <span className={styles.hope}>Hope</span>
        </NavLink>
        <ul className={styles.links}>
          <li><NavLink to="/gallery" className={({ isActive }) => isActive ? styles.active : ''}>Gallery</NavLink></li>
          <li><NavLink to="/whoarewe" className={({ isActive }) => isActive ? styles.active : ''}>Who Are We</NavLink></li>
          <li><NavLink to="/worldmap" className={({ isActive }) => isActive ? styles.active : ''}>World Map</NavLink></li>
        </ul>
      </div>
    </nav>
  )
}
