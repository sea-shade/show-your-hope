import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { divIcon } from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import PaintingImage from '../components/PaintingImage'
import SidekickImage from '../components/SidekickImage'
import DataStatus from '../components/DataStatus'
import { loadPaintings, loadExhibitions, useData } from '../lib/paintingData'
import styles from './WorldMap.module.css'

type MarkerType = 'artist' | 'painting' | 'exhibition'

const LAYERS: { type: MarkerType; label: string; color: string }[] = [
  { type: 'painting', label: 'Paintings', color: '#2ecc71' },
  { type: 'artist', label: 'Artists', color: '#3498db' },
  { type: 'exhibition', label: 'Exhibitions', color: '#e67e22' },
]

const ICON_URL: Record<MarkerType, string> = {
  artist: '/icons/artist.png',
  painting: '/icons/painting.png',
  exhibition: '/icons/exhibition.png',
}

/** The icons are black silhouettes, so they sit on a coloured disc and are
 *  flipped to white. Shared by the markers and the legend. */
function badge(type: MarkerType, color: string): string {
  return `<span class="${styles.badge}" style="background:${color}">` +
    `<img src="${ICON_URL[type]}" alt="">` +
    `</span>`
}

const ICONS = Object.fromEntries(
  LAYERS.map(l => [
    l.type,
    divIcon({
      html: badge(l.type, l.color),
      className: styles.marker,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -16],
    }),
  ])
) as Record<MarkerType, ReturnType<typeof divIcon>>

interface MarkerData {
  id: string
  lat: number
  lng: number
  type: MarkerType
  /** Painting to open in the gallery. Empty for exhibitions. */
  tag: string
  title: string
  subtitle: string
}

export default function WorldMap() {
  const { data: paintings, failed: paintingsFailed } = useData(loadPaintings)
  const { data: exhibitions, failed: exhibitionsFailed } = useData(loadExhibitions)
  const [hidden, setHidden] = useState<MarkerType[]>(['artist'])

  const markers = useMemo<MarkerData[]>(() => {
    if (!paintings || !exhibitions) return []
    const result: MarkerData[] = []
    const seenArtists = new Set<number>()

    for (const p of paintings) {
      const lat = p.artist.city?.latitude ?? p.artist.country.latitude
      const lng = p.artist.city?.longitude ?? p.artist.country.longitude

      if (!seenArtists.has(p.artist.id)) {
        seenArtists.add(p.artist.id)
        result.push({
          id: `artist-${p.artist.id}`,
          lat, lng,
          type: 'artist',
          tag: p.tag,
          title: p.artist.fullname,
          subtitle: p.artist.city?.name ?? p.artist.country.name,
        })
      }

      result.push({
        id: `painting-${p.id}`,
        lat, lng,
        type: 'painting',
        tag: p.tag,
        title: p.title,
        subtitle: p.artist.fullname,
      })
    }

    for (const e of exhibitions) {
      result.push({
        id: `exhibition-${e.id}`,
        lat: e.latitude,
        lng: e.longitude,
        type: 'exhibition',
        tag: '',
        title: e.name,
        subtitle: [e.city, e.country].filter(Boolean).join(', '),
      })
    }

    return result
  }, [paintings, exhibitions])

  function toggleLayer(type: MarkerType) {
    setHidden(prev => (prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]))
  }

  if (!paintings || !exhibitions) {
    return (
      <div className="page">
        <DataStatus failed={paintingsFailed || exhibitionsFailed} />
      </div>
    )
  }

  return (
    <div className={`page ${styles.mapPage}`}>
      <div className={styles.legendBar}>
        <div className={styles.container}>
          {LAYERS.map(l => (
            <button
              key={l.type}
              className={`${styles.legendItem} ${hidden.includes(l.type) ? styles.legendOff : ''}`}
              onClick={() => toggleLayer(l.type)}
              aria-pressed={!hidden.includes(l.type)}
            >
              <span dangerouslySetInnerHTML={{ __html: badge(l.type, l.color) }} />
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <MapContainer
        center={[30, 10]}
        zoom={2}
        className={styles.map}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {markers.filter(m => !hidden.includes(m.type)).map(m => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={ICONS[m.type]}>
            <Popup>
              {m.tag ? (
                <Link to={`/gallery?painting=${m.tag}`} className={styles.popup}>
                  {m.type === 'artist' ? (
                    <SidekickImage tag={m.tag} alt={m.title} className={styles.popupImg} />
                  ) : (
                    <PaintingImage tag={m.tag} alt={m.title} className={styles.popupImg} />
                  )}
                  <span className={styles.popupTitle}>{m.title}</span>
                  <span className={styles.popupSub}>{m.subtitle}</span>
                </Link>
              ) : (
                <span className={styles.popup}>
                  <span className={styles.popupTitle}>{m.title}</span>
                  <span className={styles.popupSub}>{m.subtitle}</span>
                </span>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
