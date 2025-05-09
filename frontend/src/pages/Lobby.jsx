import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../lib/socket";

export default function Lobby() {
  const [playersCount, setPlayersCount] = useState(0);
  const [playersList, setPlayersList] = useState([]);
  const [gameCode, setGameCode] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(null);
  const maxPlayers = 8;
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("updatePlayers", (data) => {
      navigate("/Hero");
      setPlayersCount(data.count);
      setPlayersList(data.players);
      setGameCode(data.gameCode);
    });

    socket.on("alreadyJoined", (msg) => {
      setMessage(msg);
    });

    socket.on("updateCountdown", (time) => {
      setCountdown(time);
    });

    socket.on("matchStart", () => {
       navigate("/Game");
    });

    return () => {
      socket.off("updatePlayers");
      socket.off("alreadyJoined");
      socket.off("updateCountdown");
      socket.off("matchStart");
    };
  }, []);

  const joinGame = () => {
    socket.emit("joinGame");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">🔥 Coding Battle Royale 🔥</h1>
      <h2 className="text-lg mt-2">Players: {playersCount} / {maxPlayers}</h2>

      <h3 className="mt-2 text-green-400">Lobby Code: <span className="font-bold">{gameCode}</span></h3>

      <button 
        onClick={joinGame} 
        className="mt-4 px-6 py-2 bg-blue-500 rounded"
      >
        Join Match
      </button>

      {message && <p className="mt-2 text-red-500">{message}</p>}

      {countdown !== null && (
        <h3 className="mt-4 text-yellow-400 text-xl">
          Match starts in {countdown} seconds...
        </h3>
      )}

      <div className="mt-4 bg-gray-800 p-4 rounded w-64">
        <h3 className="text-lg font-bold">Joined Players</h3>
        <ul>
          {playersList.map((id, index) => (
            <li key={id} className="p-1">{`Player ${index + 1}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
