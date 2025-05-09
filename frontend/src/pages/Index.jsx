
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


export default function GamifiedHeroPage() {
  const navigate = useNavigate(); // Define navigate inside the component
  const fullText = "New era of Competition..........";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorTrail, setCursorTrail] = useState([]);
  const [showTransition, setShowTransition] = useState(false);
  const [showContent, setShowContent] = useState(true);
  // const [showLoader, setShowLoader] = useState(false);

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
    const handleMouseMove = (e) => {
      setCursorTrail((prevTrail) => {
        if (prevTrail.length > 10) return prevTrail.slice(1);
        return [...prevTrail, { id: Math.random(), x: e.clientX, y: e.clientY }];
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleStartJourney = () => {
    setShowTransition(true);
    setShowContent(true);
    // setShowLoader(true); // Show loader when transition starts

    setTimeout(() => {
        navigate("/Home"); // Redirect after transition
    }, 2000); // Match the animation duration
  };

  return (
    <>
      <style jsx global>{`
        @keyframes matrixRain {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(100vh); opacity: 1; }
        }
        .matrix-symbol {
          position: absolute;
          font-family: Times New Roman;
          font-size: 30px;
          animation: matrixRain 5s linear infinite;
          background: linear-gradient(to top, silver, #96fff2, silver);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes cursorTrailFade {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        .cursor-trail {
          position: absolute;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(150, 255, 242 , 0.8) 100%, rgba(150, 255, 242 , 0) 100%);
          border-radius: 100%;
          pointer-events: none;
          animation: cursorTrailFade 1s linear forwards;
        }
        @keyframes borderAnimation {
          0%, 100% {
            border-image-source: linear-gradient(45deg, #ff7700, silver, #ff7700);
            box-shadow: 0 0 3px rgb(255, 120, 0 );
          }
          50% {
            border-image-source: linear-gradient(135deg, #ff7700, silver, #ff7700);
            box-shadow: 0 0 40px rgb(255, 120, 0 );
          }
        }
        .neon-border {
          border: 0px solid;
          border-image-slice: 1;
          animation: borderAnimation 3s linear infinite;
          transition: all 0.3s ease;
        }
        .neon-border-1 {
          border: 1px solid;
          border-image-slice: 1;
          animation: borderAnimation 3s linear infinite;
          transition: all 1s ease;
        }
          @keyframes gridAnimation {
    0% { transform: translateY(50px); opacity: 0.2; }
    50% { transform: translateY(10px); opacity: 1; }
    50% { transform: translateX(10px); opacity: 1; }
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
    border: 0.5px solid rgba(255, 120, 0 , 0.1);
    animation: gridAnimation 3s infinite alternate ease-in-out;
  }
     .loader-ring {
          position: absolute;
          box-shadow: 0 0 10px #ff7700, 0 0 20px #ff7700, 0 0 40px #ff7700;
        }
        .loader-core {
          box-shadow: 0 0 15px #ff7700, 0 0 30px #ff7700, 0 0 50px #ff7700;
        }
      `}</style>

{/* <div className="grid-overlay">
  {Array.from({ length: 200 }).map((_, i) => (
    <div key={i} className="grid-line"></div>
  ))}
</div> */}

      <div className="h-screen w-screen bg-gradient-to-r from-[#1d0d00] via-[black] to-[#1d0d00] text-white relative flex items-center justify-center font-['Orbitron'] overflow-hidden">
      {/* Futuristic Door Opening Animation on Start Journey Click */}
      {showTransition && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-transparent">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-[#1d0d00] via-[#161616] to-[#1d0d00] origin-bottom"
          />
          {/* <div className="grid-overlay">
          {Array.from({ length: 200 }).map((_, i) => (
          <div key={i} className="grid-line"></div>
          ))}
        </div> */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-[#1d0d00] via-[#161616] to-[#1d0d00] origin-top"
          />
           {/* 🌀 Futuristic Loader */}
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

      {/* Show Content Only if Not in Transition */}
      {showContent && (
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

        {/* Matrix Code Rain */}
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
        {/* Logo Centered Above Text */}
<div className="absolute top-[15%] flex justify-center w-full">
  <img 
    src="/logo8.png" 
    alt="Coding Battle Royale Logo" 
    className="w-[16%] h-[16%] object-contain animate-pulse"
  />
</div>


        {/* Title Above Start Journey Button */}
        <div className="absolute top-[30%] w-full text-center text-[9vw] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] via-[silver] to-[#ff7700]">
          Coding Battle Royale
        </div>

        {/* Fully Circular Start Journey Button */}
        <div className="absolute flex items-center justify-center top-[75%] transform -translate-y-1/2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-32 h-32 bg-transparent neon-border text-white text-lg font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer rounded-full flex items-center justify-center"
            onClick={handleStartJourney}
            // onClick={() => router.push("/extended")}
          >
            Start Journey
          </motion.button>
        </div>

        {/* Buttons with Neon Borders */}
        {/* <div className="absolute top-4 right-6 flex space-x-8">
          <button className="px-8 py-4 bg-transparent neon-border-1 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 text-sm uppercase tracking-wider">
            Login
          </button>
          <button className="px-8 py-4 bg-transparent neon-border-1 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 text-sm uppercase tracking-wider">
            Register
          </button>
        </div> */}

        {/* Animated Text */}
        <div className="absolute top-[50%] left-[37%] w-full text-left font-extrabold text-[2vw] leading-tight whitespace-nowrap mb-4 pl-8">
          <motion.p
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 3 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700]  to-[#ff7700]"
          >
            {displayText}
          </motion.p>
        </div>
        </motion.div>
      )}
      </div>
    </>
  );
}
