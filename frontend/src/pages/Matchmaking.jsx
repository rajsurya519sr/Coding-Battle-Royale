import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import socket from "../lib/socket";  // Import the shared socket instance

export default function Matchmaking() {
  const navigate = useNavigate();
  const [lobbyCode, setLobbyCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [joined, setJoined] = useState(false);
  // const [isCreator, setIsCreator] = useState(false);
  const [cursorTrail, setCursorTrail] = useState([]);
  const [showTransition, setShowTransition] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const socketRef = useRef(null);
  const [displayText, setDisplayText] = useState("");
  const fullText = "New era of Competition..........";
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isEditingPicture, setIsEditingPicture] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [socketId, setSocketId] = useState(null);
  const [isNewUser, setIsNewUser] = useState(true);

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
    // Initialize socket connection
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected in Matchmaking:", socket.id);
      setSocketId(socket.id);
      const storedName = localStorage.getItem(`playerName_${socket.id}`);
      if (storedName) {
        console.log("Reconnecting with stored name:", storedName);
        setPlayerName(storedName);
        socket.emit('join_battle', storedName);
        setJoined(true);
        setIsNewUser(false);
      }
    });

    // Socket event listeners
    socket.on("lobby_info", ({ lobbyCode, players }) => {
      console.log("Matchmaking received lobby info:", { lobbyCode, players });
      setLobbyCode(lobbyCode);
      setPlayers(players);
    });
    
    socket.on("countdown", (time) => {
      setCountdown(time);
    });
    
    socket.on("redirect", (path) => {
      setShowTransition(true);
      setTimeout(() => {
        navigate(path);
      }, 2000);
    });

    // Cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("lobby_info");
      socket.off("countdown");
      socket.off("redirect");
    };
  }, [navigate]);

  const handleJoinBattle = () => {
    const storedName = localStorage.getItem(`playerName_${socketId}`);
    let nameToUse = storedName;

    if (!nameToUse) {
      // If no stored name, use a default or part of socketId if available
      if (socketId) {
        nameToUse = `Player_${socketId.substring(0, 6)}`;
      } else {
        nameToUse = "Anonymous"; // Fallback if socketId is also null
        console.log("Socket not connected yet, using default name.");
        // Optionally, you might want to disable the button until connected
        // or show a message to the user.
      }
    }

    console.log("Joining battle with name:", nameToUse);
    setPlayerName(nameToUse);
    // localStorage.setItem(`playerName_${socketId}`, nameToUse.trim()); // Optionally save generated name?
    socket.emit("join_battle", nameToUse);
    setJoined(true);
    setShowNameInput(false); // Ensure this is false
    setIsNewUser(false);
  };

  const handleNameSubmit = (e) => {
    // This function is no longer needed if name input is removed
    // e.preventDefault();
    // if (playerName.trim() && socketId) {
    //   console.log("Joining battle with name:", playerName);
    //   localStorage.setItem(`playerName_${socketId}`, playerName.trim());
    //   setPlayerName(playerName.trim());
    //   socket.emit("join_battle", playerName.trim());
    //   setJoined(true);
    //   setShowNameInput(false);
    //   setIsNewUser(false);
    // }
  };

  // const handleStartRoomGame = () => {
  //   if (lobbyCode) {
  //     socket.emit("start_room_game", lobbyCode);
  //   }
  // };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorTrail((prevTrail) => {
        if (prevTrail.length > 10) return prevTrail.slice(1);
        return [...prevTrail, { id: Math.random(), x: e.clientX, y: e.clientY }];
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Add hover sound effect to buttons
  const handleButtonHover = () => {
  };

  // Add click sound effect to buttons
  const handleButtonClick = () => {
  };

  const handleProfileClick = () => {
    handleButtonClick();
    if (isFirstVisit && socketId) {
      console.log("First visit, clearing data");
      localStorage.removeItem(`playerName_${socketId}`);
      localStorage.removeItem(`profilePicture_${socketId}`);
      setPlayerName("");
      setIsFirstVisit(false);
    }
    setShowProfileCard(true);
  };

  const handleCloseProfileCard = () => {
    setShowProfileCard(false);
  };

  const handleNameEdit = () => {
    setNewName(playerName || "");
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (newName.trim() && socketId) {
      console.log("Saving new name:", newName);
      localStorage.setItem(`playerName_${socketId}`, newName.trim());
      setPlayerName(newName.trim());
      socket.emit("update_name", newName.trim());
      setIsEditingName(false);
    }
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file && socketId) {
      console.log("Changing profile picture");
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        console.log("Saving new profile picture");
        localStorage.setItem(`profilePicture_${socketId}`, imageData);
        socket.emit("update_profile_picture", imageData);
        setIsEditingPicture(false);
        // Force a re-render of the profile card
        setShowProfileCard(false);
        setTimeout(() => setShowProfileCard(true), 100);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes matrixRain {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(100vh);
            opacity: 1;
          }
        }
        .matrix-symbol {
          position: fixed;
          font-family: "Times New Roman";
          font-size: 30px;
          animation: matrixRain 5s linear infinite;
          background: linear-gradient(to top, silver, #96fff2, silver);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes cursorTrailFade {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }
        .cursor-trail {
          position: absolute;
          width: 50px;
          height: 50px;
          background: radial-gradient(
            circle,
            rgba(150, 255, 242, 0.8) 100%,
            rgba(150, 255, 242, 0) 100%
          );
          border-radius: 100%;
          pointer-events: none;
          animation: cursorTrailFade 1s linear forwards;
        }
        @keyframes borderAnimation {
          0%,
          100% {
            border-image-source: linear-gradient(
              45deg,
              #ff7700,
              silver,
              #ff7700
            );
            box-shadow: 0 0 3px rgb(255, 120, 0);
          }
          50% {
            border-image-source: linear-gradient(
              135deg,
              #ff7700,
              silver,
              #ff7700
            );
            box-shadow: 0 0 40px rgb(255, 120, 0);
          }
        }
        .neon-border {
          border: 0px solid;
          border-image-slice: 1;
          animation: borderAnimation 3s linear infinite;
          transition: all 0.3s ease;
        }
        .loader-ring {
          position: absolute;
          box-shadow: 0 0 10px #ff7700, 0 0 20px #ff7700, 0 0 40px #ff7700;
        }
        .loader-core {
          box-shadow: 0 0 15px #ff7700, 0 0 30px #ff7700, 0 0 50px #ff7700;
        }
        @keyframes gridAnimation {
          0% {
            transform: translateY(50px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(10px);
            opacity: 1;
          }
          100% {
            transform: translateX(50px);
            opacity: 0.2;
          }
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
        @keyframes rgbGlow {
          0%, 100% { box-shadow: 0 0 5px #ff7700; }
        }

        .signup-login-container {
          box-shadow: 0 0 5px #ff7700;
        }

        .name-input-overlay {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
        }
        
        .name-input {
          background: rgba(255, 119, 0, 0.1);
          border: 2px solid #ff7700;
          color: #96fff2;
          transition: all 0.3s ease;
        }
        
        .name-input:focus {
          border-color: #96fff2;
          box-shadow: 0 0 15px rgba(150, 255, 242, 0.5);
          outline: none;
        }
        
        .submit-button {
          background: rgba(255, 119, 0, 0.2);
          border: 2px solid #ff7700;
          color: #96fff2;
          transition: all 0.3s ease;
        }
        
        .submit-button:hover {
          background: rgba(255, 119, 0, 0.4);
          box-shadow: 0 0 20px rgba(255, 119, 0, 0.5);
        }

        .profile-icon {
          transition: all 0.3s ease;
          position: relative;
          filter: drop-shadow(0 0 10px rgba(255, 119, 0, 0.3));
        }

        .profile-icon:hover {
          transform: scale(1.1);
          filter: drop-shadow(0 0 15px rgba(255, 119, 0, 0.5));
        }

        .profile-icon:hover::after {
          content: 'Dev Card';
          position: absolute;
          top: 50%;
          right: calc(100% + 15px);
          transform: translateY(-50%);
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(29, 13, 0, 0.95));
          color: #96fff2;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.9rem;
          white-space: nowrap;
          border: 1px solid #ff7700;
          box-shadow: 0 0 20px rgba(255, 119, 0, 0.2),
                     inset 0 0 10px rgba(255, 119, 0, 0.1);
          backdrop-filter: blur(4px);
          animation: tooltipFade 0.3s ease-in-out;
          font-family: 'Orbitron', sans-serif;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .profile-icon:hover::before {
          content: '';
          position: absolute;
          top: 50%;
          right: calc(100% + 5px);
          transform: translateY(-50%);
          border-left: 10px solid #ff7700;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          filter: drop-shadow(0 0 5px rgba(255, 119, 0, 0.5));
          animation: tooltipFade 0.3s ease-in-out;
        }

        @keyframes tooltipFade {
          from {
            opacity: 0;
            transform: translate(-10px, -50%);
          }
          to {
            opacity: 1;
            transform: translate(0, -50%);
          }
        }

        .profile-icon-inner {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #ff7700, #ff9955);
          border-radius: 16px;
          padding: 2px;
          position: relative;
          overflow: hidden;
        }

        .profile-icon-inner::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            #96fff2 60deg,
            transparent 120deg,
            #ff7700 180deg,
            transparent 240deg,
            #96fff2 300deg,
            transparent 360deg
          );
          animation: rotate 4s linear infinite;
          opacity: 0.8;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .profile-icon-content {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1d0d00, #000000);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          box-shadow: inset 0 0 15px rgba(255, 119, 0, 0.2);
        }

        .profile-icon svg {
          filter: drop-shadow(0 0 3px rgba(255, 119, 0, 0.7));
        }
      `}</style>

      <div className="h-screen w-screen bg-gradient-to-r from-[#1d0d00] via-[black] to-[#1d0d00] text-white relative flex items-center justify-center font-['Orbitron'] overflow-hidden">
        {/* Profile Icon - Show for both new and existing users */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-4 right-4 z-50"
        >
          <button
            onClick={handleProfileClick}
            className="profile-icon w-14 h-14 cursor-pointer"
            onMouseEnter={handleButtonHover}
          >
            <div className="profile-icon-inner">
              <div className="profile-icon-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.5"
                >
                  <defs>
                    <linearGradient id="gradient-stroke" x1="2" y1="2" x2="22" y2="22">
                      <stop offset="0%" stopColor="#ff7700" />
                      <stop offset="50%" stopColor="#ff9955" />
                      <stop offset="100%" stopColor="#96fff2" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Outer Frame */}
                  <path
                    d="M5 8L12 4L19 8V16L12 20L5 16V8Z"
                    stroke="url(#gradient-stroke)"
                    fill="none"
                    strokeWidth="0.5"
                  />

                  {/* Inner Frame */}
                  <path
                    d="M7 9L12 6L17 9V15L12 18L7 15V9Z"
                    stroke="url(#gradient-stroke)"
                    fill="rgba(255, 119, 0, 0.1)"
                    filter="url(#glow)"
                  />

                  {/* Center Circle */}
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="url(#gradient-stroke)"
                    fill="none"
                    strokeDasharray="0.5 1"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 12 12"
                      to="360 12 12"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Triangular Pattern */}
                  <path
                    d="M12 9L14 12L12 15L10 12L12 9Z"
                    fill="url(#gradient-stroke)"
                    filter="url(#glow)"
                  />

                  {/* Connection Lines */}
                  <path
                    d="M12 4V6M19 8L17 9M5 8L7 9M12 18V20M19 16L17 15M5 16L7 15"
                    stroke="url(#gradient-stroke)"
                    strokeWidth="0.5"
                    strokeDasharray="0.5 1"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="6;0"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Corner Accents */}
                  <circle cx="12" cy="4" r="0.5" fill="url(#gradient-stroke)" />
                  <circle cx="19" cy="8" r="0.5" fill="url(#gradient-stroke)" />
                  <circle cx="19" cy="16" r="0.5" fill="url(#gradient-stroke)" />
                  <circle cx="12" cy="20" r="0.5" fill="url(#gradient-stroke)" />
                  <circle cx="5" cy="16" r="0.5" fill="url(#gradient-stroke)" />
                  <circle cx="5" cy="8" r="0.5" fill="url(#gradient-stroke)" />

                  {/* Energy Core */}
                  <circle
                    cx="12"
                    cy="12"
                    r="1"
                    fill="url(#gradient-stroke)"
                    filter="url(#glow)"
                  >
                    <animate
                      attributeName="r"
                      values="0.8;1.2;0.8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Title */}
        <div className="fixed top-[1%] left-[0.3%] text-[1.5vw] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] via-[silver] to-[#ff7700]">
          Coding Battle Royale
        </div>

        {/* Animated Text */}
        <div className="fixed top-8 left-9 w-full text-left font-extrabold text-[0.7vw] leading-tight whitespace-nowrap mb-4 pl-8">
          <motion.p
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 3 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#ff7700]"
          >
            {displayText}
          </motion.p>
        </div>

        {showTransition && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-transparent">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-[#1d0d00] via-[#161616] to-[#1d0d00] origin-bottom"
            />
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-[#1d0d00] via-[#161616] to-[#1d0d00] origin-top"
            />
            <div className="relative flex items-center justify-center">
              <motion.div
                className="loader-ring absolute w-24 h-24 border-4 border-[#ff7700] border-opacity-50 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="loader-ring absolute w-32 h-32 border-4 border-[#ff7700] border-opacity-30 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="loader-core w-10 h-10 bg-[#ff7700] rounded-full shadow-lg"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </div>
          </div>
        )}

        {!showTransition && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: showTransition ? 0 : 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <div className="grid-overlay">
              {Array.from({ length: 200 }).map((_, i) => (
                <div key={i} className="grid-line"></div>
              ))}
            </div>

            {/* Cursor Trail Effect */}
        {cursorTrail.map((particle) => (
          <motion.div
            key={particle.id}
            className="cursor-trail"
            style={{ left: particle.x, top: particle.y }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1 }}
          />
        ))}

            {Array.from({ length: 50 }).map((_, i) => (
              <motion.span
                key={i}
                className="matrix-symbol"
                style={{
                  left: `${Math.random() * 100}vw`,
                  top: `-${Math.random() * 100}vh`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                }}
              >
                {String.fromCharCode(33 + Math.random() * 94)}
              </motion.span>
            ))}

            {!joined ? (
              
              <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] via-[#ff7700] to-[#ff7700] z-20">
              <div className="absolute top-[46%] left-[-3.5%] w-full z-40">
            <img
              src="/logo1.png"
              alt="Coding Battle Royale Logo"
              className="w-[32%] h-[32%] object-contain animate-pulse z-40"
              // style={{ transform: "scaleX(-1)" }}
            />
          </div>
          <div className="absolute top-[46%] left-[71.5%] w-full z-40">
            <img
              src="/logo1.png"
              alt="Coding Battle Royale Logo"
              className="w-[32%] h-[32%] object-contain animate-pulse z-40"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
              <motion.h1
                className="text-[4vw] max-w-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] via-silver to-[#ff7700] mb-0"
              >
                Decrypting Lobby Access...
              </motion.h1>
            
              <motion.p className="text-lg text-[#96fff2] mb-12 font-mono">
                Top warriers assemble here. Click to unlock your arena.
              </motion.p>
            
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-32 h-32 bg-black/80 neon-border text-white text-lg font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer rounded-full flex items-center justify-center z-50"
                onClick={() => {
                  handleButtonClick();
                  handleJoinBattle();
                }}
                onMouseEnter={handleButtonHover}
              >
                Join Battle
              </motion.button>
            </motion.div>
            
            ) : (
              <>
                {joined && (
                  <>
                    {/* <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute top-[5%] w-full text-center"
                    >
                      <h1 className="text-[3vw] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] via-silver to-[#ff7700]">
                        Welcome to the Arena
                      </h1>
                      <p className="text-[1.2vw] text-[#96fff2] mt-2 font-mono">
                        Prepare for the ultimate coding showdown
                      </p>
                    </motion.div> */}

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="absolute top-[5%] w-full text-center text-[3vw] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] via-[#ff7700] to-[#ff7700] z-20 space-x-8"
                    >
                      Lobby Code: <span className="text-[#ff7700]">{lobbyCode}</span>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="absolute top-[15%] w-full text-center text-[1.2vw] font-extrabold text-white"
                    >
                      Players Joined: {" "}
                      <span className="text-white">{players.length} / 8</span>
                    </motion.div>

                    <motion.ul 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="absolute top-[25%]  transform -translate-x-1/2 grid grid-cols-2 gap-6 text-[1.2vw] text-[#96fff2] item-center"
                    >
                      {players.map((player) => (
                        <motion.li
                          key={player.id}
                          className="signup-login-container bg-[#ff7700]/30 backdrop-blur-md px-3 py-3 rounded-lg"
                        >
                          {player.name}
                        </motion.li>
                      ))}
                    </motion.ul>

                    {countdown !== null && (
                      <div className="absolute bottom-[2%] w-full text-center text-[3vw] font-bold text-yellow-400 animate-bounce">
                        Game starts in: {countdown}s
                      </div>
                    )}

                    <motion.div 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="absolute top-[70%]  transform -translate-x-1/2  flex flex-col items-center justify-center text-center"
                    >
                      <div>
                        <h2 className="text-[3.5vw] font-bold text-[#96fff2] mb-2">
                        Connected. Locked In.
                        </h2>
                        <p className="text-[2vw] text-[#ff7700]">
                        Connected to arena. Your rivals are joining.
                        </p>
                      </div>
                    </motion.div>

                    {/* Bottom Images */}
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="absolute top-[46%] w-full flex justify-between px-10"
                    >
                      
                      
                      <div className="absolute left-[-3.5%] w-full z-40">
                        <img
                          src="/logo1.png"
                          alt="Coding Battle Royale Logo"
                          className="w-[32%] h-[32%] object-contain animate-pulse z-40"
                          // style={{ transform: "scaleX(-1)" }}
                        />
                      </div>
                      <div className="absolute left-[71.5%] w-full z-40">
                        <img
                          src="/logo1.png"
                          alt="Coding Battle Royale Logo"
                          className="w-[32%] h-[32%] object-contain animate-pulse z-40"
                          style={{ transform: "scaleX(-1)" }}
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Profile Card - Show for both new and existing users */}
        {showProfileCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleCloseProfileCard}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="relative w-[400px] bg-gradient-to-br from-[#1d0d00] to-black rounded-2xl p-6 border border-[#ff7700]/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseProfileCard}
                className="absolute top-4 right-4 text-[#ff7700] hover:text-[#96fff2] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Card Content */}
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff7700] to-[#96fff2] p-[2px] group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,119,0,0.5)]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ff7700] to-[#96fff2] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                        {socketId && localStorage.getItem(`profilePicture_${socketId}`) ? (
                          <img 
                            src={localStorage.getItem(`profilePicture_${socketId}`)} 
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
                    <button
                      onClick={() => setIsEditingPicture(true)}
                      className="absolute bottom-0 right-0 bg-[#ff7700] text-black rounded-full p-1.5 hover:bg-[#96fff2] transition-colors duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1">
                    {isEditingName ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="bg-black/50 border border-[#ff7700] rounded px-2 py-1 text-[#96fff2] focus:outline-none focus:border-[#96fff2]"
                          placeholder="Enter new name"
                          maxLength={20}
                          autoFocus
                        />
                        <button
                          onClick={handleNameSave}
                          className="bg-[#ff7700] text-black px-2 py-1 rounded hover:bg-[#96fff2] transition-colors duration-300"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingName(false)}
                          className="bg-black/50 text-[#96fff2] px-2 py-1 rounded hover:bg-[#ff7700] transition-colors duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#96fff2] group-hover:from-[#96fff2] group-hover:to-[#ff7700] transition-all duration-300">
                          {playerName || "Anonymous"}
                        </h2>
                        <button
                          onClick={handleNameEdit}
                          className="text-[#ff7700] hover:text-[#96fff2] transition-colors duration-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <p className="text-[#96fff2]/80 text-sm group-hover:text-[#96fff2] transition-colors duration-300">
                      Coding Warrior
                    </p>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[#96fff2]/60 text-sm">Battles Won</p>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ff7700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="flex items-end space-x-2">
                      <p className="text-2xl font-bold text-[#ff7700]">0</p>
                      <p className="text-[#96fff2]/60 text-sm mb-1">victories</p>
                    </div>
                  </div>
                  <div className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[#96fff2]/60 text-sm">Total Score</p>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ff7700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex items-end space-x-2">
                      <p className="text-2xl font-bold text-[#ff7700]">0</p>
                      <p className="text-[#96fff2]/60 text-sm mb-1">points</p>
                    </div>
                  </div>
                </div>

                {/* Accuracy and Problems Tackled Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[#96fff2]/60 text-sm">Accuracy</p>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ff7700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="relative h-2 bg-[#ff7700]/20 rounded-full overflow-hidden">
                      <div className="absolute top-0 left-0 h-full w-[75%] bg-gradient-to-r from-[#ff7700] to-[#ff9955] rounded-full"></div>
                    </div>
                    <p className="text-2xl font-bold text-[#ff7700] mt-2">75%</p>
                  </div>
                  <div className="bg-[#ff7700]/10 rounded-lg p-4 border border-[#ff7700]/20 hover:bg-[#ff7700]/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[#96fff2]/60 text-sm">Problems Tackled</p>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ff7700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex items-end space-x-2">
                      <p className="text-2xl font-bold text-[#ff7700]">24</p>
                      <p className="text-[#96fff2]/60 text-sm mb-1">problems</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center w-full">
                  <button
                    onClick={() => {
                      handleCloseProfileCard();
                      navigate('/battle-report');
                    }}
                    className="px-12 py-3 neon-border text-[#96fff2]/60 rounded-full text-lg hover:bg-[#ff7700]/10 transition-all duration-300 w-[200px]"
                  >
                    Battle Report
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Picture Upload Modal */}
        {isEditingPicture && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-[#1d0d00] to-black p-6 rounded-lg border border-[#ff7700]/30 w-96">
              <h3 className="text-xl font-bold text-[#96fff2] mb-4">Change Profile Picture</h3>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <label className="cursor-pointer">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ff7700] to-[#96fff2] p-[2px] hover:scale-105 transition-transform duration-300">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#ff7700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditingPicture(false)}
                    className="px-4 py-2 rounded bg-black/50 text-[#96fff2] hover:bg-[#ff7700] transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}