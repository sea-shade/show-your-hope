import { useState } from 'react'
import { sidekickImageUrl } from '../lib/paintingImages'

interface SidekickImageProps {
  tag: string
  alt: string
  className?: string
}

/** Photograph of the artist with their painting. Not every painting has one,
 *  and the only way to tell is to ask for the file, so a miss renders nothing. */
export default function SidekickImage({ tag, alt, className }: SidekickImageProps) {
  const [missing, setMissing] = useState('')

  if (missing === tag) return null

  return (
    <img
      src={sidekickImageUrl(tag)}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setMissing(tag)}
    />
  )
}
