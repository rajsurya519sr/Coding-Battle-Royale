import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export default function ExtendedPage() {
  const navigate = useNavigate();
  const fullText = "New era of Competition..........";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorTrail, setCursorTrail] = useState([]);
  const [showIntro, setShowIntro] = useState(true);
  const [showContent, setShowContent] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  // const [isVisible, setIsVisible] = useState(false);
  const [signup, setSignupVisible] = useState(false);
  const [login, setLoginVisible] = useState(false);
  const containerRef = useRef(null);

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
    setTimeout(() => {
      setShowIntro(false);
      setShowLoader(false);
      setShowContent(true); // Reveal full content after intro
    }, 3000);
  }, []);

  useEffect(() => {
    const handleWheelScroll = (event) => {
      if (containerRef.current) {
        event.preventDefault();
        containerRef.current.scrollLeft += event.deltaY;
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheelScroll, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheelScroll);
      }
    };
  }, []);

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



  return (
    <>
            {/* 🎨 Loader Styles */}
            <style jsx global>{`
            @keyframes cursorTrailFade {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        .cursor-trail {
          position: fixed;
          width: 30px;
          height: 20px;
          background: radial-gradient(circle, rgba(150, 255, 242 , 0.8) 100%, rgba(150, 255, 242 , 0) 100%);
          border-radius: 20%;
          pointer-events: none;
          animation: cursorTrailFade 1s linear forwards;
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
    z-index:0;
    pointer-events: none;
  }

  .grid-line {
    width: 100%;
    height: 100%;
    border-radius: 100%;
    border: 0.5px solid rgba(255, 120, 0 , 0.2);
    animation: gridAnimation 3s infinite alternate ease-in-out;
  }
    @keyframes gridAnimation {
    0% { transform: translateY(50px); opacity: 0.2; }
    50% { transform: translateY(10px); opacity: 1; }
    50% { transform: translateX(10px); opacity: 1; }
    100% { transform: translateX(50px); opacity: 0.2; }
  }
                .loader-ring {
                  position: absolute;
                  box-shadow: 0 0 10px #ff7700, 0 0 20px #ff7700, 0 0 40px #ff7700;
                }
                .loader-core {
                  box-shadow: 0 0 15px #ff7700, 0 0 30px #ff7700, 0 0 50px #ff7700;
                }
                  .neon-border-1 {
          border: 1px solid;
          border-image-slice: 1;
          // border-radius : 10%;
          animation: borderAnimation1 3s linear infinite;
          transition: all 1s ease;
        }
           @keyframes borderAnimation1 {
          0%, 100% {
            border-image-source: linear-gradient(45deg, #ff7700, white, #ff7700);
            box-shadow: 0 0 3px rgb(255, 120, 0 );
          }
          50% {
            border-image-source: linear-gradient(135deg, #ff7700, white, #ff7700);
            box-shadow: 0 0 10px rgb(255, 120, 0 );
          }
        }
          .neon-border-2 {
          border: 0px solid;
          border-image-slice: 1;
          // border-radius : 10%;
          animation: borderAnimation2 3s linear infinite;
          transition: all 1s ease;
        }
           @keyframes borderAnimation2 {
          0%, 100% {
            border-image-source: linear-gradient(45deg, #96fff2, white, #96fff2);
            box-shadow: 0 0 3px rgb(150, 255, 242 );
          }
          50% {
            border-image-source: linear-gradient(135deg, #96fff2, white, #96fff2);
            box-shadow: 0 0 15px rgb(150, 255, 242 );
          }
        }
           .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
          .neon-border-3 {
          border: 0px solid;
          border-image-slice: 1;
          box-shadow: 0 0 10px rgb(150, 255, 242 );
          // border-radius : 10%;
          animation: borderAnimation3 3s linear infinite;
          transition: all 1s ease;
        }
        
        .neon-border-4 {
          border: 0px solid;
          border-image-slice: 1;
          box-shadow: 0 0 10px rgb(255, 119, 0 );
          // border-radius : 10%;
          animation: borderAnimation3 3s linear infinite;
          transition: all 1s ease;
        }
          .neon-border-5 {
          border: 0px solid;
          border-image-slice: 1;
          // border-radius : 10%;
          animation: borderAnimation5 3s linear infinite;
          transition: all 1s ease;
        }
           @keyframes borderAnimation5 {
          0%, 100% {
            // border-image-source: linear-gradient(45deg, #96fff2, white, #96fff2);
            box-shadow: 0 0 3px rgb(255, 119, 0);
          }
          50% {
            // border-image-source: linear-gradient(135deg, #96fff2, white, #96fff2);
            box-shadow: 0 0 25px rgb(255, 119, 0 );
          }
        }

        @keyframes rgbGlow {
        
    0% { box-shadow: 0 0 10px #96fff2; }  /* Red */
    // 25% { box-shadow: 0 0 15px #ff7700; } /* Green */
    50% { box-shadow: 0 0 20px #ff7700; } /* Blue */
    // 75% { box-shadow: 0 0 15px #ff7700; } /* Magenta */
    100% { box-shadow: 0 0 10px #96fff2; } /* Back to Red */
  }

  .signup-login-container {
    animation: rgbGlow 3s infinite alternate ease-in-out;
  }
    .neon-border-sl {
          border: 0px solid;
          border-image-slice: 1;
          // border-radius : 10%;
          animation: borderAnimation_sl 3s linear infinite;
          transition: all 1s ease;
        }
           @keyframes borderAnimation_sl {
          0%, 100% {
            border-image-source: linear-gradient(45deg, #ff7700, white, #ff7700);
            box-shadow: 0 0 3px rgb(255, 119, 0 );
          }
          50% {
            border-image-source: linear-gradient(135deg, #96fff2, white, #96fff2);
            box-shadow: 0 0 15px rgb(255, 119, 0 );
          }
        }
          .neon-border-cross {
          border: 0px solid;
          border-image-slice: 1;
          border-radius : 50%;
          animation: borderAnimation_cross 3s linear infinite;
          transition: all 1s ease;
        }
           @keyframes borderAnimation_cross {
          0%, 100% {
            border-image-source: linear-gradient(45deg, #ff7700, white, #ff7700);
            box-shadow: 0 0 3px rgb(255, 119, 0 );
          }
          50% {
            border-image-source: linear-gradient(135deg, #96fff2, white, #96fff2);
            box-shadow: 0 0 15px rgb(255, 119, 0 );
          }
        }
          .close:hover{
            animation : closing 3s linear infinite;
          }
          @keyframes closing{
          0%{
            transform : rotateZ(0deg);
            border-image-source: linear-gradient(45deg, #ff7700, white, #ff7700);
            box-shadow: 0 0 3px rgb(255, 119, 0 );
          }
          50%{
            transform : rotateZ(180deg);
            border-image-source: linear-gradient(135deg, #96fff2, white, #96fff2);
            box-shadow: 0 0 15px rgb(255, 119, 0 );
          }
            100%{
            transform : rotateZ(360deg);
            border-image-source: linear-gradient(45deg, #ff7700, white, #ff7700);
            box-shadow: 0 0 3px rgb(255, 119, 0 );
          }
          }
              `}</style>

    <div 
    ref={containerRef}
    
    className="h-screen w-screen bg-gradient-to-r from-[#1d0d00] via-[black] to-[#1d0d00] text-white flex items-center justify-center font-['Orbitron'] overflow-hidden relative">
      {/* Futuristic Cinematic Door Opening Animation */}
      {showIntro && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center z-1 bg-transparent">
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="absolute left-0 top-0 w-full h-full bg-gradient-to-l from-[#1d0d00] via-[#161616] to-[#1d0d00] origin-bottom"
          />
          
           <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
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

      {/* Page Content - Only visible after transition */}
      {showContent && (

        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <div className="grid-overlay">
          {Array.from({ length: 200 }).map((_, i) => (
          <div key={i} className="grid-line"></div>
          ))}
        </div>
         
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
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700]  to-[#ff7700]"
            >
              {displayText}
            </motion.p>
          </div>

           {/* Go Back Button */}
           <div className="fixed top-4 right-6 flex space-x-8">
          <button 
          onClick={() => setLoginVisible(true)}
          className="px-6 py-3 bg-black/50 neon-border-1 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 text-sm uppercase tracking-wider">
            Login
          </button>
          <button 
          onClick={() => setSignupVisible(true)}
          className="px-6 py-3 bg-black/50 neon-border-1 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 text-sm uppercase tracking-wider">
            Register
          </button>
        </div>

        
        {/*Sign up Container*/}
        {signup && (
        <motion.div 
        initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
        className="signup-login-container fixed justify-center items-center top-[7%] left-[25%] w-[690px] h-[550px] flex bg-black/40 bg-opacity-10 backdrop-blur-md rounded-lg space-x-8 z-20">

        <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute top-[-4%]  text-[3vw] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] via-[silver] to-[#ff7700] mt-16"
          >
            Join the Battle. Become a Legend
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[14%] text-[1.1vw] text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
          >
            Step into the coding arena and prove your skills against the best. The war for supremacy begins NOW!
          </motion.p>

          <motion.label
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }} 
          className="absolute top-[29%] left-[13%] text-lg text-[#96fff2] mb-2">
            Email/Mobile
          </motion.label>

          <motion.input
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
            type="text"
            placeholder="Enter your email/mobile number"
            // value={email}
            // onChange={(e) => setEmail(e.target.value)}
            // onBlur={() => handleBlur("email")}
            className="absolute w-full max-w-md top-[33.5%] left-[13%] px-4 py-3 text-lg text-white bg-black border-2 border-[#96fff2] rounded-lg outline-none focus:ring-2 focus:ring-[#96fff2] cyan-300 focus:border-[#96fff2] placeholder-gray-400 transition-all  focus:shadow-[0_0_20px_rgba(0,255,255,1)]"
          />
          

          <motion.label
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }} 
          className="absolute top-[44%] left-[13%] text-lg text-[#96fff2] mb-2">
            Create Password
          </motion.label>
          <motion.input
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
            type="text"
            placeholder="Create your password"
            className="absolute w-full max-w-md top-[48.5%] left-[13%] px-4 py-3 text-lg text-white bg-black border-2 border-[#96fff2] rounded-lg outline-none focus:ring-2 focus:ring-[#96fff2] cyan-300 focus:border-[#96fff2] placeholder-gray-400 transition-all  focus:shadow-[0_0_20px_rgba(0,255,255,1)]"
          />

          <motion.label
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }} 
          className="absolute top-[59%] left-[13%] text-lg text-[#96fff2] mb-2">
            Confirm Password
          </motion.label>
          <motion.input
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
            type="text"
            placeholder="Confirm password"
            className="absolute w-full max-w-md top-[63.5%] left-[13%] px-4 py-3 text-lg text-white bg-black border-2 border-[#96fff2] rounded-lg outline-none focus:ring-2 focus:ring-[#96fff2] focus:border-[#96fff2] placeholder-gray-400 transition-all  focus:shadow-[0_0_20px_rgba(0,255,255,1)]"
          />

          <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute px-8 py-4 top-[79%] left-[22.5%] bg-black/50 text-[#ff7700] neon-border-sl rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 text-lg uppercase tracking-wider">
            Enter the Battlefield
          </motion.button>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            onClick={() => {
              setLoginVisible(true);
              setSignupVisible(false);
            }}
            className="absolute top-[89%] left-[21%] text-[1.4vw] text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#ff7700] mt-4"
          >
            already a member of this battlefield ? <a href="#" className="text-[#96fff2] relative before:absolute before:inset-0 before:blur-md before:content-['Login'] before:text-[#96fff2] before:opacity-100 text-[1.6vw] ml-2"> Login</a>
          </motion.p>

          <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          onClick={() => setSignupVisible(false)}
          className="absolute close px-3 py-2 top-1 right-1  bg-black/50 text-[#ff7700] neon-border-cross rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 text-xl uppercase tracking-wider">
          ⛌
          </motion.button>
        </motion.div>
          )}
        
          {/* <div className="fixed top-160 left-190 flex space-x-8">
          <button className="px-8 py-4 bg-transparent neon-border-2 transition-all duration-200 cursor-pointer hover:scale-105 text-sm uppercase tracking-wider">
            Join The Battle
          </button>
        </div> */}
          
          {/*Log In Container*/}
        {login && (
        <motion.div 
        initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
        className="signup-login-container fixed justify-center items-center top-[7%] left-[25%] w-[690px] h-[550px] flex bg-black/40 bg-opacity-10 backdrop-blur-md rounded-lg space-x-8 z-20">

        <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute top-[-4%]  text-[2.5vw] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] via-[silver] to-[#ff7700] mt-16"
          >
            Every Seconds Count. Every Battle Matters.
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[11%] text-[1.3vw] text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
          >
            Step back into the Coding arena and continue your journey to top
          </motion.p>

          <motion.label
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }} 
          className="absolute top-[33%] left-[13%] text-lg text-[#96fff2] mb-2">
            Email/Mobile
          </motion.label>

          <motion.input
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
            type="text"
            placeholder="Enter your email/mobile number"
            className="absolute w-full max-w-md top-[37.5%] left-[13%] px-4 py-3 text-lg text-white bg-black border-2 border-[#96fff2] rounded-lg outline-none focus:ring-2 focus:ring-[#96fff2] focus:border-[#96fff2] placeholder-gray-400 transition-all  focus:shadow-[0_0_20px_rgba(0,255,255,1)]"
          />

          <motion.label
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }} 
          className="absolute top-[51%] left-[13%] text-lg text-[#96fff2] mb-2">
             Password
          </motion.label>
          <motion.input
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
            type="text"
            placeholder="Enter your password"
            className="absolute w-full max-w-md top-[55.5%] left-[13%] px-4 py-3 text-lg text-white bg-black border-2 border-[#96fff2] rounded-lg outline-none focus:ring-2 focus:ring-[#96fff2] cyan-300 focus:border-[#96fff2] placeholder-gray-400 transition-all  focus:shadow-[0_0_20px_rgba(0,255,255,1)]"
          />

          <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute px-8 py-4 top-[73%] left-[22.5%] bg-black/50 text-[#ff7700] neon-border-sl rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 text-lg uppercase tracking-wider">
            Enter the Battlefield
          </motion.button>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            onClick={() => {
              setSignupVisible(true);
              setLoginVisible(false);
              }}
            className="absolute top-[86%] left-[20.5%] text-[1.4vw] text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#ff7700] mt-4"
          >
            haven't you joined the battlefield ? <a href="#" className="text-[#96fff2] relative before:absolute before:inset-0 before:blur-md before:content-['Login'] before:text-[#96fff2] before:opacity-100 text-[1.6vw] ml-2"> Sign Up</a>
          </motion.p>

          <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          onClick={() => setLoginVisible(false)}
          className="absolute close px-3 py-2 top-1 right-1  bg-black/50 text-[#ff7700] neon-border-cross rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 text-xl uppercase tracking-wider">
          ⛌
          </motion.button>
        </motion.div>
          )}

          {/* Subtitle-1*/}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute top-[23%] left-[1%] text-[4vw] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] via-[silver] to-[#96fff2] mt-16"
          >
            Welcome to the Ultimate Coding Battlefield
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[39%] left-[4%] text-[1.8vw] text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
          >
            In this arena, logic is your weapon, speed is your armor, and only the strongest coders survive.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[48%] left-[4%] text-[1.8vw] text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#ff7700] mt-4"
          >
            Enter the warzone where coding meets competition. Solve mind-bending challenges, <br></br>eliminate rivals, and conquer the leaderboard. The battle begins NOW!
          </motion.p>

        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[59%] left-[4%] text-[1.8vw] h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#ff7700] mt-4"
        >
            1. Challenge the best.<br></br>
            2. Outcode. Outlast. Outplay.<br></br>
            3. Become the coding champion.<br></br>
        </motion.p>

        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[80%] left-[7%] text-[1.8vw] h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
        >
            Are you ready to prove your skills and claim your place among the coding elite?
        </motion.p>

        <div className="absolute top-[25%] left-[65%] w-full">
            <img
              src="/logo2.png"
              alt="Coding Battle Royale Logo"
              className="w-[32%] h-[32%] object-contain animate-pulse"
            />
          </div>

          <div className="absolute top-[45%] left-[96%] flex space-x-12">
          <button
          onClick={() => setLoginVisible(true)}
          className="w-32 h-32 bg-black/50 neon-border-2 text-white text-lg font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer rounded-full flex items-center justify-center hover:scale-105">
            Join The Battle
          </button>
        </div>

        <div className="absolute top-[25%] left-[105%] w-full">
            <img
              src="/logo2.png"
              alt="Coding Battle Royale Logo"
              className="w-[32%] h-[32%] object-contain animate-pulse"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          {/* Subtitle-2*/}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute top-[23%] left-[130%] text-[4vw] h-screen w-screen flex font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] via-[silver] to-[#96fff2] mt-16"
          >
            Where Coders Become Warriors
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[39%] left-[135%] text-[1.8vw]  h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
          >
            Not just another coding contest — this is survival of the smartest
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[45%] left-[135%] text-[1.8vw] h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#ff7700] mt-4"
          >
            Welcome to a futuristic, high-stakes coding warzone, where your <br></br> algorithms decide your fate. Face off in live battles, solve <br></br> AI-generated coding challenges, and eliminate the weakest link in <br></br> every round.
          </motion.p>

        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[67%] left-[135%] text-[1.8vw] h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#ff7700] mt-4"
        >
            1. Think Fast. Code Faster.<br></br>
            2. Only the last coder standing will claim victory.<br></br>
            3. Will it be you?<br></br>
        </motion.p>

        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[84%] left-[137%] text-[1.8vw] h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
        >
            Step in, gear up, and let your code be the last one standing.
        </motion.p>

          <div className="absolute top-[25%] left-[180%] w-full">
            <img
              src="/logo2.png"
              alt="Coding Battle Royale Logo"
              className="w-[32%] h-[32%] object-contain animate-pulse"
            />
          </div>
        
          <div className="absolute top-[45%] left-[211%] flex space-x-12">
          <button
          onClick={() => setLoginVisible(true)}
          className="w-32 h-32 bg-black/50 neon-border-2 text-white text-lg font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer rounded-full flex items-center justify-center hover:scale-105">
            Join The Battle
          </button>
        </div>

        <div className="absolute top-[25%] left-[220%] w-full">
            <img
              src="/logo2.png"
              alt="Coding Battle Royale Logo"
              className="w-[32%] h-[32%] object-contain animate-pulse"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          {/* Subtitle-3*/}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute top-[23%] left-[248.5%] text-[4vw] h-screen w-screen flex font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] via-[silver] to-[#96fff2] mt-16"
          >
            Power Up Your Coding Skills
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[41%] left-[251.5%] text-[1.8vw]  h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
          >
            This isn't just a game; it's a revolution in competitive coding
          </motion.p>

          {/* <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[59%] left-[274%] text-[1.8vw] h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#ff7700] mt-4"
          >
            Welcome to a futuristic, high-stakes coding warzone, where your algorithms decide your fate.<br></br> Face off in live battles, solve AI-generated coding challenges, and eliminate the weakest link in every round.
          </motion.p> */}

        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[50%] left-[251.5%] text-[1.8vw] h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#ff7700] mt-4"
        >
            1. Live Multiplayer Battles<br></br>
            2. AI-Powered Challenges.<br></br>
            3. Multi-Language Support<br></br>
            4. Live Leaderboard & Ranking
        </motion.p>

        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[78%] left-[246%] text-[1.8vw] h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
        >
            Join the evolution—where every keystroke brings you closer to coding glory.
        </motion.p>

        <div className="absolute top-[25%] left-[295%] w-full">
            <img
              src="/logo2.png"
              alt="Coding Battle Royale Logo"
              className="w-[32%] h-[32%] object-contain animate-pulse"
              // style={{ transform: "scaleX(-1)" }}
            />
          </div>
        
          <div className="absolute top-[45%] left-[326%] flex space-x-12">
          <button
          onClick={() => setLoginVisible(true)}
          className="w-32 h-32 bg-black/50 neon-border-2 text-white text-lg font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer rounded-full flex items-center justify-center hover:scale-105">
            Join The Battle
          </button>
        </div>

        <div className="absolute top-[25%] left-[335%] w-full">
            <img
              src="/logo2.png"
              alt="Coding Battle Royale Logo"
              className="w-[32%] h-[32%] object-contain animate-pulse"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

            {/* Subtitle-4*/}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute top-[23%] left-[365%] text-[4vw] h-screen w-screen flex font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] via-[silver] to-[#96fff2] mt-16"
          >
            Decode. Dominate. Destroy.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[39%] left-[375%] text-[1.8vw]  h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
          >
            Your path to coding glory starts here!
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[45%] left-[363.5%] text-[1.8vw] h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#ff7700] mt-4"
          >
            1. Enter the Lobby – Minimum 4, maximum 8 players per match.<br></br>
            2. Countdown Begins – You have limited time to solve each challenge.<br></br>
            3. Submit Fast, Score Higher – Speed & accuracy determine your fate.<br></br>
            4. Eliminate Weakest Link – Lowest scorer is knocked out each round.<br></br>
            5. Win the Battle, Rule the Leaderboard – Be the last coder standing and <br></br> claim ultimate victory!
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[80%] left-[366%] text-[1.8vw] h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
          >
            You only get ONE chance per round. Think wisely, type faster
          </motion.p>

           <div className="absolute top-[25%] left-[410%] w-full">
            <img
              src="/logo2.png"
              alt="Coding Battle Royale Logo"
              className="w-[32%] h-[32%] object-contain animate-pulse"
              
            />
          </div>

          <div className="absolute top-[45%] left-[441%] flex space-x-12">
          <button
          onClick={() => setLoginVisible(true)}
          className="w-32 h-32 bg-black/50 neon-border-2 text-white text-lg font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer rounded-full flex items-center justify-center hover:scale-105">
            Join The Battle
          </button>
        </div>

        <div className="absolute top-[25%] left-[450%] w-full">
            <img
              src="/logo2.png"
              alt="Coding Battle Royale Logo"
              className="w-[32%] h-[32%] object-contain animate-pulse"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

           {/* Subtitle-5*/}
           <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute top-[23%] left-[471%] text-[3.9vw] h-screen w-screen flex font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] via-[silver] to-[#96fff2] mt-16"
          >
            Not Just a Game. A War of Intelligence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[39%] left-[478.5%] text-[1.8vw]  h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
          >
            This is not just about coding—it’s about strategy, speed, and survival
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[45%] left-[478.5%] text-[1.8vw] h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#ff7700] mt-4"
          >
            The First-Ever Sci-Fi Themed Competitive Coding Game<br></br>
            No Boring Challenges – Every Match is Unique<br></br>
            Ranked Battles, Leaderboards & Tournaments<br></br>
            A Battle-Royale Format for Coders – Outlast, Outthink, Outcode<br></br>
            An Unparalleled, Futuristic Gaming Experience
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[80%] left-[475%] text-[1.8vw] h-screen w-screen flex text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
          >
            It’s not just about knowing the answer, it’s about being the fastest to get there
          </motion.p>

           <div className="absolute top-[25%] left-[525%] w-full">
            <img
              src="/logo2.png"
              alt="Coding Battle Royale Logo"
              className="w-[32%] h-[32%] object-contain animate-pulse"
              
            />
          </div>

          <div className="absolute top-[45%] left-[556%] flex space-x-12">
          <button
          onClick={() => setLoginVisible(true)}
          className="w-32 h-32 bg-black/50 neon-border-2 text-white text-lg font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer rounded-full flex items-center justify-center hover:scale-105">
            Join The Battle
          </button>
        </div>

        <div className="absolute top-[25%] left-[565%] w-full">
            <img
              src="/logo1.png"
              alt="Coding Battle Royale Logo"
              className="w-[32%] h-[32%] object-contain animate-pulse"
              // style={{ transform: "scaleX(-1)" }}
            />
          </div>

           {/* Subtitle-6*/}
           <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute top-[23%] left-[598%] text-[4vw] h-screen w-1/2 flex font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] via-[silver] to-[#96fff2] mt-16"
          >
            Code. Compete. Conquer.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[41%] left-[603%] text-[1.8vw]  h-screen w-1/2 flex text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
          >
            Millions of coders. One champion. Will it be you?<br></br>------------------------------------------------------------
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[55%] left-[603%] text-[1.8vw] h-screen w-1/2 flex text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] to-[#ff7700] mt-4"
          >
            Sign up today and dive into the most thrilling,<br></br> high-intensity coding showdown ever created
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-[71%] left-[596%] text-[1.8vw] h-screen w-1/2 flex text-transparent bg-clip-text bg-gradient-to-r from-[#96fff2] to-[#96fff2] mt-4"
          >
             THE BATTLE STARTS NOW. DO YOU HAVE WHAT IT TAKES?
          </motion.p>

          <div className="absolute top-[44%] left-[645%] flex space-x-12">
          <button
          onClick={() => setLoginVisible(true)}
          className="w-40 h-40 bg-black/50 neon-border-5 text-[#ff7700] text-xl font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer rounded-full flex items-center justify-center hover:scale-105">
            Join The Battle
          </button>
        </div>

        </motion.div>
      )}
    </div>
    
    </>
    
  );
  
}
