import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Matchmaking from "./pages/Matchmaking"; // or your main page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Matchmaking />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
