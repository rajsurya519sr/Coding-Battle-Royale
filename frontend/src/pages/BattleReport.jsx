import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import socket from "../lib/socket";

export default function BattleReport() {
  const navigate = useNavigate();
  const fullText = "New era of Competition..........";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [stats, setStats] = useState({
    battlesWon: 0,
    totalScore: 0,
    accuracy: 75,
    problemsSolved: 24,
    rank: "Bronze",
    level: 1,
    xp: 250,
    nextLevelXp: 1000,
    winStreak: 0,
    bestWinStreak: 3,
    averageScore: 450,
    totalBattles: 10,
    fastestSolve: "2:30",
    achievements: [
      { id: 1, name: "First Victory", description: "Win your first battle", unlocked: true, icon: "🏆" },
      { id: 2, name: "Speed Demon", description: "Solve a problem under 3 minutes", unlocked: true, icon: "⚡" },
      { id: 3, name: "Perfect Score", description: "Get 100% accuracy in a battle", unlocked: false, icon: "🎯" },
      { id: 4, name: "Battle Master", description: "Win 5 battles in a row", unlocked: false, icon: "👑" }
    ]
  });
  const [battleHistory] = useState([
    {
      id: 1,
      date: "2024-03-15",
      opponent: "CodeNinja",
      result: "Victory",
      score: 850,
      problems: 3,
      time: "15:30"
    },
    {
      id: 2,
      date: "2024-03-14",
      opponent: "ByteMaster",
      result: "Defeat",
      score: 450,
      problems: 2,
      time: "12:45"
    },
    {
      id: 3,
      date: "2024-03-13",
      opponent: "AlgoKing",
      result: "Victory",
      score: 950,
      problems: 4,
      time: "18:20"
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDeleting) {
        setDisplayText(fullText.slice(0, index + 1));
        setIndex((prevIndex) => prevIndex + 1);
        if (index === fullText.length) {
          setTimeout(() => setIsDeleting(true), 1000);
        }
      } else {
        setDisplayText(fullText.slice(0, index - 1));
        setIndex((prevIndex) => prevIndex - 1);
        if (index === 0) {
          setTimeout(() => setIsDeleting(false), 1000);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [index, isDeleting]);

  useEffect(() => {
    const socketId = socket.id;
    if (socketId) {
      const storedName = localStorage.getItem(`playerName_${socketId}`);
      const storedPicture = localStorage.getItem(`profilePicture_${socketId}`);
      if (storedName) setPlayerName(storedName);
      if (storedPicture) setProfilePicture(storedPicture);
    }
  }, []);

  return (
    <>
      <style jsx="true">{`
        @keyframes gridAnimation {
          0% { transform: translateY(50px); opacity: 0.2; }
          50% { transform: translateY(10px); opacity: 1; }
          100% { transform: translateX(50px); opacity: 0.2; }
        }
        .grid-overlay {
          position: fixed;
          top: -50px;
          left: -50px;
          width: 120%;
          height: 120%;
          display: grid;
          grid-template-columns: repeat(20, 1fr);
          grid-template-rows: repeat(10, 1fr);
          z-index: 0;
          pointer-events: none;
        }
        .grid-line {
          width: 100%;
          height: 100%;
          border-radius: 100%;
          border: 0.5px solid rgba(255, 120, 0, 0.1);
          animation: gridAnimation 3s infinite alternate ease-in-out;
        }
        .neon-border {
          box-shadow: 0 0 5px #ff7700;
        }
        .neon-border-back {
          animation: borderAnimation 3s linear infinite;
          transition: all 0.3s ease;
        }
        @keyframes borderAnimation {
          0%, 100% {
            box-shadow: 0 0 3px rgb(255, 120, 0);
          }
          50% {
            box-shadow: 0 0 40px rgb(255, 120, 0);
          }
        }
        .section-card {
          background: rgba(0, 0, 0, 0.4);
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 0 5px #ff7700;
        }
        .content-container {
          min-height: 100vh;
          padding-top: 120px;
          padding-bottom: 40px;
        }
      `}</style>

      <div className="min-h-screen w-screen bg-gradient-to-r from-[#1d0d00] via-black to-[#1d0d00] text-white font-['Orbitron'] relative">
        {/* Grid Overlay */}
        <div className="grid-overlay">
          {Array.from({ length: 200 }).map((_, i) => (
            <div key={i} className="grid-line"></div>
          ))}
        </div>

        {/* Title */}
        <div className="fixed top-[1%] left-[0.3%] text-[1.5vw] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] via-[silver] to-[#ff7700] z-50">
          Coding Battle Royale
        </div>

        {/* Animated Text */}
        <div className="fixed top-8 left-9 w-full text-left font-extrabold text-[0.7vw] leading-tight whitespace-nowrap mb-4 pl-8">
          <motion.p
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 3 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] via-[silver] to-[#ff7700]"
          >
            {displayText}
          </motion.p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/matchmaking')}
          className="fixed top-8 right-8 p-3 rounded-full neon-border-back backdrop-blur-sm transition-all duration-300 group bg-black/40 hover:bg-[#ff7700]/10 z-50"
        >
          <div className="relative">
            <span className="absolute right-14 whitespace-nowrap bg-black/80 px-3 py-1 rounded-md text-sm
              transition-opacity duration-300 text-[#96fff2] opacity-0 group-hover:opacity-100"
            >
              Back to Arena
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
        </button>

        <div className="content-container">
          <div className="container mx-auto px-8">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff7700] to-[#96fff2] p-[2px] group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,119,0,0.5)]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#ff7700] to-[#96fff2] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-[#ff7700] transition-transform duration-300 group-hover:scale-110 group-hover:text-[#96fff2]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#96fff2]">
                    {playerName || "Anonymous"}
                  </h1>
                  <p className="text-[#96fff2]/60">Level {stats.level} {stats.rank} • {stats.totalBattles} Battles</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#ff7700] font-bold text-2xl">{stats.totalScore}</p>
                <p className="text-[#96fff2]/60">Total Score</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-8">
              {/* Left Column - Battle Stats (Performance & History) */}
              <div className="col-span-2 space-y-8">
                {/* Performance Overview */}
                <div className="section-card">
                  <h2 className="text-xl font-bold text-[#ff7700] mb-6">Performance Overview</h2>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300">
                      <p className="text-[#96fff2]/60 text-sm mb-2">Win Rate</p>
                      <p className="text-2xl font-bold text-[#ff7700]">
                        {((stats.battlesWon / stats.totalBattles) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300">
                      <p className="text-[#96fff2]/60 text-sm mb-2">Current Streak</p>
                      <p className="text-2xl font-bold text-[#ff7700]">{stats.winStreak}</p>
                    </div>
                    <div className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300">
                      <p className="text-[#96fff2]/60 text-sm mb-2">Best Streak</p>
                      <p className="text-2xl font-bold text-[#ff7700]">{stats.bestWinStreak}</p>
                    </div>
                    <div className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300">
                      <p className="text-[#96fff2]/60 text-sm mb-2">Average Score</p>
                      <p className="text-2xl font-bold text-[#ff7700]">{stats.averageScore}</p>
                    </div>
                    <div className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300">
                      <p className="text-[#96fff2]/60 text-sm mb-2">Fastest Solve</p>
                      <p className="text-2xl font-bold text-[#ff7700]">{stats.fastestSolve}</p>
                    </div>
                    <div className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300">
                      <p className="text-[#96fff2]/60 text-sm mb-2">Accuracy</p>
                      <p className="text-2xl font-bold text-[#ff7700]">{stats.accuracy}%</p>
                    </div>
                  </div>
                </div>

                {/* Battle History */}
                <div className="section-card">
                  <h2 className="text-xl font-bold text-[#ff7700] mb-6">Battle History</h2>
                  <div className="space-y-4">
                    {battleHistory.map((battle) => (
                      <div key={battle.id} className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center space-x-3">
                              <p className="text-[#96fff2] font-semibold">vs {battle.opponent}</p>
                              <span className={`px-2 py-1 rounded text-xs ${battle.result === "Victory" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                {battle.result}
                              </span>
                            </div>
                            <p className="text-[#96fff2]/60 text-sm mt-1">{battle.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#ff7700] font-bold">+{battle.score} pts</p>
                            <p className="text-[#96fff2]/60 text-sm">{battle.problems} problems • {battle.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Achievements */}
              <div className="col-span-1">
                <div className="section-card">
                  <h2 className="text-xl font-bold text-[#ff7700] mb-6">Achievements</h2>
                  <div className="space-y-4">
                    {stats.achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 transition-all duration-300 ${achievement.unlocked ? 'hover:bg-[#ff7700]/20' : 'opacity-50'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <p className="text-[#96fff2] font-semibold">{achievement.name}</p>
                            <p className="text-[#96fff2]/60 text-sm">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 