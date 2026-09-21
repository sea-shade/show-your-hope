/* Files in public/ are served under the site's base path, which is '/' in dev
   and the repository name on GitHub Pages. Vite rebases the paths it finds in
   index.html and in CSS url(), but not the ones written in components, so
   those go through here. Paths are relative: BASE_URL ends in a slash. */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`
}
