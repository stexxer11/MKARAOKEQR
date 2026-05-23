import { BrowserRouter, Routes, Route } from "react-router-dom"

import MobilePage from "./pages/MobilePage"
import TvPage from "./pages/TvPage"
import AdminPage from "./pages/AdminPage"

import { KaraokeProvider } from "./context/KaraokeContext"

function App() {
  return (
    <KaraokeProvider>

      <BrowserRouter>

        <Routes>

          {/* 📱 USER: manda canciones a la cola */}
          <Route
            path="/"
            element={<MobilePage />}
          />

          {/* 📺 TV: SOLO LEE estado (Supabase realtime) */}
          <Route
            path="/tv"
            element={<TvPage />}
          />

          {/* 🛠️ ADMIN: control de cola / skip / cleanup */}
          <Route
            path="/admin"
            element={<AdminPage />}
          />

        </Routes>

      </BrowserRouter>

    </KaraokeProvider>
  )
}

export default App  