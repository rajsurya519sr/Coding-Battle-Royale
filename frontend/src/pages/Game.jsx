import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react"; // ✅ default import
import socket from "../lib/socket";
import { useNavigate } from "react-router-dom";

const PROGRAMMING_LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python" },
  { id: "cpp", name: "C++" },
];

export default function Game() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your code here");
  const [question, setQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [hint, setHint] = useState("");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isEliminated, setIsEliminated] = useState(false);

  useEffect(() => {
    socket.on("question", (data) => {
      setQuestion(data);
    });

    socket.on("hint", (data) => {
      setHint(data);
    });

    socket.on("leaderboardUpdate", (data) => {
      setLeaderboard(data);
    });

    socket.on("eliminated", () => {
      setIsEliminated(true);
    });

    socket.on("gameOver", (data) => {
      // Redirect to results screen, or display game summary
      navigate("/results", { state: { results: data } });
    });

    // Request the first level question
    socket.emit("requestQuestion", { level: 1 });

    return () => {
      socket.off("question");
      socket.off("hint");
      socket.off("leaderboardUpdate");
      socket.off("eliminated");
      socket.off("gameOver");
    };
  }, [navigate]);

  const handleSubmit = () => {
    socket.emit("submitCode", {
      language,
      code,
      level: currentLevel,
    });
  };

  const handleRequestHint = () => {
    socket.emit("requestHint", { level: currentLevel });
  };

  if (isEliminated) {
    return <div className="text-red-600 text-2xl p-4">You’ve been eliminated!</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Slide 1: Coding Problem */}
      <div className="w-full md:w-1/2 overflow-y-auto p-4">
        <h2 className="text-xl font-bold mb-2">Level {currentLevel}</h2>
        {question ? (
          <>
            <h3 className="text-lg font-semibold mb-2">{question.title}</h3>
            <p className="mb-4">{question.description}</p>
            <div className="bg-gray-100 p-2 rounded">
              <p><strong>Sample Input:</strong> {question.sampleInput}</p>
              <p><strong>Sample Output:</strong> {question.sampleOutput}</p>
              <p><strong>Test Cases:</strong></p>
              <ul className="list-disc ml-4">
                {question.testCases.map((test, index) => (
                  <li key={index}>{test}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p>Loading question...</p>
        )}
        <button
          onClick={() => setCurrentLevel((prev) => prev + 1)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Next Level (dev only)
        </button>
      </div>

      {/* Slide 2: Code Editor & Leaderboard */}
      <div className="w-full md:w-1/2 flex flex-col p-4 bg-gray-50 overflow-y-auto">
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-2 border rounded w-full"
          >
            {PROGRAMMING_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <Editor
          height="300px"
          language={language}
          value={code}
          onChange={(val) => setCode(val)}
          theme="vs-dark"
        />

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleRequestHint}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Hint
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>

        {hint && (
          <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-400">
            <strong>Hint:</strong> {hint}
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
          <ul className="space-y-2">
            {leaderboard.map((player, index) => (
              <li key={index} className="flex justify-between">
                <span>{player.name}</span>
                <span>{player.points} pts</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
