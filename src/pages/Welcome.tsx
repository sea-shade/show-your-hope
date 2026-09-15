import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import paintingsData from '../data/paintings.json'
import type { Painting } from '../types'
import PaintingImage from '../components/PaintingImage'
import styles from './Welcome.module.css'

const paintings = (paintingsData as Painting[]).filter(p => !p.is_private)

function randomSample<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export default function Welcome() {
  const featured = useMemo(() => randomSample(paintings.filter(p => p.title), 3), [])

  return (
    <div className="page">
      <div className={styles.hero}>
        <img src="/hero.jpg" alt="Show Your Hope" className={styles.heroImg} />
      </div>

      <div className="container">
        <section className={styles.section}>
          <p className={styles.intro}>
            <span className={`syh-logo ${styles.show}`}>Show </span>
            <span className={`syh-logo ${styles.your}`}>Your </span>
            <span className={`syh-logo ${styles.hope}`}>Hope</span>
            {' '}is an art project that serves as a communication project between the participating{' '}
            <span className={`syh-logo ${styles.show}`}>artists</span>, the{' '}
            <span className={`syh-logo ${styles.your}`}>audience</span>, and{' '}
            <span className={`syh-logo ${styles.hope}`}>you</span>.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Over <span className={styles.show}>1000</span> paintings showing{' '}
            <span className={styles.hope}>Hope</span> since{' '}
            <span className={styles.your}>2003</span>
          </h2>
          <div className={styles.featuredGrid}>
            {featured.map(p => (
              <Link key={p.id} to="/gallery" className={styles.featuredItem}>
                <PaintingImage
                  tag={p.tag}
                  alt={p.title}
                  className={styles.featuredImg}
                />
                <div className={styles.featuredTitle}>{p.title}</div>
                <div className={styles.featuredArtist}>by {p.artist.fullname}</div>
              </Link>
            ))}
          </div>
          <p className={styles.featuredHint}>
            Randomly selected. <Link to="/gallery">Explore the full gallery →</Link>
          </p>
        </section>

        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.splitRow}>
            <div className={styles.splitText}>
              <h2>
                In <span className={styles.show}>September 2018</span> a tour started to{' '}
                <span className={styles.hope}>Tunisia</span>
              </h2>
              <p>
                Martin drove to Genoa and shipped to Tunis where the national tour started visiting
                all 21 gouvernerates of Tunisia — a 5000 km journey in the yellow{' '}
                <span className={styles.show}>DAF</span> truck built in Eindhoven in 1986.
              </p>
            </div>
            <div>
              <img src="/tunisia.jpg" alt="Tunisia tour" className={styles.splitImg} />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>In the news</h2>
          <div className={styles.videoGrid}>
            {[
              { id: 'cS4BA0hA0WE', title: 'Interview Martin Voorbij' },
              { id: 'gEVXyilAkRE', title: 'Show Your Hope introduction film in Istria' },
              { id: 'UljTW1f4KW0', title: 'Show Your Hope in Banja Luka' },
            ].map(v => (
              <div key={v.id}>
                <div className={styles.videoWrapper}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${v.id}?showinfo=0`}
                    allowFullScreen
                    title={v.title}
                  />
                </div>
                <div className={styles.videoTitle}>{v.title}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.splitRow}>
            <div className={styles.splitText}>
              <h2>
                We have travelled to <span className={styles.show}>45+</span> countries
              </h2>
              <p>
                Click the map to navigate through Artists, Paintings and Exhibitions of{' '}
                Show Your Hope.
              </p>
              <Link to="/worldmap" className={styles.mapLink}>Explore the World Map →</Link>
            </div>
            <div>
              <img src="/syh_map_overview.png" alt="World map overview" className={styles.splitImg} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
