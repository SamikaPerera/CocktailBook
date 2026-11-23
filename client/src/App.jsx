// Top-level component: shared layout + the list of routes (pages).
import { Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header.jsx';
import BokehBackground from './components/BokehBackground.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import SpecsPage from './pages/SpecsPage.jsx';
import SpecDetailPage from './pages/SpecDetailPage.jsx';
import ManagePage from './pages/ManagePage.jsx';
import SpecFormPage from './pages/SpecFormPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  const location = useLocation();

  return (
    <>
      {/* Drifting "bar lights" behind everything */}
      <BokehBackground />

      <div className="app">
        <Header />
        <OfflineBanner />

        <main className="app-main">
          {/* A new key on every page change makes React re-create this div,
              which replays its fade-in animation = smooth page transitions. */}
          <div key={location.pathname} className="page">
            <Routes>
              {/* Public pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Any logged-in user */}
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/specs" element={<ProtectedRoute><SpecsPage /></ProtectedRoute>} />
              <Route path="/specs/:id" element={<ProtectedRoute><SpecDetailPage /></ProtectedRoute>} />

              {/* Managers only */}
              <Route path="/manage" element={<ProtectedRoute role="manager"><ManagePage /></ProtectedRoute>} />
              <Route path="/manage/new" element={<ProtectedRoute role="manager"><SpecFormPage /></ProtectedRoute>} />
              <Route path="/manage/:id/edit" element={<ProtectedRoute role="manager"><SpecFormPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}
