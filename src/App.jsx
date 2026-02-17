import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './hooks/useAuth';
import { BalanceProvider } from './hooks/useBalance';
import { MissionsProvider } from './hooks/useMissions';
import AppLayout from './components/layout/AppLayout';
import Lobby from './pages/Lobby';
import Leaderboard from './pages/Leaderboard';
import Missions from './pages/Missions';
import Boutique from './pages/Boutique';
import GamePage from './pages/GamePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BalanceProvider>
          <MissionsProvider>
            <AnimatePresence mode="wait">
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Lobby />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/missions" element={<Missions />} />
                  <Route path="/boutique" element={<Boutique />} />
                  <Route path="/game/:id" element={<GamePage />} />
                </Route>
              </Routes>
            </AnimatePresence>
          </MissionsProvider>
        </BalanceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
