import { useState, useMemo, useEffect } from 'react'
import paintingsData from '../data/paintings.json'
import characteristicsData from '../data/characteristics.json'
import selectionsData from '../data/selections.json'
import type { Painting, Characteristic, Selection } from '../types'
import PaintingImage from '../components/PaintingImage'
import styles from './Gallery.module.css'

const paintings = paintingsData as Painting[]
const characteristics = characteristicsData as Characteristic[]
const selections = selectionsData as Selection[]

const EXTRA_FILTERS = [
  { value: 'gender-male', label: 'Male artist' },
  { value: 'gender-female', label: 'Female artist' },
  { value: 'sellstatus-free_to_sell', label: 'For sale' },
  { value: 'has_video', label: 'With video' },
]

function getFilterString(p: Painting): string {
  return [
    ...p.characteristics,
    `gender-${p.artist.gender}`,
    `sellstatus-${p.sell_status}`,
    ...(p.videos.length > 0 ? ['has_video'] : []),
  ].join(' ')
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

const SELL_STATUS_LABELS: Record<string, string> = {
  sold: 'Sold',
  dont_sell: 'Not for sale',
  free_to_sell: 'For sale',
  own_discretion: 'Contact us',
}

interface ModalProps {
  painting: Painting
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

function PaintingModal({ painting, onClose, onPrev, onNext }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext])

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={painting.title}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">×</button>
        <div className={styles.modalBody}>
          <PaintingImage
            tag={painting.tag}
            alt={painting.title}
            className={styles.modalImg}
          />
          <div className={styles.modalInfo}>
            <div className={styles.modalNav}>
              <button className={styles.modalNavBtn} onClick={onPrev}>&lt; Previous</button>
              <button className={styles.modalNavBtn} onClick={onNext}>Next &gt;</button>
            </div>
            <h2 className={styles.modalTitle}>{painting.title}</h2>
            <p className={styles.modalArtist}>{painting.artist.fullname}</p>
            <p className={styles.modalMeta}>
              {painting.artist.country.name} · {painting.date} · #{painting.tag}
            </p>
            <p className={styles.modalMeta}>
              {SELL_STATUS_LABELS[painting.sell_status] ?? 'Not for sale'}
            </p>
            {painting.characteristics.length > 0 && (
              <div className={styles.modalTags}>
                {painting.characteristics.map(c => (
                  <span key={c} className={styles.tag}>{c}</span>
                ))}
              </div>
            )}
            {painting.selections.length > 0 && (
              <div className={styles.modalTags}>
                {painting.selections.map(s => (
                  <span key={s} className={styles.selectionTag}>{s}</span>
                ))}
              </div>
            )}
            <p className={styles.modalStory}>{painting.story}</p>
            {painting.videos.map((v, i) => {
              const videoId = getYouTubeId(v.link)
              if (!videoId) return null
              return (
                <div key={i} className={styles.modalVideo}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    allowFullScreen
                    title={`${painting.title} video ${i + 1}`}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Gallery() {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [activeSelections, setActiveSelections] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  function toggleFilter(value: string) {
    setActiveFilters(prev =>
      prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
    )
  }

  function toggleSelection(name: string) {
    setActiveSelections(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    )
  }

  const filtered = useMemo(() => {
    return paintings.filter(p => {
      if (p.is_private) return false

      const filterStr = getFilterString(p)
      if (!activeFilters.every(f => filterStr.includes(f))) return false
      if (!activeSelections.every(s => p.selections.includes(s))) return false

      if (search.trim()) {
        const q = search.toLowerCase()
        const hit =
          p.tag.includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.artist.fullname.toLowerCase().includes(q) ||
          p.artist.country.name.toLowerCase().includes(q)
        if (!hit) return false
      }

      return true
    })
  }, [activeFilters, activeSelections, search])

  const selected = selectedIndex !== null ? filtered[selectedIndex] : undefined

  function step(delta: number) {
    setSelectedIndex(i => {
      if (i === null || filtered.length === 0) return i
      return (i + delta + filtered.length) % filtered.length
    })
  }

  return (
    <div className="page">
      <div className="container">
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Characteristics</span>
            <div className={styles.filterButtons}>
              {characteristics.map(c => (
                <button
                  key={c.id}
                  className={`${styles.filterBtn} ${activeFilters.includes(c.name) ? styles.active : ''}`}
                  onClick={() => toggleFilter(c.name)}
                >
                  {c.name}
                </button>
              ))}
              {EXTRA_FILTERS.map(f => (
                <button
                  key={f.value}
                  className={`${styles.filterBtn} ${activeFilters.includes(f.value) ? styles.active : ''}`}
                  onClick={() => toggleFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Selections</span>
            <div className={styles.filterButtons}>
              {selections.map(s => (
                <button
                  key={s.id}
                  className={`${styles.filterBtn} ${activeSelections.includes(s.name) ? styles.activeSelection : ''}`}
                  onClick={() => toggleSelection(s.name)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.searchRow}>
            <input
              type="text"
              placeholder="Search by tag, artist, title, country…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.count}>{filtered.length} paintings</span>
          </div>
        </div>

        <div className={styles.grid}>
          {filtered.map((p, i) => (
            <button
              key={p.id}
              className={styles.card}
              onClick={() => setSelectedIndex(i)}
            >
              <PaintingImage
                tag={p.tag}
                alt={p.title}
                className={styles.cardImg}
              />
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>{p.title}</div>
                <div className={styles.cardArtist}>{p.artist.fullname}</div>
                <div className={styles.cardMeta}>{p.artist.country.name} · #{p.tag}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className={styles.empty}>No paintings match the current filters.</p>
          )}
        </div>
      </div>

      {selected && (
        <PaintingModal
          painting={selected}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      )}
    </div>
  )
}
