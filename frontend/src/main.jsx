import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import './styles/globals.css'; // Moved from _app.js

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/game" element={<Game />} />
    </Routes>
  </BrowserRouter>
);