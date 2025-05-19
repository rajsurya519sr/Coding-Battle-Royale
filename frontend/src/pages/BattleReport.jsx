import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import socket from "../lib/socket";

export default function BattleReport() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [isIconsFocused, setIsIconsFocused] = useState(true);
  const contentRef = useRef(null);
  const iconsRef = useRef(null);
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
  const [isContentVisible, setIsContentVisible] = useState(false);

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

  const handleSectionToggle = (section) => {
    if (activeSection === section) {
      setIsContentVisible(false);
      setTimeout(() => {
        setIsIconsFocused(true);
        iconsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
        setTimeout(() => {
          setActiveSection(null);
        }, 500);
      }, 300);
    } else {
      setIsIconsFocused(false);
      setActiveSection(section);
      setTimeout(() => {
        setIsContentVisible(true);
        contentRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (!activeSection) {
      setIsContentVisible(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [activeSection]);

  return (
    <>
      <style jsx="true">{`
        @keyframes gridAnimation {
          0% { transform: translateY(50px); opacity: 0.2; }
          50% { transform: translateY(10px); opacity: 1; }
          100% { transform: translateX(50px); opacity: 0.2; }
        }
        @keyframes pulseGlow {
          0% {
            box-shadow: 
              0 0 20px rgba(255, 119, 0, 0.3),
              0 0 40px rgba(150, 255, 242, 0.1);
          }
          50% {
            box-shadow: 
              0 0 40px rgba(255, 119, 0, 0.4),
              0 0 60px rgba(150, 255, 242, 0.2);
          }
          100% {
            box-shadow: 
              0 0 20px rgba(255, 119, 0, 0.3),
              0 0 40px rgba(150, 255, 242, 0.1);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .icon-button {
          background: linear-gradient(45deg, rgba(255, 119, 0, 0.05), rgba(150, 255, 242, 0.05));
          border: none;
          transition: all 0.5s ease;
          width: 140px;
          height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .icon-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, 
            rgba(255, 119, 0, 0.15),
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .icon-button:hover {
          transform: translateY(-5px);
        }
        .icon-button:hover::before {
          opacity: 1;
        }
        .icon-button::after {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, 
            rgba(255, 119, 0, 0.5),
            rgba(150, 255, 242, 0.5)
          );
          filter: blur(15px);
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: -1;
        }
        .icon-button:hover::after {
          opacity: 0.3;
        }
        .icon-button.active {
          background: linear-gradient(45deg, rgba(255, 119, 0, 0.15), rgba(150, 255, 242, 0.15));
          animation: pulseGlow 3s infinite ease-in-out;
          transform: translateY(-5px);
        }
        .icon-button.active::after {
          opacity: 0.4;
        }
        .icon-button svg {
          filter: drop-shadow(0 0 10px rgba(255, 119, 0, 0.3));
          transition: all 0.5s ease;
        }
        .icon-button:hover svg {
          filter: drop-shadow(0 0 15px rgba(255, 119, 0, 0.5));
          transform: scale(1.1);
        }
        .icon-button .text-sm {
          position: relative;
          z-index: 1;
        }
        .icon-gradient {
          fill: url(#icon-gradient);
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
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s ease-out;
        }
        .section-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .content-container {
          min-height: 100vh;
          padding-top: 120px;
          padding-bottom: 40px;
          overflow: hidden;
          position: relative;
          max-width: 800px;
          margin: 0 auto;
        }
        .content-wrapper {
          height: 100vh;
          overflow: ${activeSection ? 'auto' : 'hidden'};
          scroll-behavior: smooth;
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .content-wrapper::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
        .icons-section {
          min-height: calc(100vh - 400px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 1rem;
          transition: all 0.5s ease-out;
          opacity: ${activeSection ? '0.3' : '1'};
          transform: ${activeSection ? 'scale(0.95) translateY(-20px)' : 'scale(1) translateY(0)'};
        }
        .icons-section.focused {
          opacity: 1;
          transform: scale(1) translateY(0);
          transition-delay: 0.3s;
        }
        .section-content {
          max-width: 700px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        .content-transition {
          position: relative;
          width: 100%;
        }
        .close-button {
          background: linear-gradient(45deg, rgba(255, 119, 0, 0.1), rgba(150, 255, 242, 0.1));
          border: 1px solid rgba(255, 119, 0, 0.2);
          transition: all 0.3s ease;
          position: relative;
        }
        .close-button:hover {
          background: linear-gradient(45deg, rgba(255, 119, 0, 0.2), rgba(150, 255, 242, 0.2));
          border: 1px solid rgba(255, 119, 0, 0.4);
          transform: scale(1.1);
        }
        .close-button::before,
        .close-button::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 100px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 119, 0, 0.3));
        }
        .close-button::before {
          right: 100%;
          margin-right: 15px;
        }
        .close-button::after {
          left: 100%;
          margin-left: 15px;
          background: linear-gradient(90deg, rgba(255, 119, 0, 0.3), transparent);
        }
        .title-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .title-text {
          background: linear-gradient(to right, #ff7700, #ffaa00, #96fff2);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-shadow: 0 0 10px rgba(255, 119, 0, 0.3);
          padding: 0 2rem;
          position: relative;
        }
        .title-text::before,
        .title-text::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ff7700;
          top: 50%;
          transform: translateY(-50%);
          box-shadow: 0 0 15px #ff7700;
          animation: pulse 2s infinite;
        }
        .title-text::before {
          left: 0;
        }
        .title-text::after {
          right: 0;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: translateY(-50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-50%) scale(1.2);
          }
        }
        .header-container {
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.4) 0%,
            rgba(255, 119, 0, 0.05) 100%
          );
          border: none;
          border-radius: 0;
          padding: 2rem;
          margin: 1.5rem 1rem 3rem;
          position: relative;
          overflow: hidden;
          max-width: 800px;
          width: calc(100% - 2rem);
          backdrop-filter: blur(5px);
          clip-path: polygon(
            0 0,
            95% 0,
            100% 15%,
            100% 100%,
            5% 100%,
            0 85%
          );
        }

        .header-container::before {
          content: '';
          position: absolute;
          inset: 1px;
          background: linear-gradient(135deg, 
            rgba(255, 119, 0, 0.1),
            rgba(150, 255, 242, 0.05)
          );
          clip-path: polygon(
            0 0,
            95% 0,
            100% 15%,
            100% 100%,
            5% 100%,
            0 85%
          );
          z-index: -1;
        }

        .header-glow {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(255, 119, 0, 0.2), transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(150, 255, 242, 0.2), transparent 40%);
          filter: blur(20px);
          opacity: 0.3;
          animation: headerGlow 8s ease-in-out infinite alternate;
        }

        @keyframes headerGlow {
          0% {
            opacity: 0.3;
            transform: scale(0.95);
          }
          100% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        .border-line {
          position: absolute;
          background: linear-gradient(90deg,
            transparent,
            rgba(255, 119, 0, 0.8),
            rgba(150, 255, 242, 0.8),
            transparent
          );
        }

        .border-line-horizontal {
          height: 1px;
          width: 80px;
        }

        .border-line-vertical {
          width: 1px;
          height: 80px;
        }

        .border-top-left {
          top: 0;
          left: 0;
          animation: moveRight 4s linear infinite;
        }

        .border-top-right {
          top: 0;
          right: 0;
          animation: moveLeft 4s linear infinite;
        }

        .border-bottom-left {
          bottom: 0;
          left: 0;
          animation: moveRight 4s linear infinite;
        }

        .border-bottom-right {
          bottom: 0;
          right: 0;
          animation: moveLeft 4s linear infinite;
        }

        .border-left-top {
          top: 0;
          left: 0;
          animation: moveDown 4s linear infinite;
        }

        .border-left-bottom {
          bottom: 0;
          left: 0;
          animation: moveUp 4s linear infinite;
        }

        .border-right-top {
          top: 0;
          right: 0;
          animation: moveDown 4s linear infinite;
        }

        .border-right-bottom {
          bottom: 0;
          right: 0;
          animation: moveUp 4s linear infinite;
        }

        @keyframes moveRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(1000%); }
        }

        @keyframes moveLeft {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-1000%); }
        }

        @keyframes moveDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }

        @keyframes moveUp {
          0% { transform: translateY(100%); }
          100% { transform: translateY(-1000%); }
        }

        .stat-badge {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 119, 0, 0.3);
          padding: 0.5rem 1rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .stat-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg,
            transparent,
            rgba(255, 119, 0, 0.1),
            transparent
          );
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }

        .stat-badge:hover::before {
          transform: translateX(100%);
        }

        body {
          overflow: ${activeSection ? 'auto' : 'hidden'};
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        body::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>

      <div className="min-h-screen w-screen bg-gradient-to-r from-[#1d0d00] via-black to-[#1d0d00] text-white font-['Orbitron'] relative">
        {/* SVG Gradient Definitions */}
        <svg width="0" height="0">
          <defs>
            <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff7700" />
              <stop offset="50%" stopColor="#ffaa00" />
              <stop offset="100%" stopColor="#96fff2" />
            </linearGradient>
          </defs>
        </svg>

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

        <div className="content-wrapper">
        <div className="content-container">
            {/* Header Section */}
            <div className="flex justify-center w-full">
              <div className="header-container">
                <div className="header-glow" />
                
                {/* Animated Border Lines */}
                <div className="border-line border-line-horizontal border-top-left" />
                <div className="border-line border-line-horizontal border-top-right" />
                <div className="border-line border-line-horizontal border-bottom-left" />
                <div className="border-line border-line-horizontal border-bottom-right" />
                
                <div className="border-line border-line-vertical border-left-top" />
                <div className="border-line border-line-vertical border-left-bottom" />
                <div className="border-line border-line-vertical border-right-top" />
                <div className="border-line border-line-vertical border-right-bottom" />
                
                <div className="grid grid-cols-[auto_1fr_auto] gap-6 items-center relative z-10">
                  {/* Profile Section */}
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#ff7700] to-[#96fff2] rounded-full opacity-20 group-hover:opacity-40 blur-lg transition duration-500"></div>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff7700] to-[#96fff2] p-[2px] relative">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
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

                  {/* Player Info */}
                  <div className="flex flex-col space-y-3">
                <div>
                      <h1 className="text-4xl font-black mb-2 tracking-wider">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] via-[#ffaa00] to-[#96fff2] relative inline-block">
                    {playerName || "Anonymous"}
                          <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff7700] via-[#ffaa00] to-[#96fff2] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
                        </span>
                  </h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="stat-badge">
                        <div className="flex items-center space-x-2">
                          <svg className="w-3 h-3 text-[#ff7700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-[#96fff2] font-semibold text-sm">Level {stats.level}</span>
                </div>
              </div>
                      <div className="stat-badge">
                        <div className="flex items-center space-x-2">
                          <svg className="w-3 h-3 text-[#ff7700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-[#96fff2] font-semibold text-sm">{stats.rank}</span>
              </div>
            </div>
                      <div className="stat-badge">
                        <div className="flex items-center space-x-2">
                          <svg className="w-3 h-3 text-[#ff7700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="text-[#96fff2] font-semibold text-sm">{stats.totalBattles} Battles</span>
                        </div>
                    </div>
                    </div>
                    </div>

                  {/* Score Section */}
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#ff7700]/10 to-[#96fff2]/10 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 blur-xl"></div>
                    <div className="relative">
                      <div className="text-right mb-1">
                        <p className="text-4xl font-black bg-gradient-to-r from-[#ff7700] to-[#96fff2] bg-clip-text text-transparent">
                          {stats.totalScore}
                        </p>
                    </div>
                      <div className="flex items-center justify-end space-x-1">
                        <svg className="w-4 h-4 text-[#ff7700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <p className="text-[#96fff2] text-sm font-semibold">Total Score</p>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Icons */}
            <div className={`icons-section ${isIconsFocused ? 'focused' : ''}`} ref={iconsRef}>
              <div className="flex justify-center gap-20 py-8">
                <button
                  onClick={() => handleSectionToggle('performance')}
                  className={`icon-button rounded-2xl transition-all duration-500 ${
                    activeSection === 'performance' ? 'active' : ''
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="url(#icon-gradient)" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#96fff2]">
                    Performance
                  </div>
                </button>
                <button
                  onClick={() => handleSectionToggle('history')}
                  className={`icon-button rounded-2xl transition-all duration-500 ${
                    activeSection === 'history' ? 'active' : ''
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="url(#icon-gradient)" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#96fff2]">
                    History
                  </div>
                </button>
                <button
                  onClick={() => handleSectionToggle('achievements')}
                  className={`icon-button rounded-2xl transition-all duration-500 ${
                    activeSection === 'achievements' ? 'active' : ''
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="url(#icon-gradient)" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <div className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#96fff2]">
                    Achievements
                  </div>
                </button>
              </div>
            </div>

            {/* Content Sections */}
            <AnimatePresence mode="wait">
              <div className="content-transition">
                {activeSection === 'performance' && (
                  <motion.div
                    ref={contentRef}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: isContentVisible ? 1 : 0, y: isContentVisible ? 0 : 50 }}
                    exit={{ 
                      opacity: 0, 
                      y: -50, 
                      transition: { 
                        duration: 0.5,
                        ease: "easeInOut"
                      } 
                    }}
                    transition={{ 
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    className={`section-card mb-8 ${isContentVisible ? 'visible' : ''}`}
                  >
                    <div className="section-content">
                      <motion.div 
                        className="title-container"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <h2 className="title-text">Performance Overview</h2>
                      </motion.div>
                      <div className="flex justify-center mb-6">
                        <button
                          onClick={() => handleSectionToggle('performance')}
                          className="close-button w-10 h-10 rounded-full flex items-center justify-center group"
                        >
                          <motion.svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            stroke="url(#icon-gradient)"
                            fill="none"
                            initial={{ rotate: 0 }}
                            whileHover={{ rotate: 90 }}
                            transition={{ duration: 0.3 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </motion.svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { label: "Win Rate", value: `${((stats.battlesWon / stats.totalBattles) * 100).toFixed(1)}%` },
                          { label: "Current Streak", value: stats.winStreak },
                          { label: "Best Streak", value: stats.bestWinStreak },
                          { label: "Average Score", value: stats.averageScore },
                          { label: "Fastest Solve", value: stats.fastestSolve },
                          { label: "Accuracy", value: `${stats.accuracy}%` }
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.1 * (index + 1),
                              duration: 0.3
                            }}
                            className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300"
                          >
                            <p className="text-[#96fff2]/60 text-sm mb-2">{item.label}</p>
                            <p className="text-2xl font-bold text-[#ff7700]">{item.value}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'history' && (
                  <motion.div
                    ref={contentRef}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: isContentVisible ? 1 : 0, y: isContentVisible ? 0 : 50 }}
                    exit={{ 
                      opacity: 0, 
                      y: -50, 
                      transition: { 
                        duration: 0.5,
                        ease: "easeInOut"
                      } 
                    }}
                    transition={{ 
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    className={`section-card mb-8 ${isContentVisible ? 'visible' : ''}`}
                  >
                    <div className="section-content">
                      <motion.div 
                        className="title-container"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <h2 className="title-text">Battle History</h2>
                      </motion.div>
                      <div className="flex justify-center mb-6">
                        <button
                          onClick={() => handleSectionToggle('history')}
                          className="close-button w-10 h-10 rounded-full flex items-center justify-center group"
                        >
                          <motion.svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            stroke="url(#icon-gradient)"
                            fill="none"
                            initial={{ rotate: 0 }}
                            whileHover={{ rotate: 90 }}
                            transition={{ duration: 0.3 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </motion.svg>
                        </button>
                      </div>
                  <div className="space-y-4">
                        {battleHistory.map((battle, index) => (
                          <motion.div
                            key={battle.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.1 * (index + 1),
                              duration: 0.3
                            }}
                            className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300"
                          >
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
                          </motion.div>
                    ))}
                  </div>
                </div>
                  </motion.div>
                )}

                {activeSection === 'achievements' && (
                  <motion.div
                    ref={contentRef}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: isContentVisible ? 1 : 0, y: isContentVisible ? 0 : 50 }}
                    exit={{ 
                      opacity: 0, 
                      y: -50, 
                      transition: { 
                        duration: 0.5,
                        ease: "easeInOut"
                      } 
                    }}
                    transition={{ 
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    className={`section-card ${isContentVisible ? 'visible' : ''}`}
                  >
                    <div className="section-content">
                      <motion.div 
                        className="title-container"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <h2 className="title-text">Achievements</h2>
                      </motion.div>
                      <div className="flex justify-center mb-6">
                        <button
                          onClick={() => handleSectionToggle('achievements')}
                          className="close-button w-10 h-10 rounded-full flex items-center justify-center group"
                        >
                          <motion.svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            stroke="url(#icon-gradient)"
                            fill="none"
                            initial={{ rotate: 0 }}
                            whileHover={{ rotate: 90 }}
                            transition={{ duration: 0.3 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </motion.svg>
                        </button>
              </div>
                  <div className="space-y-4">
                        {stats.achievements.map((achievement, index) => (
                          <motion.div
                        key={achievement.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.1 * (index + 1),
                              duration: 0.3
                            }}
                        className={`bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 transition-all duration-300 ${achievement.unlocked ? 'hover:bg-[#ff7700]/20' : 'opacity-50'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <p className="text-[#96fff2] font-semibold">{achievement.name}</p>
                            <p className="text-[#96fff2]/60 text-sm">{achievement.description}</p>
                          </div>
                        </div>
                          </motion.div>
                    ))}
                  </div>
                </div>
                  </motion.div>
                )}
              </div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
} 