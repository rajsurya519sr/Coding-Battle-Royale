import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("http://localhost:3000");

export default function Game() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [cursorTrail, setCursorTrail] = useState([]);
  const [showTransition, setShowTransition] = useState(false);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const fullText = "New era of Competition..........";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [language, setLanguage] = useState("java");
  const editorRef = useRef(null);
  const [isAtScrollBoundary, setIsAtScrollBoundary] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  
  const hints = [
    "Think about Kadane's Algorithm - a dynamic programming approach.",
    "Keep track of the maximum sum ending at each position.",
    "For each element, decide if it's better to start a new subarray or extend the existing one."
  ];

  useEffect(() => {
    socket.on("question", (data) => {
      setQuestion(data);
    });
    
    socket.on("players", (data) => {
      setPlayers(data);
    });
    
    socket.on("countdown", (time) => {
      setCountdown(time);
    });
    
    socket.on("next_slide", () => {
      setSlideIndex((prev) => prev + 1);
    });
    
    socket.on("redirect", (path) => {
      setShowTransition(true);
      setTimeout(() => navigate(path), 2000);
    });

    return () => {
      socket.off("question");
      socket.off("players");
      socket.off("countdown");
      socket.off("next_slide");
      socket.off("redirect");
    };
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDeleting) {
        setDisplayText(fullText.slice(0, index + 1));
        setIndex((prevIndex) => prevIndex + 1);
        if (index < fullText.length) {
          // playSound(SOUNDS.TYPING, 0.1);
        }
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

  // Handle scroll boundaries and horizontal navigation
  useEffect(() => {
    const handleWheel = (e) => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        e.preventDefault();
        
        // Reduce speed for better control
        const scrollMultiplier = 3.5;
        container.scrollBy({
          top: e.deltaY * scrollMultiplier,
          behavior: 'auto'
        });
      }
    };

    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        setIsAtScrollBoundary(false);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleWheel);
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [slideIndex]);

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

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleHintClick = () => {
    if (slideIndex === 1) {
      setShowHint(true);
      setHintIndex((prev) => (prev + 1) % hints.length);
    }
  };

  const handleSubmit = () => {
    // Add your submit logic here
  };

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
      <style jsx="true">{`
        @keyframes matrixRain {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(100vh); opacity: 1; }
        }

        .cyber-border {
          position: relative;
          border: 2px solid transparent;
          background: linear-gradient(#000, #000) padding-box,
                    linear-gradient(135deg, #96fff2, transparent, #ff7700) border-box;
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

        @keyframes borderAnimation {
          0%,100% {
            border-image-source: linear-gradient(45deg, #ff7700, silver, #ff7700);
            box-shadow: 0 0 3px rgb(255, 120, 0);
          }
          50% {
            border-image-source: linear-gradient(135deg, #ff7700, silver, #ff7700);
            box-shadow: 0 0 40px rgb(255, 120, 0);
          }
        }
        
        .neon-border {
          border: 0px solid;
          border-image-slice: 1;
          animation: borderAnimation 3s linear infinite;
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

        @keyframes gridAnimation {
          0% { transform: translateY(50px); opacity: 0.2; }
          50% { transform: translateY(10px); opacity: 1; }
          100% { transform: translateX(50px); opacity: 0.2; }
        }

        .loader-ring {
          position: absolute;
          box-shadow: 0 0 10px #ff7700, 0 0 20px #ff7700, 0 0 40px #ff7700;
        }

        .loader-core {
          box-shadow: 0 0 15px #ff7700, 0 0 30px #ff7700, 0 0 50px #ff7700;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #ff7700 rgba(0, 0, 0, 0.2);
          scroll-behavior: auto;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
          margin: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ff7700;
          border-radius: 3px;
          border: 1px solid rgba(150, 255, 242, 0.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #96fff2;
        }

        .slide-transition {
          transition: transform 0.5s ease-in-out;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          animation: modalFadeIn 0.3s ease-out;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div ref={containerRef} 
      className="h-screen w-screen bg-gradient-to-r from-[#1d0d00] via-black to-[#1d0d00] text-white font-['Orbitron'] overflow-hidden relative">
        
        {/* Navigation Buttons - Fixed Top Right */}
        <div className="fixed top-8 right-8 flex flex-col space-y-4 z-50">
          {/* Problem Statement Button - Only visible on Editor slide */}
          {slideIndex === 1 && (
            <button 
              onClick={() => {
                handleButtonClick();
                setSlideIndex(0);
              }}
              onMouseEnter={handleButtonHover}
              className="p-3 rounded-full cyber-border backdrop-blur-sm transition-all duration-300 group bg-black/40 hover:bg-[#ff7700]/10"
            >
              <div className="relative">
                <span className="absolute right-14 whitespace-nowrap bg-black/80 px-3 py-1 rounded-md text-sm
                  transition-opacity duration-300 text-[#96fff2] opacity-0 group-hover:opacity-100"
                >
                  Problem Statement
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </button>
          )}
          
          {/* Code Editor Button - Only visible on Problem Statement slide */}
          {slideIndex === 0 && (
            <button 
              onClick={() => {
                handleButtonClick();
                setSlideIndex(1);
              }}
              onMouseEnter={handleButtonHover}
              className="p-3 rounded-full cyber-border backdrop-blur-sm transition-all duration-300 group bg-black/40 hover:bg-[#ff7700]/10"
            >
              <div className="relative">
                <span className="absolute right-14 whitespace-nowrap bg-black/80 px-3 py-1 rounded-md text-sm
                  transition-opacity duration-300 text-[#96fff2] opacity-0 group-hover:opacity-100"
                >
                  Code Editor
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-50">
          {[0, 1].map((index) => (
            <button
              key={index}
              onClick={() => setSlideIndex(index)}
              className={`h-3 rounded-full transition-all duration-300 
                ${slideIndex === index 
                  ? 'w-12 bg-[#ff7700]' 
                  : 'w-3 bg-[#96fff2]/50 hover:bg-[#96fff2]'}`}
            />
          ))}
        </div>

        <div className="grid-overlay">
          {Array.from({ length: 200 }).map((_, i) => (
            <div key={i} className="grid-line"></div>
          ))}
        </div>

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

        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 text-[2vw] font-bold text-[#ff7700]">
          Level {slideIndex + 1}
        </div>

        {countdown !== null && (
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-[2vw] text-yellow-400 animate-pulse">
            Time Left: {countdown}s
          </div>
        )}

        {/* Slides */}
        <div 
          className="flex flex-row w-full h-full slide-transition" 
          style={{ transform: `translateX(-${slideIndex * 100}%)` }}
        >
          {/* Slide 1 - Question */}
          <div className="min-w-full flex flex-col justify-center items-center p-12 z-40">
            <div className="cyber-border bg-black/40 rounded-lg w-[80%] h-[80vh] flex flex-col backdrop-blur-sm relative">
              {/* Fixed Title */}
              <div className="p-6 border-b border-[#96fff2]/20">
                <div className="text-[1.8vw] font-bold text-[#96fff2]">Array Battle: Maximum Subarray Sum</div>
              </div>
              
              {/* Scrollable Content */}
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="space-y-6 pr-2">
                  {/* Problem Description */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Problem</h3>
                    <p className="text-gray-200">
                      Given an array of integers, find the contiguous subarray (containing at least one number) 
                      which has the largest sum and return its sum. Your solution must have a time complexity of O(n).
                    </p>
                  </div>

                  {/* Function Description */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Function Description</h3>
                    <p className="text-gray-200">
                      Complete the function <code className="bg-black/60 px-2 py-1 rounded">maxSubArray</code> which takes the following parameter:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-200">
                      <li><code className="bg-black/60 px-2 py-1 rounded">nums</code>: An array of integers</li>
                    </ul>
                  </div>

                  {/* Constraints */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Constraints</h3>
                    <ul className="list-disc list-inside text-gray-200">
                      <li>1 ≤ nums.length ≤ 10⁵</li>
                      <li>-10⁴ ≤ nums[i] ≤ 10⁴</li>
                    </ul>
                  </div>

                  {/* Input Format */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Input Format</h3>
                    <p className="text-gray-200">
                      The first line contains an integer n, the size of the array.<br/>
                      The second line contains n space-separated integers nums[i].
                    </p>
                  </div>

                  {/* Output Format */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Output Format</h3>
                    <p className="text-gray-200">
                      Return a single integer denoting the maximum sum of a contiguous subarray.
                    </p>
                  </div>

                  {/* Sample Input */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Sample Input</h3>
                    <pre className="bg-black/60 p-4 rounded-md text-gray-200 font-mono">
9
-2 1 -3 4 -1 2 1 -5 4</pre>
                  </div>

                  {/* Sample Output */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Sample Output</h3>
                    <pre className="bg-black/60 p-4 rounded-md text-gray-200 font-mono">6</pre>
                  </div>

                  {/* Explanation */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Explanation</h3>
                    <p className="text-gray-200">
                      The contiguous subarray [4,-1,2,1] has the largest sum = 6.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fixed Button at Bottom */}
              <div className="p-4 border-t border-[#96fff2]/20 flex justify-center">
                <button 
                  onClick={() => setSlideIndex(1)} 
                  className="px-12 py-3 neon-border text-white rounded-full text-lg hover:bg-[#ff7700]/10 transition-all duration-300 w-[200px]"
                >
                  Start Coding
                </button>
              </div>
            </div>
          </div>

          {/* Slide 2 - Editor & Leaderboard */}
          <div className="min-w-full mt-[10vh] flex flex-row justify-between items-start p-8 gap-8">
            <div className="w-[65%] bg-transparent rounded-lg">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-[2.5vw] font-bold text-[#ff7700] mb-3">Choose Your Weapon</h3>
                <select 
                  className="w-[20%] cyber-border bg-black/40 p-3 rounded-md text-[#96fff2] focus:outline-none"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <div className="w-full cyber-border rounded-lg overflow-hidden">
                {/* VSCode-like header */}
                <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-[#3c3c3c]">
                  <div className="flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <span className="ml-4 text-[#96fff2] text-sm">code.battle</span>
                  </div>
                  <div className="flex space-x-4 text-[#96fff2] text-sm">
                    <span>{language.toUpperCase()}</span>
                    <span>UTF-8</span>
                  </div>
                </div>

                {/* Monaco Editor */}
                <Editor
                  height="50vh"
                  defaultLanguage={language}
                  language={language}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    snippetSuggestions: "top",
                    wordBasedSuggestions: true,
                    lineNumbers: "on",
                    renderLineHighlight: "all",
                    matchBrackets: "always",
                    autoClosingBrackets: "always",
                    autoClosingQuotes: "always",
                    formatOnPaste: true,
                    formatOnType: true,
                    smoothScrolling: true,
                    mouseWheelScrollSensitivity: 1.5,
                    fastScrollSensitivity: 5,
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      verticalScrollbarSize: 6,
                      horizontalScrollbarSize: 6,
                      verticalHasArrows: false,
                      horizontalHasArrows: false,
                      useShadows: false,
                      verticalSliderSize: 6,
                      horizontalSliderSize: 6
                    }
                  }}
                  onMount={handleEditorDidMount}
                />
              </div>

              <div className="mt-6 flex items-center space-x-8">
                <button 
                  onClick={handleHintClick}
                  onMouseEnter={handleButtonHover}
                  className="px-6 py-3 bg-black/40 text-[#96fff2] border-2 border-[#96fff2] rounded-md hover:bg-[#96fff2]/10 transition-all duration-300 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Hint</span>
                </button>
                <button 
                  onClick={handleSubmit}
                  onMouseEnter={handleButtonHover}
                  className="px-6 py-3 bg-black/40 text-[#ff7700] border-2 border-[#ff7700] rounded-md hover:bg-[#ff7700]/10 transition-all duration-300"
                >
                  Submit
                </button>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="w-[30%] h-[78vh] cyber-border bg-black/40 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-[1.5vw] font-bold text-[#ff7700] mb-4">Leaderboard</div>
              <ul className="space-y-4">
                {players.map((player, idx) => (
                  <li 
                    key={idx} 
                    className="bg-black/60 text-[#96fff2] p-4 rounded-md border-[#96fff2] border-2 flex justify-between items-center"
                  >
                    <span className="text-lg">{player.name}</span>
                    <span className="text-[#ff7700] font-bold">{player.points || 0} pts</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

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

        {/* Hint Modal - Only show when on second slide */}
        {showHint && slideIndex === 1 && (
          <div className="fixed inset-0 flex items-center justify-center z-[1000]">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowHint(false)}></div>
            <div 
              className="modal-content cyber-border bg-black/95 rounded-lg w-[500px] p-6 relative z-[1001]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#ff7700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-[#ff7700] font-bold text-xl">Hint #{hintIndex + 1}</span>
                </div>
                <button 
                  onClick={() => {
                    handleButtonClick();
                    setShowHint(false);
                  }}
                  onMouseEnter={handleButtonHover}
                  className="text-[#96fff2] hover:text-[#ff7700] transition-colors p-2 hover:bg-[#96fff2]/10 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-[#96fff2] text-lg leading-relaxed">{hints[hintIndex]}</p>
              <div className="mt-6 flex justify-between items-center">
                <span className="text-[#96fff2]/60 text-sm">Click anywhere outside to close</span>
                <button 
                  onClick={() => {
                    handleButtonClick();
                    setHintIndex((prev) => (prev + 1) % hints.length);
                  }}
                  className="px-4 py-2 bg-black/40 text-[#ff7700] border-2 border-[#ff7700] rounded-md hover:bg-[#ff7700]/10 transition-all duration-300"
                >
                  Next Hint
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
