import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import type { Painting } from '../types'
import PaintingImage from './PaintingImage'
import styles from './Carousel.module.css'

/* Geometry of the original site's waterwheel carousel. Every length is a
   fraction of the width of a horizontal painting, so the whole carousel scales
   with the single --w custom property. Items step outwards by a shrinking
   separation while shrinking and fading at a constant rate. The step past the
   last visible one sits back at the centre with zero opacity, so items emerge
   from behind the middle painting rather than popping in at the edge. */
const FLANKING = 3
const SEPARATION = 350 / 410
const SEPARATION_MULTIPLIER = 0.6
const SIZE_MULTIPLIER = 0.6
const OPACITY_MULTIPLIER = 0.8

interface Step {
  offset: number
  scale: number
  opacity: number
}

const STEPS: Step[] = (() => {
  const steps: Step[] = [{ offset: 0, scale: 1, opacity: 1 }]
  let separation = SEPARATION
  for (let d = 1; d <= FLANKING; d++) {
    if (d > 1) separation *= SEPARATION_MULTIPLIER
    steps.push({
      offset: steps[d - 1].offset + separation,
      scale: steps[d - 1].scale * SIZE_MULTIPLIER,
      opacity: steps[d - 1].opacity * OPACITY_MULTIPLIER,
    })
  }
  steps.push({ offset: 0, scale: steps[FLANKING].scale * SIZE_MULTIPLIER, opacity: 0 })
  return steps
})()

/* The original gave every painting one of two fixed boxes and stretched the
   photograph to fit. Keeping the boxes keeps the rhythm of the row; the
   photograph is fitted inside instead of distorted. */
const SHAPE = {
  horizontal: { w: 1, h: 300 / 410 },
  vertical: { w: 300 / 410, h: 1 },
}

/* A centred horizontal painting was 410px wide on the original site. Below
   that the carousel scales to whichever of its own two dimensions is the
   tighter fit, taking a larger share of the width on a narrow screen where
   there is no room for the flanking paintings anyway. */
const FULL_WIDTH = 410
const WIDTH_SHARE = 0.36
const NARROW_WIDTH_SHARE = 0.55
const NARROW = 700

function useCentreWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(FULL_WIDTH)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect
      const share = box.width < NARROW ? NARROW_WIDTH_SHARE : WIDTH_SHARE
      setWidth(Math.min(FULL_WIDTH, box.width * share, box.height / 1.1))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return width
}

interface CarouselProps {
  items: Painting[]
  index: number
  onCenter: (index: number) => void
  onOpen: (painting: Painting) => void
}

export default function Carousel({ items, index, onCenter, onOpen }: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null)
  const width = useCentreWidth(ref)
  const from = Math.max(0, index - FLANKING - 1)
  const to = Math.min(items.length - 1, index + FLANKING + 1)
  const visible = []
  for (let i = from; i <= to; i++) visible.push(i)

  return (
    <div className={styles.carousel} ref={ref} style={{ '--w': `${width}px` } as CSSProperties}>
      {visible.map(i => {
        const painting = items[i]
        const position = i - index
        const step = STEPS[Math.abs(position)]
        const shape = painting.is_vertical ? SHAPE.vertical : SHAPE.horizontal
        const offset = Math.sign(position) * step.offset

        return (
          <button
            key={painting.tag}
            className={styles.item}
            style={{
              width: `calc(var(--w) * ${shape.w})`,
              height: `calc(var(--w) * ${shape.h})`,
              transform: `translate(calc(-50% + var(--w) * ${offset}), -50%) scale(${step.scale})`,
              opacity: step.opacity,
              zIndex: FLANKING + 1 - Math.abs(position),
              /* The step beyond the last visible one is parked behind the
                 centre painting, where it would otherwise take its clicks. */
              pointerEvents: step.opacity === 0 ? 'none' : 'auto',
            }}
            tabIndex={step.opacity === 0 ? -1 : 0}
            aria-hidden={step.opacity === 0}
            onClick={() => (position === 0 ? onOpen(painting) : onCenter(i))}
          >
            <PaintingImage tag={painting.tag} alt={painting.title} className={styles.img} />
          </button>
        )
      })}

      <button
        className={`${styles.arrow} ${styles.arrowPrev}`}
        onClick={() => onCenter(index - 1)}
        disabled={index <= 0}
        aria-label="Previous painting"
      >
        &#8249;
      </button>
      <button
        className={`${styles.arrow} ${styles.arrowNext}`}
        onClick={() => onCenter(index + 1)}
        disabled={index >= items.length - 1}
        aria-label="Next painting"
      >
        &#8250;
      </button>
    </div>
  )
}
