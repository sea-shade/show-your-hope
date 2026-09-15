import styles from './DataStatus.module.css'

/** Shown by the three pages that wait on the painting data. */
export default function DataStatus({ failed }: { failed: boolean }) {
  return (
    <p className={styles.status} role="status">
      {failed ? 'The paintings could not be loaded. Please try again later.' : 'Loading the paintings…'}
    </p>
  )
}
