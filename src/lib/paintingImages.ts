import { assetUrl } from './assets'

export const NO_IMAGE_URL = assetUrl('no_image.jpg')

export function galleryImageUrl(tag: string): string {
  return assetUrl(`painting_images/700/${tag}.jpg`)
}

export function sidekickImageUrl(tag: string): string {
  return assetUrl(`painting_images/sidekick/${tag}_sk.jpg`)
}
