import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import paintingsData from '../data/paintings.json'
import exhibitionsData from '../data/exhibitions.json'
import type { Painting, Exhibition } from '../types'
import styles from './WorldMap.module.css'

const paintings = paintingsData as Painting[]
const exhibitions = exhibitionsData as Exhibition[]

interface MarkerData {
  id: string
  lat: number
  lng: number
  label: string
  type: 'artist' | 'painting' | 'exhibition'
}

export default function WorldMap() {
  const markers = useMemo<MarkerData[]>(() => {
    const result: MarkerData[] = []
    const seenArtists = new Set<number>()

    for (const p of paintings) {
      if (p.is_private) continue

      const lat = p.artist.city?.latitude ?? p.artist.country.latitude
      const lng = p.artist.city?.longitude ?? p.artist.country.longitude

      if (!seenArtists.has(p.artist.id)) {
        seenArtists.add(p.artist.id)
        result.push({ id: `artist-${p.artist.id}`, lat, lng, label: p.artist.fullname, type: 'artist' })
      }

      result.push({ id: `painting-${p.id}`, lat, lng, label: p.title, type: 'painting' })
    }

    for (const e of exhibitions) {
      result.push({ id: `exhibition-${e.id}`, lat: e.latitude, lng: e.longitude, label: e.name, type: 'exhibition' })
    }

    return result
  }, [])

  const colorMap: Record<MarkerData['type'], string> = {
    artist: '#3498db',
    painting: '#2ecc71',
    exhibition: '#e67e22',
  }

  const radiusMap: Record<MarkerData['type'], number> = {
    artist: 8,
    painting: 6,
    exhibition: 8,
  }

  return (
    <div className="page">
      <div className={styles.legendBar}>
        <div className={styles.container}>
          <span className={styles.legendItem}>
            <span className={styles.dot} style={{ background: '#3498db' }} /> Artists
          </span>
          <span className={styles.legendItem}>
            <span className={styles.dot} style={{ background: '#2ecc71' }} /> Paintings
          </span>
          <span className={styles.legendItem}>
            <span className={styles.dot} style={{ background: '#e67e22' }} /> Exhibitions
          </span>
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
        {markers.map(m => (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={radiusMap[m.type]}
            pathOptions={{ color: colorMap[m.type], fillColor: colorMap[m.type], fillOpacity: 0.8 }}
          >
            <Popup>{m.label}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
