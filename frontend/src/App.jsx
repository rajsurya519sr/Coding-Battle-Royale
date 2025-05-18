import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SoundProvider } from './components/SoundManager';
import Index from "./pages/Index";
import Home from './pages/Home';
// import Lobby from './pages/Lobby';
import Game from "./pages/Game";
import Matchmaking from "./pages/Matchmaking";
import BattleReport from "./pages/BattleReport";

function App() {
  return (
    <Router>
      <SoundProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          {/* <Route path="/lobby" element={<Lobby />} /> */}
          <Route path="/game" element={<Game />} />
          <Route path="/matchmaking" element={<Matchmaking />} />
          <Route path="/battle-report" element={<BattleReport />} />
          {/* Add more routes as needed */}
        </Routes>
      </SoundProvider>
    </Router>
  );
}

export default App;
