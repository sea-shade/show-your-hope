import { memo, useEffect, useRef } from 'react'
import type { Painting } from '../types'
import styles from './PaintingTable.module.css'

interface RowProps {
  painting: Painting
  index: number
  selected: boolean
  onSelect: (index: number) => void
}

/* Memoised so that stepping the carousel only re-renders the two rows whose
   selection changed, rather than all nine hundred. */
const Row = memo(function Row({ painting, index, selected, onSelect }: RowProps) {
  return (
    <tr
      data-index={index}
      className={selected ? styles.selected : undefined}
      onClick={() => onSelect(index)}
    >
      <td>{painting.tag}</td>
      <td>{painting.artist.fullname}</td>
      <td>{painting.title}</td>
      <td>{painting.artist.country.name}</td>
      <td>{painting.date}</td>
    </tr>
  )
})

interface PaintingTableProps {
  items: Painting[]
  index: number
  onSelect: (index: number) => void
}

export default function PaintingTable({ items, index, onSelect }: PaintingTableProps) {
  const bodyRef = useRef<HTMLDivElement>(null)

  /* Centre the row the carousel is showing in the part of the table the
     sticky header leaves visible. */
  useEffect(() => {
    const body = bodyRef.current
    const row = body?.querySelector<HTMLElement>(`[data-index="${index}"]`)
    if (!body || !row) return
    const header = body.querySelector('thead')?.clientHeight ?? 0
    const bodyBox = body.getBoundingClientRect()
    const rowBox = row.getBoundingClientRect()
    const wanted = bodyBox.top + header + (bodyBox.height - header - rowBox.height) / 2
    body.scrollTop += rowBox.top - wanted
  }, [index, items])

  return (
    <div className={styles.body} ref={bodyRef}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tag</th>
            <th>Artist</th>
            <th>Title</th>
            <th>Country</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p, i) => (
            <Row
              key={p.tag}
              painting={p}
              index={i}
              selected={i === index}
              onSelect={onSelect}
            />
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <p className={styles.empty}>No paintings match the current filters.</p>
      )}
    </div>
  )
}
