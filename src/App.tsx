import { HashRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Welcome from './pages/Welcome'
import Gallery from './pages/Gallery'
import WhoAreWe from './pages/WhoAreWe'
import WorldMap from './pages/WorldMap'
import Tunisia from './pages/Tunisia'

export default function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/whoarewe" element={<WhoAreWe />} />
        <Route path="/worldmap" element={<WorldMap />} />
        <Route path="/tunisia" element={<Tunisia />} />
      </Routes>
      <Footer />
    </HashRouter>
  )
}
