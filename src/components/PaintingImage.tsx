import { galleryImageUrl, NO_IMAGE_URL } from '../lib/paintingImages'

interface PaintingImageProps {
  tag: string
  alt: string
  className?: string
}

export default function PaintingImage({ tag, alt, className }: PaintingImageProps) {
  return (
    <img
      src={galleryImageUrl(tag)}
      alt={alt}
      className={className}
      onError={e => {
        const img = e.target as HTMLImageElement
        if (img.src.endsWith(NO_IMAGE_URL)) return
        img.src = NO_IMAGE_URL
      }}
    />
  )
}
