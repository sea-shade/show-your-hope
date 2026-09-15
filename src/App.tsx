import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

/* One chunk per page, so that the map's Leaflet and the gallery's carousel are
   fetched by the people who go there rather than by everyone. */
const Welcome = lazy(() => import('./pages/Welcome'))
const Gallery = lazy(() => import('./pages/Gallery'))
const WhoAreWe = lazy(() => import('./pages/WhoAreWe'))
const WorldMap = lazy(() => import('./pages/WorldMap'))
const Tunisia = lazy(() => import('./pages/Tunisia'))

export default function App() {
  return (
    <HashRouter>
      <Navbar />
      {/* An empty page rather than a spinner: the chunks are small enough that
          a message would flash rather than inform. */}
      <Suspense fallback={<div className="page" />}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/whoarewe" element={<WhoAreWe />} />
          <Route path="/worldmap" element={<WorldMap />} />
          <Route path="/tunisia" element={<Tunisia />} />
        </Routes>
      </Suspense>
      <Footer />
    </HashRouter>
  )
}
