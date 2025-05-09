import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useLocation } from "react-router-dom";

const socket = io("http://localhost:4000");

export default function GamePage() {
  const location = useLocation();
  const lobbyCode = location.state?.lobbyCode;
  const [problem, setProblem] = useState(null);
  const [level, setLevel] = useState(0);
  const [code, setCode] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [eliminated, setEliminated] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [results, setResults] = useState([]);

  const submitCode = () => {
    socket.emit("submit_code", { code, lobbyCode });
  };

  useEffect(() => {
    socket.on("start_level", ({ level, problem }) => {
      setLevel(level);
      setProblem(problem);
      setCode("");
    });
    socket.on("leaderboard_update", setLeaderboard);
    socket.on("eliminated", () => setEliminated(true));
    socket.on("game_over", (finalResults) => {
      setGameOver(true);
      setResults(finalResults);
    });

    return () => {
      socket.off("start_level");
      socket.off("leaderboard_update");
      socket.off("eliminated");
      socket.off("game_over");
    };
  }, []);

  if (eliminated) return <div className="p-10 text-red-500 text-xl">You have been eliminated at level {level}!</div>;

  if (gameOver)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🏆 Final Leaderboard</h1>
        <ul className="space-y-2">
          {results.map((player, index) => (
            <li key={player.id} className="flex justify-between bg-gray-800 text-white p-2 rounded">
              <span>{index + 1}. {player.username}</span>
              <span>{player.points} pts</span>
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">Level {level}</h1>
      {problem && (
        <div className="mb-6">
          <h2 className="text-xl text-cyan-300 font-bold">{problem.title}</h2>
          <p>{problem.description}</p>
          <p className="text-sm italic mt-2">Sample Input: {problem.sampleInput}</p>
          <p className="text-sm italic">Sample Output: {problem.sampleOutput}</p>
        </div>
      )}
      <CodeEditor
        value={code}
        language="javascript"
        placeholder="Write your code here..."
        onChange={(e) => setCode(e.target.value)}
        padding={15}
        style={{ backgroundColor: "#1e1e1e", color: "white", borderRadius: 10 }}
      />
      <button onClick={submitCode} className="mt-4 bg-green-500 px-4 py-2 rounded">
        Submit
      </button>
      <div className="mt-8 bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-2">Leaderboard</h3>
        <ul>
          {leaderboard.map((p, i) => (
            <li key={p.id} className="flex justify-between">
              <span>{i + 1}. {p.username}</span>
              <span>{p.points} pts</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}