export const NO_IMAGE_URL = '/no_image.jpg'

export function galleryImageUrl(tag: string): string {
  return `/painting_images/700/${tag}.jpg`
}

export function markerImageUrl(tag: string): string {
  return `/painting_images/sidekick/${tag}_sk.jpg`
}
