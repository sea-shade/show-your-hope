import styles from './WhoAreWe.module.css'

export default function WhoAreWe() {
  return (
    <div className="page">
      <div className={styles.cover}>
        <div className={styles.coverText}>
          <h1>
            We are{' '}
            <span>
              <span className={styles.show}>Show </span>
              <span className={styles.your}>Your </span>
              <span className={styles.hope}>Hope</span>
            </span>
          </h1>
        </div>
      </div>

      <div className="container">
        <section className={styles.section}>
          <h2>Our Aim?</h2>
          <blockquote className={styles.quote}>
            &ldquo;To <span className={styles.show}>show</span> and share universal beauty through
            arts, music, language, media and make many people participate and enjoy it.&rdquo;
            <cite>&minus; Martin Voorbij</cite>
          </blockquote>
        </section>

        <section className={styles.section}>
          <h2>The Mobile Global Exhibition</h2>
          <p>
            <span className={styles.show}>Show </span>
            <span className={styles.your}>Your </span>
            <span className={styles.hope}>Hope</span>
            {' '}is a travelling, story-telling exhibition with over 900 paintings from all over the
            world. Each participating artist is given a blank canvas and asked to paint their view on{' '}
            <span className={styles.hope}>Hope</span>. The paintings are shown around the world during
            our mobile exhibitions where they are velcro&apos;d to the side of our trusty DAF truck
            and shown to the public. Each painting comes with its own story, told during the exhibition.
          </p>
          <p className={styles.spacedP}>
            We consider this world a great place, with enormous variety, very good potential and
            endless beauty. At the same time we see new dilemmas and questions coming up every day.
            Many of these issues shine through in the paintings and their stories. By including
            paintings from vastly different artists we paint a picture of these issues from many
            perspectives.
          </p>
        </section>

        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.splitRow}>
            <div className={styles.splitText}>
              <h2>
                The <span className={styles.show}>Show </span>
                <span className={styles.your}>Your </span>
                <span className={styles.hope}>Hope</span> DAF truck, originally built in our hometown Eindhoven
              </h2>
            </div>
            <div className={styles.splitMedia}>
              <img
                src="/truck-with-martin.jpg"
                alt="The DAF truck"
                className={styles.sectionImg}
              />
            </div>
          </div>
        </section>

        <section className={styles.section} id="wherehavewebeen">
          <h2>Where have we been?</h2>
          <p>
            Since 2003, we have been in 45 countries, showing paintings from 135 nationalities —
            all with a universal expression about <span className={styles.hope}>Hope</span>. We
            presented in Romania for schoolkids and in Iran&apos;s national House of the Artists. We
            presented at many large music events in Europe, in alternative art houses in Berlin and
            in Mali. Over 250,000 people responded to our ballot system in order to stimulate
            communication. It has always been our aim to present on all continents.
          </p>
        </section>

        <section className={`${styles.section} ${styles.sectionAlt}`} id="wherearewe">
          <h2>Where are we?</h2>
          <p>
            The project is coordinated from the historical &ldquo;Spoelhuis&rdquo; (washhouse) in our
            hometown Eindhoven, Netherlands — known as the Inkijkmuseum. This is where the project
            maintains a public storage for hundreds of paintings. It also functions as gallery, mini
            hostel, classroom and micro cinema.
          </p>

          <div className={`${styles.splitRow} ${styles.splitRowTop}`}>
            <div className={styles.splitText}>
              <h2>
                Our home base, the old &ldquo;Spoelhuis&rdquo; next to the Dommel in Eindhoven
              </h2>
            </div>
            <div className={styles.splitMedia}>
              <img
                src="/spoelhuis.jpg"
                alt="The Spoelhuis"
                className={styles.sectionImg}
              />
            </div>
          </div>

          <div className={`${styles.splitRow} ${styles.splitRowTop}`}>
            <div className={styles.splitText}>
              <h2>
                The multi-functional museum room of the Inkijkmuseum
              </h2>
            </div>
            <div className={styles.splitMedia}>
              <div className={styles.videoWrapper}>
                <iframe
                  src="https://www.youtube-nocookie.com/embed/_J_Iis9adoc?autoplay=0&fs=1&showinfo=0&rel=0"
                  allowFullScreen
                  title="Inkijkmuseum"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
