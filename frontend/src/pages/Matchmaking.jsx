import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export default function Matchmaking() {
  const navigate = useNavigate();
  const [lobbyCode, setLobbyCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [joined, setJoined] = useState(false);
  // const [isCreator, setIsCreator] = useState(false);
  const [cursorTrail, setCursorTrail] = useState([]);
  const [showTransition, setShowTransition] = useState(false);
  const socketRef = useRef(null);
  const [displayText, setDisplayText] = useState("");
  const fullText = "New era of Competition..........";
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

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
    socketRef.current = io("http://localhost:3000");

    // Socket event listeners
    socketRef.current.on("lobby_info", ({ lobbyCode, players }) => {
      setLobbyCode(lobbyCode);
      setPlayers(players);
    });
    
    socketRef.current.on("countdown", (time) => {
      setCountdown(time);
    });
    
    socketRef.current.on("redirect", (path) => {
      setShowTransition(true);
      setTimeout(() => {
        navigate(path);
      }, 2000);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [navigate]);

  const handleJoinBattle = () => {
    const name = prompt("Enter your name:");
    if (name && socketRef.current) {
      socketRef.current.emit("join_battle", name);
      setJoined(true);
    }
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
    // playSound(SOUNDS.HOVER, 0.3);
  };

  // Add click sound effect to buttons
  const handleButtonClick = () => {
    // playSound(SOUNDS.CLICK);
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
        
    0% { box-shadow: 0 0 5px #96fff2; }  /* Red */
    // 25% { box-shadow: 0 0 10px #ff7700; } /* Green */
    50% { box-shadow: 0 0 15px #ff7700; } /* Blue */
    // 75% { box-shadow: 0 0 10px #ff7700; } /* Magenta */
    100% { box-shadow: 0 0 5px #96fff2; } /* Back to Red */
  }

  .signup-login-container {
    animation: rgbGlow 3s infinite alternate ease-in-out;
  }
      `}</style>

      <div className="h-screen w-screen bg-gradient-to-r from-[#1d0d00] via-[black] to-[#1d0d00] text-white relative flex items-center justify-center font-['Orbitron'] overflow-hidden">
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
      </div>
    </>
  );
}