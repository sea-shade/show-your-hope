import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import characteristicsData from '../data/characteristics.json'
import selectionsData from '../data/selections.json'
import type { Painting, Characteristic, Selection } from '../types'
import PaintingImage from '../components/PaintingImage'
import SidekickImage from '../components/SidekickImage'
import Carousel from '../components/Carousel'
import PaintingTable from '../components/PaintingTable'
import DataStatus from '../components/DataStatus'
import { loadPaintings, useData } from '../lib/paintingData'
import { assetUrl } from '../lib/assets'
import styles from './Gallery.module.css'

const characteristics = characteristicsData as Characteristic[]
const selections = selectionsData as Selection[]

type FilterGroup = 'characteristics' | 'selections'

const CHARACTERISTIC_FILTERS = [
  ...characteristics.map(c => ({ value: c.name, label: c.name.replace('-', ' ') })),
  { value: 'gender-male', label: 'Male artist' },
  { value: 'gender-female', label: 'Female artist' },
  { value: 'sellstatus-free_to_sell', label: 'For sale' },
  { value: 'has_video', label: 'With video' },
]

const CHARACTERISTIC_LABELS: Record<string, string> = Object.fromEntries(
  CHARACTERISTIC_FILTERS.map(f => [f.value, f.label])
)

/* Filter values whose name differs from the icon file the original site used. */
const FILTER_ICONS: Record<string, string> = {
  'with-text': 'with',
  'gender-male': 'male',
  'gender-female': 'female',
  'sellstatus-free_to_sell': 'for_sale',
  has_video: 'video',
}

function filterIconUrl(value: string): string {
  return `/icons/${FILTER_ICONS[value] ?? value}.png`
}

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
  const dialog = useRef<HTMLDialogElement>(null)

  /* A dialog rather than a div, as the cookie dialog is, so that the backdrop,
     Escape and the focus trap are the browser's job rather than ours. The
     background still needs pinning: a modal dialog makes the page inert but
     does not stop it scrolling. */
  useEffect(() => {
    dialog.current?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <dialog
      ref={dialog}
      className={styles.modal}
      aria-label={painting.title}
      /* Whether the modal is open is React's state, so Escape and a click on
         the backdrop are turned into the one close everything else goes
         through rather than closing the element behind React's back. */
      onCancel={e => {
        e.preventDefault()
        onClose()
      }}
      onClick={e => {
        if (e.target === dialog.current) onClose()
      }}
    >
      {/* Previous and Next sit together at one end and the close at the other,
          so that stepping through the paintings never lands next to the button
          that leaves them. */}
      <div className={styles.modalHeader}>
        <div className={styles.modalNav}>
          <button className={styles.modalNavBtn} onClick={onPrev}>‹ Previous</button>
          <button className={styles.modalNavBtn} onClick={onNext}>Next ›</button>
        </div>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className={styles.modalBody}>
        <div className={styles.modalImages}>
          <PaintingImage
            tag={painting.tag}
            alt={painting.title}
            className={styles.modalImg}
          />
          <SidekickImage
            tag={painting.tag}
            alt={painting.artist.fullname}
            className={styles.modalSidekick}
          />
        </div>
        <div className={styles.modalInfo}>
          <h2 className={styles.modalTitle}>{painting.title}</h2>
          <p className={styles.modalArtist}>{painting.artist.fullname}</p>
          <p className={styles.modalMeta}>
            {painting.artist.country.name} · {painting.date} · #{painting.tag}
          </p>
          {/* Characteristics, selections and the sell status are all labels on
              the painting, so they run as one row of chips rather than a list
              per kind, coloured as the filters that match them are. */}
          <div className={styles.modalTags}>
            {painting.characteristics.map(c => (
              <span key={c} className={styles.tag}>{c}</span>
            ))}
            {painting.selections.map(s => (
              <span key={s} className={styles.selectionTag}>{s}</span>
            ))}
            <span className={styles.statusTag}>
              {SELL_STATUS_LABELS[painting.sell_status] ?? 'Not for sale'}
            </span>
          </div>
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
    </dialog>
  )
}

/* The gallery reopens on the painting you were last looking at, as the
   original site did. Storage can be unavailable or full, and remembering the
   position is a nicety, so a failure either way is not worth reporting. */
const POSITION_KEY = 'gallery-last-painting'

function rememberedTag(paintings: Painting[]): string | null {
  try {
    const tag = localStorage.getItem(POSITION_KEY)
    return paintings.some(p => p.tag === tag) ? tag : null
  } catch {
    return null
  }
}

function remember(tag: string) {
  try {
    localStorage.setItem(POSITION_KEY, tag)
  } catch {
    // The gallery works just as well without it.
  }
}

function randomTag(paintings: Painting[]): string {
  return paintings[Math.floor(Math.random() * paintings.length)].tag
}

export default function Gallery() {
  const { data: paintings, failed } = useData(loadPaintings)

  if (!paintings) {
    return (
      <div className="page">
        <DataStatus failed={failed} />
      </div>
    )
  }

  return <GalleryView paintings={paintings} />
}

/* Split from the loader above so that every piece of state below - the
   remembered painting in particular - is initialised once the paintings are
   actually in hand. */
function GalleryView({ paintings }: { paintings: Painting[] }) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [activeSelections, setActiveSelections] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [openGroup, setOpenGroup] = useState<FilterGroup | null>(null)
  const filterBarRef = useRef<HTMLDivElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  /* The painting in the middle of the carousel, which is also the row
     highlighted in the table. A link to a particular painting centres on it,
     otherwise the gallery picks up where it was left, and a first visit opens
     on a random painting. */
  const [centerTag, setCenterTag] = useState(
    () => searchParams.get('painting') ?? rememberedTag(paintings) ?? randomTag(paintings)
  )
  const navigate = useNavigate()
  const location = useLocation()
  /* Opening a painting pushes a history entry, so closing it goes back to
     wherever it was opened from: the gallery, the world map or the welcome
     page. Landing on the gallery directly leaves nothing to go back to. */
  const isEntryPoint = useRef(location.key === 'default')

  const view = searchParams.get('view') === 'grid' ? 'grid' : 'gallery'
  const selectedTag = searchParams.get('painting')
  const selected = paintings.find(p => p.tag === selectedTag)

  useEffect(() => remember(centerTag), [centerTag])

  const setParam = useCallback(
    (key: string, value: string | null, replace = false) => {
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev)
          if (value === null) next.delete(key)
          else next.set(key, value)
          return next
        },
        { replace }
      )
    },
    [setSearchParams]
  )

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

  /* The filters live behind two buttons, as they did on the original site, so
     that the carousel and its table still fit on one screen. */
  useEffect(() => {
    function handleDown(e: MouseEvent) {
      if (!filterBarRef.current?.contains(e.target as Node)) setOpenGroup(null)
    }
    document.addEventListener('mousedown', handleDown)
    return () => document.removeEventListener('mousedown', handleDown)
  }, [])

  const filtered = useMemo(() => {
    return paintings.filter(p => {
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
  }, [paintings, activeFilters, activeSelections, search])

  /* An open painting is what the carousel shows behind the modal, so that
     stepping through the modal walks the carousel with it. A centred painting
     that the filters just excluded falls back to the start of what is left. */
  const centerIndex = Math.max(
    0,
    filtered.findIndex(p => p.tag === (selectedTag ?? centerTag))
  )

  const setCenter = useCallback(
    (index: number) => {
      const painting = filtered[Math.min(filtered.length - 1, Math.max(0, index))]
      if (!painting) return
      setCenterTag(painting.tag)
      /* Stepping while the modal is open replaces the history entry, so
         closing still returns to wherever the painting was opened from. */
      if (selectedTag) setParam('painting', painting.tag, true)
    },
    [filtered, selectedTag, setParam]
  )

  /* The arrow keys walk the carousel, and walk the modal when one is open,
     which in the original were the same movement. */
  useEffect(() => {
    if (view === 'grid' && !selectedTag) return

    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setCenter(centerIndex - 1)
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setCenter(centerIndex + 1)
      else return
      e.preventDefault()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [view, selectedTag, centerIndex, setCenter])

  function close() {
    if (selectedTag) setCenterTag(selectedTag)
    if (isEntryPoint.current) setParam('painting', null, true)
    else navigate(-1)
  }

  return (
    <div className={`page ${view === 'gallery' ? styles.galleryPage : ''}`}>
      <div className="container">
        <div className={styles.filterBar} ref={filterBarRef}>
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>Filters</span>

            <div className={styles.filterGroup}>
              <button
                className={`${styles.groupBtn} ${openGroup === 'characteristics' ? styles.groupOpen : ''}`}
                onClick={() => setOpenGroup(g => (g === 'characteristics' ? null : 'characteristics'))}
                aria-expanded={openGroup === 'characteristics'}
              >
                <img src={assetUrl('icons/characteristics.png')} alt="" className={styles.filterIcon} />
                Characteristics
              </button>
              {openGroup === 'characteristics' && (
                <div className={styles.dropdown}>
                  {CHARACTERISTIC_FILTERS.map(f => (
                    <button
                      key={f.value}
                      className={`${styles.filterBtn} ${activeFilters.includes(f.value) ? styles.active : ''}`}
                      onClick={() => toggleFilter(f.value)}
                    >
                      <img src={filterIconUrl(f.value)} alt="" className={styles.filterIcon} />
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.filterGroup}>
              <button
                className={`${styles.groupBtn} ${openGroup === 'selections' ? styles.groupOpen : ''}`}
                onClick={() => setOpenGroup(g => (g === 'selections' ? null : 'selections'))}
                aria-expanded={openGroup === 'selections'}
              >
                <img src={assetUrl('icons/selections.png')} alt="" className={styles.filterIcon} />
                Selections
              </button>
              {openGroup === 'selections' && (
                <div className={styles.dropdown}>
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
              )}
            </div>

            <input
              type="text"
              placeholder="Search by tag, artist, title, country…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.count}>{filtered.length} paintings</span>

            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${view === 'gallery' ? styles.viewActive : ''}`}
                onClick={() => setParam('view', null, true)}
                aria-pressed={view === 'gallery'}
              >
                Gallery
              </button>
              <button
                className={`${styles.viewBtn} ${view === 'grid' ? styles.viewActive : ''}`}
                onClick={() => setParam('view', 'grid', true)}
                aria-pressed={view === 'grid'}
              >
                Grid
              </button>
            </div>
          </div>

          {(activeFilters.length > 0 || activeSelections.length > 0) && (
            <div className={styles.activeRow}>
              {activeFilters.map(f => (
                <button key={f} className={`${styles.filterBtn} ${styles.active}`} onClick={() => toggleFilter(f)}>
                  <img src={filterIconUrl(f)} alt="" className={styles.filterIcon} />
                  {CHARACTERISTIC_LABELS[f] ?? f}
                  <span className={styles.chipClose}>×</span>
                </button>
              ))}
              {activeSelections.map(s => (
                <button key={s} className={`${styles.filterBtn} ${styles.activeSelection}`} onClick={() => toggleSelection(s)}>
                  {s}
                  <span className={styles.chipClose}>×</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {view === 'gallery' ? (
        <>
          <Carousel
            items={filtered}
            index={centerIndex}
            onCenter={setCenter}
            onOpen={p => setParam('painting', p.tag)}
          />
          <div className={`container ${styles.tableBox}`}>
            <p className={styles.carouselHint}>
              Click the centre painting for its story, or use the arrow keys.
            </p>
            <PaintingTable items={filtered} index={centerIndex} onSelect={setCenter} />
          </div>
        </>
      ) : (
        <div className="container">
          <div className={styles.grid}>
            {filtered.map(p => (
              <button
                key={p.id}
                className={styles.card}
                onClick={() => {
                  setCenterTag(p.tag)
                  setParam('painting', p.tag)
                }}
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
      )}

      {selected && (
        <PaintingModal
          painting={selected}
          onClose={close}
          onPrev={() => setCenter(centerIndex - 1)}
          onNext={() => setCenter(centerIndex + 1)}
        />
      )}
    </div>
  )
}
