import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ExploreTreks from './pages/ExploreTreks';
import DashboardPage from './pages/DashboardPage';
import WeatherPage from './pages/WeatherPage';
import SafetyPage from './pages/SafetyPage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExploreTreks />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
    </Layout>
  );
}
