import { useEffect, useState } from 'react'
import type { Painting, Exhibition } from '../types'

/* The paintings are 840KB of JSON, most of it the stories. Imported, they were
   part of the initial bundle, so every visitor paid for all of them before
   seeing anything - including on the two pages that are only text, and before
   the welcome page's three thumbnails. Fetched, they are a file the browser
   caches on its own and only the pages that read them wait for. */
function dataUrl(name: string): string {
  return `${import.meta.env.BASE_URL}data/${name}.json`
}

/* One request per file per session, however many components ask. */
function once<T>(load: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | null = null
  return () => (pending ??= load())
}

async function fetchJson<T>(name: string): Promise<T> {
  const response = await fetch(dataUrl(name))
  if (!response.ok) throw new Error(`${name}.json: ${response.status}`)
  return (await response.json()) as T
}

export const loadPaintings = once(async () => {
  const all = await fetchJson<Painting[]>('paintings')
  return all.filter(p => !p.is_private)
})

export const loadExhibitions = once(() => fetchJson<Exhibition[]>('exhibitions'))

type State<T> = { data: T | null; failed: boolean }

/** `load` must be stable across renders; the loaders above are module-level. */
export function useData<T>(load: () => Promise<T>): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, failed: false })

  useEffect(() => {
    let live = true
    load().then(
      data => live && setState({ data, failed: false }),
      () => live && setState({ data: null, failed: true })
    )
    return () => {
      live = false
    }
  }, [load])

  return state
}
