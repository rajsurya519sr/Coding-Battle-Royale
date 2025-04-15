import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
const socket = io("http://localhost:3001");

export default function Matchmaking() {
  const [players, setPlayers] = useState([]);
  const [lobbyCode, setLobbyCode] = useState("");
  const [timer, setTimer] = useState(null);
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();

  const joinLobby = () => {
    const name = prompt("Enter your name:");
    if (name) {
      socket.emit("join_lobby", name);
      setJoined(true);
    }
  };

  useEffect(() => {
    socket.on("players_updated", (data) => setPlayers(data));
    socket.on("lobby_code", (code) => setLobbyCode(code));
    socket.on("countdown_tick", (timeLeft) => setTimer(timeLeft));
    socket.on("start_game", () => navigate("/select-language"));

    return () => {
      socket.off("players_updated");
      socket.off("lobby_code");
      socket.off("countdown_tick");
      socket.off("start_game");
    };
  }, []);

  return (
    <div className="matchmaking-container">
      <h1 className="title">Coding Battle Royale</h1>
      <p className="lobby-code">Lobby Code: <strong>{lobbyCode}</strong></p>

      {!joined && (
        <button className="join-btn" onClick={joinLobby}>
          Join the Battle
        </button>
      )}

      <div className="players-section">
        <h2>Players Joined ({players.length}/8)</h2>
        <ul>
          {players.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      </div>

      {timer !== null && (
        <div className="countdown-timer">
          Match starts in: <strong>{timer}</strong>s
        </div>
      )}
    </div>
  );
}
