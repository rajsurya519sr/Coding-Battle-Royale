import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import socket from "../lib/socket";  // Import the shared socket instance

// Helper function to parse question markdown
const parseQuestionMarkdown = (markdown, language) => {
  const structuredQuestion = {
    title: '',
    description: '',
    functionDesc: '',
    constraints: [],
    inputFormat: '',
    outputFormat: '',
    sampleInput: '',
    sampleOutput: '',
    explanation: '',
    hints: [],
    edgeCases: '',
    summary: '',
  };

  // Remove leading '---' if present
  if (markdown.startsWith('---\n\n')) {
    markdown = markdown.substring(5); // Corrected: '---' (3) + '\n' (1) + '\n' (1) = 5 characters
  }

  // Helper to extract content by keywords
  const extractContent = (text, keyword) => {
    // Updated regex: Allow for optional colon after keyword,
    // allow for any whitespace (including newlines) after keyword and before content,
    // and be more flexible with termination (one or more newlines before next section header or --- or end of string).
    const regex = new RegExp(`\\*\\*${keyword}:?\\*\\*\\s*([\\s\\S]*?)(?=\\n+\\*\\*|\\n+---|$)`, 'i');
    const result = text.match(regex);
    return result ? result[1].trim() : '';
  };

  structuredQuestion.title = extractContent(markdown, 'Title');
  structuredQuestion.description = extractContent(markdown, 'Description');
  structuredQuestion.inputFormat = extractContent(markdown, 'Input Format');
  structuredQuestion.outputFormat = extractContent(markdown, 'Output Format');
  structuredQuestion.sampleInput = extractContent(markdown, 'Sample Input 1');
  structuredQuestion.sampleOutput = extractContent(markdown, 'Sample Output 1');
  structuredQuestion.explanation = extractContent(markdown, 'Explanation 1');
  structuredQuestion.edgeCases = extractContent(markdown, 'Edge Cases');
  structuredQuestion.summary = extractContent(markdown, 'Summary');

  // Special handling for Function Signature to remove code block markers
  const funcSigMatch = markdown.match(/\*\*Function Signature:\*\*([\s\S]*?)(?=\n+\*\*Edge Cases:\*\*|\n+\*\*Summary:\*\*|\n+---|$)/i);
  if (funcSigMatch) {
    let rawFuncSig = funcSigMatch[1].trim();
    // Remove code block backticks and language name
    rawFuncSig = rawFuncSig.replace(/```[a-zA-Z]*\n/g, '').replace(/```/g, '').trim();
    structuredQuestion.functionDesc = rawFuncSig;
  } else {
    structuredQuestion.functionDesc = '';
  }

  // Special handling for Constraints (list format)
  const constraintsMatch = markdown.match(/\*\*Constraints:\*\*([\s\S]*?)(?=\n+\*\*Sample Input 1:\*\*|\n+\*\*Function Signature:\*\*|\n+---|$)/i);
  if (constraintsMatch) {
    structuredQuestion.constraints = constraintsMatch[1]
      .split('\n')
      .map(item => item.replace(/^-+\s*/, '').trim()) // Handles '-' or '---' at start of list item
      .filter(item => item);
  } else {
    structuredQuestion.constraints = [];
  }

  // Special handling for Hints (can be nested or standalone)
  const hintsRegex = /\*\*Hints?:\*\*([\s\S]*?)(?=\n+\*\*|\n+---|$)/i;
  const hintsSectionMatch = markdown.match(hintsRegex);
  
  if (hintsSectionMatch) {
    structuredQuestion.hints = hintsSectionMatch[1]
      .split('\n')
      .map(item => item.replace(/^-+\s*/, '').trim())
      .filter(item => item);
  } else {
    // Fallback: Try to find hints within the explanation if not a direct section
    const explanationHintsMatch = structuredQuestion.explanation.match(/Hints?:([\s\S]*)/i);
    if (explanationHintsMatch) {
      structuredQuestion.hints = explanationHintsMatch[1]
        .split('\n')
        .map(item => item.replace(/^-+\s*/, '').trim())
        .filter(item => item);
    } else {
      structuredQuestion.hints = [];
    }
  }

  return structuredQuestion;
};

export default function Game() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [question, setQuestion] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [countdown, setCountdown] = useState(null);
  const [cursorTrail, setCursorTrail] = useState([]);
  const [showTransition, setShowTransition] = useState(false);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [showSubmissionResult, setShowSubmissionResult] = useState(false);
  const [lobbyCode, setLobbyCode] = useState(null);
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
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hiddenTests, setHiddenTests] = useState("");
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true); // Add this state
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);   // Add this state
  const [showEvaluationResultComponent, setShowEvaluationResultComponent] = useState(false); // Add this line
  
  useEffect(() => {
    // On component mount, check if we have player data
    const storedName = localStorage.getItem('playerName');
    console.log("Initial player name from storage:", storedName);
    
    if (storedName) {
      setPlayerName(storedName);
      // Re-join the battle with stored name
      socket.emit('join_battle', { name: storedName, joinExisting: true });
    }

    // Request initial player data
    socket.emit('get_players');

    socket.on("connect", () => {
      console.log("Socket connected in Game, ID:", socket.id);
      if (storedName) {
        console.log("Rejoining with stored name:", storedName);
        socket.emit('join_battle', { name: storedName, joinExisting: true });
      }
    });

    socket.on("players", (data) => {
      console.log("Received players update in Game:", data);
      if (Array.isArray(data)) {
        const updatedPlayers = data.map(player => ({
          ...player,
          name: player.name || 'Unknown Player'
        }));
        console.log("Setting players with data:", updatedPlayers);
        setPlayers(updatedPlayers);
      } else {
        console.error("Received invalid players data:", data);
      }
    });
    
    socket.on("lobby_info", ({ lobbyCode, players }) => {
      console.log("Game received lobby info:", { lobbyCode, players });
      setLobbyCode(lobbyCode);
      console.log("Lobby code set:", lobbyCode);
      if (Array.isArray(players)) {
        // Ensure each player has a unique name
        const updatedPlayers = players.map(player => ({
          ...player,
          name: player.name || 'Unknown Player'
        }));
        console.log("Setting players from lobby info:", updatedPlayers);
        setPlayers(updatedPlayers);
      } else {
        console.error("Received invalid lobby players data:", players);
      }
    });

    socket.on("leaderboard_update", ({ players, submission }) => {
      console.log("Received leaderboard update:", { players, submission });
      if (Array.isArray(players)) {
        // Ensure each player has a unique name
        const updatedPlayers = players.map(player => ({
          ...player,
          name: player.name || 'Unknown Player'
        }));
        console.log("Setting players from leaderboard update:", updatedPlayers);
        setPlayers(updatedPlayers);
        if (submission) {
          setLastSubmission(submission);
          setShowSubmissionResult(true);
          setTimeout(() => setShowSubmissionResult(false), 3000);
        }
      } else {
        console.error("Received invalid leaderboard players data:", data);
      }
    });

    socket.on("question", (data) => {
      setQuestion(data);
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

    socket.on("player_eliminated", ({ playerId, playerName, leaderboard }) => {
      console.log("Player eliminated:", { playerId, playerName, leaderboard });
      setErrorMessage(`${playerName} has been eliminated!`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      
      // Update players with the new leaderboard data
      if (Array.isArray(leaderboard)) {
        setPlayers(leaderboard);
      }
    });

    // Cleanup function
    return () => {
      // Clear questions for this lobby when component unmounts
      if (lobbyCode) {
        fetch('http://localhost:3001/clear-lobby-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lobbyCode }),
        }).catch(error => {
          console.error('Error clearing lobby questions:', error);
        });
      }

      socket.off("connect");
      socket.off("players");
      socket.off("lobby_info");
      socket.off("countdown");
      socket.off("next_slide");
      socket.off("redirect");
      socket.off("leaderboard_update");
      socket.off("player_eliminated");
    };
  }, [navigate, lobbyCode]);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setIsLoadingQuestion(true); // Start loading
        if (!lobbyCode) {
          console.log("Waiting for lobby code...");
          return;
        }
        console.log(`Attempting to load question for level ${currentLevel} and lobby ${lobbyCode}`);
        const response = await fetch(`http://localhost:3001/generate-question?level=${currentLevel}&lobbyCode=${lobbyCode}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const rawResponseText = await response.text();
        console.log("Raw Response Text:", rawResponseText);

        let data;
        try {
          data = JSON.parse(rawResponseText);
        } catch (jsonParseError) {
          console.error("JSON Parse Error:", jsonParseError);
          console.error("Problematic text:", rawResponseText);
          throw new Error(`Failed to parse JSON response: ${jsonParseError.message}`);
        }
        
        const structuredQuestion = parseQuestionMarkdown(data.question, language);

        console.log("Parsed Question:", structuredQuestion);
        
        setQuestion(structuredQuestion);
        setHiddenTests(data.hidden_tests);
      } catch (error) {
        console.error("Error loading question:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        setErrorMessage("Failed to load question. Please try again.");
        setShowError(true);
      } finally {
        setIsLoadingQuestion(false); // End loading on success or failure
      }
    };

    loadQuestion();
  }, [currentLevel, language, lobbyCode]);

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
  }, [index, isDeleting, fullText]);

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
      setHintIndex((prev) => (prev + 1) % question?.hints.length);
    }
  };

  const handleSubmit = async () => {
    const code = editorRef.current.getValue().trim();
    
    if (!code) {
      setErrorMessage("Please write some code before submitting!");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsSubmittingCode(true); // Start submitting

    // Clear any previous error messages before a new submission attempt
    setShowError(false);
    setErrorMessage("");

    try {
      const response = await fetch('http://localhost:3001/evaluate-code', {
        method: 'POST',
        mode: 'cors', // Explicitly set CORS mode
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          code,
          question: question.description,
          language,
          hidden_tests: hiddenTests
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      const result = data.result;

      // Parse the evaluation result
      const summaryMatch = result.match(/Test Cases Passed: (\d+)\/(\d+)/);
      if (summaryMatch) {
        const passed = parseInt(summaryMatch[1]);
        const total = 4; // Fixed total of 4 test cases
        const percentage = Math.round((passed / total) * 100);

        setEvaluationResult({
          passed,
          total,
          percentage,
          details: result
        });
        setShowEvaluationResultComponent(true); // Show the component on success

        // Automatically hide the evaluation result after 3 seconds
        setTimeout(() => {
          setShowEvaluationResultComponent(false);
        }, 3000);

        // Emit the submission result to the server
        socket.emit('submit_code', {
          code,
          language,
          level: currentLevel,
          passed,
          total,
          percentage
        });

        if (currentLevel === 3) {
          setShowTransition(true);
          setTimeout(() => {
            setShowTransition(false);
            socket.emit('game_complete');
            navigate('/completion');
          }, 2000);
        } else {
          setShowTransition(true);
          setTimeout(() => {
            setShowTransition(false);
            setSlideIndex(0);
            setCurrentLevel(prev => prev + 1);
            if (editorRef.current) {
              editorRef.current.setValue('');
            }
            socket.emit('level_change', { level: currentLevel + 1 });
          }, 2000);
        }
      } else {
        // Handle case where summaryMatch is null (e.g., if AI response format changes)
        setErrorMessage("Failed to parse evaluation result. Please try again.");
        setShowError(true);
      }
    } catch (error) {
      console.error("Evaluation error:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      setErrorMessage("Error evaluating your solution. Please try again.");
      setShowError(true);
    } finally {
      setIsSubmittingCode(false); // End submitting on success or failure
    }
  };

  // Add hover sound effect to buttons
  const handleButtonHover = () => {
  };

  // Add click sound effect to buttons
  const handleButtonClick = () => {
  };

  const transitionOverlay = showTransition && (
    <div className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center">
      <div className="text-center">
        {currentLevel === 3 ? (
          <>
            <div className="text-4xl text-[#ff7700] font-bold mb-4">Congratulations!</div>
            <div className="text-xl text-[#96fff2]">You've Completed All Levels!</div>
            <div className="mt-6 text-lg text-[#96fff2]/80">Redirecting to completion page...</div>
          </>
        ) : (
          <>
            <div className="text-4xl text-[#ff7700] font-bold mb-4">Level {currentLevel} Complete!</div>
            <div className="text-xl text-[#96fff2]">Advancing to Level {currentLevel + 1}...</div>
          </>
        )}
        <div className="mt-4">
          <div className="w-48 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-[#ff7700] animate-[loading_2s_ease-in-out]"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Update the error message component with cyberpunk theme
  const errorMessageComponent = showError && (
    <div className="fixed top-5 right-5 z-[1000] animate-fade-in">
      <div className="cyber-border bg-black/80 backdrop-blur-sm px-6 py-4 rounded-md shadow-[0_0_15px_rgba(255,119,0,0.5)] flex items-center space-x-3">
        <div className="text-[#ff7700] animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <div className="font-mono text-[#96fff2] font-semibold tracking-wider">ERROR_DETECTED</div>
          <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
        </div>
      </div>
    </div>
  );

  // Add submission result component
  const submissionResultComponent = showSubmissionResult && lastSubmission && (
    <div className="fixed top-20 right-5 z-[1000] animate-fade-in">
      <div className="cyber-border bg-black/80 backdrop-blur-sm px-6 py-4 rounded-md shadow-[0_0_15px_rgba(255,119,0,0.5)]">
        <div className="text-[#ff7700] font-semibold mb-2">Submission Result</div>
        <div className="text-[#96fff2] text-sm">
          <div>Base Points: {lastSubmission.basePoints}</div>
          <div>Time Bonus: {lastSubmission.timeBonus}</div>
          <div className="text-lg font-bold mt-1">
            Total: {lastSubmission.points} points
          </div>
        </div>
      </div>
    </div>
  );

  // Update the evaluation result display in the UI
  const evaluationResultComponent = showEvaluationResultComponent && evaluationResult && (
    <div className="fixed top-20 right-5 z-[1000] animate-fade-in">
      <div className="cyber-border bg-black/80 backdrop-blur-sm px-6 py-4 rounded-md shadow-[0_0_15px_rgba(255,119,0,0.5)]">
        <div className="flex justify-between items-center mb-2">
          <div className="text-[#ff7700] font-semibold">Evaluation Result</div>
          <button 
            onClick={() => setShowEvaluationResultComponent(false)}
            onMouseEnter={handleButtonHover}
            className="text-[#96fff2] hover:text-[#ff7700] transition-colors p-2 hover:bg-[#96fff2]/10 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-[#96fff2] text-sm">
          <div>Test Cases Passed: {evaluationResult.passed}/{evaluationResult.total}</div>
          <div>Success Rate: {evaluationResult.percentage}%</div>
          {evaluationResult.percentage === 100 && (
            <div className="text-lg font-bold mt-1 text-[#ff7700]">
              🎉 All tests passed!
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Update the leaderboard rendering
  const renderLeaderboard = () => (
    showLeaderboard && (
      <div className="w-[30%] h-[78vh] cyber-border bg-black/40 p-6 rounded-lg backdrop-blur-sm">
        <div className="text-[1.5vw] font-bold text-[#ff7700] mb-4 flex items-center justify-between">
          <span>Leaderboard</span>
          <span className="text-[1vw] text-[#96fff2]">Points</span>
          <button 
            onClick={() => setShowLeaderboard(false)}
            onMouseEnter={handleButtonHover}
            className="text-[#96fff2] hover:text-[#ff7700] transition-colors p-2 hover:bg-[#96fff2]/10 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="space-y-4 max-h-[calc(78vh-4rem)] overflow-y-auto custom-scrollbar pr-2">
          {players && players.length > 0 ? (
            [...players]
              .sort((a, b) => (b.points || 0) - (a.points || 0))
              .map((player, idx) => (
                <li 
                  key={player.id}
                  className={`bg-black/60 p-4 rounded-md border-2 flex items-center
                    ${idx === 0 ? 'border-[#ff7700] shadow-[0_0_15px_rgba(255,119,0,0.3)]' : 'border-[#96fff2]'}
                    ${player.id === socket.id ? 'bg-[#ff7700]/10' : ''}
                    ${player.eliminated ? 'opacity-50' : ''}`}
                >
                  <div className="flex-1 flex items-center space-x-4">
                    <span className={`text-2xl font-bold ${idx === 0 ? 'text-[#ff7700]' : 'text-[#96fff2]/50'}`}>
                      #{idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg ${player.id === socket.id ? 'text-[#ff7700]' : 'text-[#96fff2]'}`}>
                          {player.name || 'Unknown Player'}
                        </span>
                        {player.eliminated && (
                          <span className="text-xs text-red-500 px-2 py-1 rounded-full border border-red-500">
                            Eliminated
                          </span>
                        )}
                      </div>
                      {player.id === socket.id && (
                        <span className="text-xs text-[#96fff2]/50">You</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-mono text-xl ${idx === 0 ? 'text-[#ff7700]' : 'text-[#96fff2]'}`}>
                      {player.points || 0}
                    </span>
                    <span className={`text-sm ${idx === 0 ? 'text-[#ff7700]/70' : 'text-[#96fff2]/70'}`}>pts</span>
                  </div>
                </li>
              ))
          ) : (
            <li className="text-center text-[#96fff2] py-4">No players yet</li>
          )}
        </ul>
      </div>
    )
  );

  return (
    <>
      <style jsx="true" global="true">{`
        @keyframes matrixRain {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(100vh); opacity: 1; }
        }

        .cyber-border {
          position: relative;
          border: 2px solid transparent;
          background: linear-gradient(#000, #000) padding-box,
                    linear-gradient(135deg, #ff7700, #96fff2) border-box;
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

        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        select option {
          padding: 10px;
          background: black !important;
          color: #ff7700 !important;
        }
        
        select option:hover {
          background: black !important;
          color: #ff7700 !important;
          text-shadow: 0 0 8px rgba(255, 119, 0, 0.8);
          box-shadow: 0 0 20px rgba(255, 119, 0, 0.5);
        }
        
        select option:checked {
          background: black !important;
          color: #ff7700 !important;
          text-shadow: 0 0 8px rgba(255, 119, 0, 0.8);
        }

        select:focus option:checked {
          background: black !important;
          color: #ff7700 !important;
          text-shadow: 0 0 8px rgba(255, 119, 0, 0.8);
        }

        @-moz-document url-prefix() {
          select option:hover {
            background-color: black !important;
            box-shadow: 0 0 20px rgba(255, 119, 0, 0.5);
            text-shadow: 0 0 8px rgba(255, 119, 0, 0.8);
          }
        }

        @keyframes spin { /* Add spin animation for loaders */
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loader-spinner {
          border: 4px solid rgba(255, 119, 0, 0.2); /* Light orange */
          border-top: 4px solid #ff7700; /* Darker orange */
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Loader for initial question loading */} 
      {isLoadingQuestion && (
        <div className="fixed inset-0 bg-black/90 z-[1100] flex items-center justify-center flex-col space-y-4">
          <div className="loader-spinner"></div>
          <div className="text-[#ff7700] text-xl font-mono">Loading Problem Statement...</div>
        </div>
      )}

      {/* Loader for code submission */} 
      {isSubmittingCode && (
        <div className="fixed inset-0 bg-black/90 z-[1100] flex items-center justify-center flex-col space-y-4">
          <div className="loader-spinner"></div>
          <div className="text-[#ff7700] text-xl font-mono">Evaluating Submission...</div>
        </div>
      )}

      <div ref={containerRef} 
        className="h-screen w-screen bg-gradient-to-r from-[#1d0d00] via-black to-[#1d0d00] text-white font-['Orbitron'] overflow-hidden relative">
        
        {/* Title */}
        <div className="fixed top-[1%] left-[0.3%] text-[1.5vw] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff7700] via-[silver] to-[#ff7700]">
          Coding Battle Royale
        </div>

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

        {/* Only show level indicator if level is 3 or less */}
        {currentLevel <= 3 && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 text-[2vw] font-bold text-[#ff7700]">
            Level {currentLevel}
          </div>
        )}

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
                <div className="text-[1.8vw] font-bold text-[#96fff2]">{question?.title || 'Loading...'}</div>
              </div>
              
              {/* Scrollable Content */}
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="space-y-6 pr-2">
                  {/* Problem Description */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Problem</h3>
                    <p className="text-gray-200 whitespace-pre-line">{question?.description}</p>
                  </div>

                  {/* Function Description */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Function Description</h3>
                    <p className="text-gray-200 whitespace-pre-line">{question?.functionDesc}</p>
                  </div>

                  {/* Constraints */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Constraints</h3>
                    <ul className="list-disc list-inside text-gray-200">
                      {question?.constraints?.map((constraint, index) => (
                        <li key={index}>{constraint}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Input Format */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Input Format</h3>
                    <p className="text-gray-200 whitespace-pre-line">{question?.inputFormat}</p>
                  </div>

                  {/* Output Format */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Output Format</h3>
                    <p className="text-gray-200 whitespace-pre-line">{question?.outputFormat}</p>
                  </div>

                  {/* Sample Input */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Sample Input</h3>
                    <pre className="bg-black/60 p-4 rounded-md text-gray-200 font-mono whitespace-pre-wrap">
                      {question?.sampleInput}
                    </pre>
                  </div>

                  {/* Sample Output */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Sample Output</h3>
                    <pre className="bg-black/60 p-4 rounded-md text-gray-200 font-mono whitespace-pre-wrap">
                      {question?.sampleOutput}
                    </pre>
                  </div>

                  {/* Explanation */}
                  <div>
                    <h3 className="text-[#ff7700] text-xl font-semibold mb-2">Explanation</h3>
                    <p className="text-gray-200 whitespace-pre-wrap">
                      {question?.explanation}
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
                <h3 className="text-[2.5vw] font-bold text-[#96fff2] mb-3 font-mono">Choose Your Weapon</h3>
                <div className="relative w-[20%]">
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full cyber-border bg-black p-3 rounded-md text-[#ff7700] cursor-pointer
                    border-2 border-[#ff7700] font-mono tracking-wider flex justify-between items-center
                    hover:bg-[#ff7700]/10 transition-all duration-300"
                  >
                    <span>{language.toUpperCase()}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 transition-transform duration-300 ${isDropdownOpen ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute w-full mt-2 bg-black border-2 border-[#ff7700] rounded-md overflow-hidden z-50">
                      {['JAVA', 'PYTHON', 'C'].map((lang) => (
                        <div
                          key={lang}
                          onClick={() => {
                            handleLanguageChange({ target: { value: lang.toLowerCase() } });
                            setIsDropdownOpen(false);
                          }}
                          className="p-3 text-[#ff7700] cursor-pointer font-mono tracking-wider
                          hover:bg-[#ff7700]/10 hover:shadow-[0_0_15px_rgba(255,119,0,0.5)] 
                          transition-all duration-300 hover:text-[#ff7700]
                          relative group"
                        >
                          {lang}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                            transition-opacity duration-300 pointer-events-none
                            shadow-[0_0_20px_rgba(255,119,0,0.5)]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                  className="px-6 py-3 bg-black/40 text-[#ff7700] border-2 border-[#ff7700] rounded-md hover:bg-[#ff7700]/10 transition-all duration-300 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Submit</span>
                </button>

                {!showLeaderboard && slideIndex === 1 && (
                  <button 
                    onClick={() => setShowLeaderboard(true)}
                    onMouseEnter={handleButtonHover}
                    className="px-6 py-3 bg-black/40 text-[#96fff2] border-2 border-[#96fff2] rounded-md hover:bg-[#96fff2]/10 transition-all duration-300 flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>Show Leaderboard</span>
                  </button>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            {renderLeaderboard()}
          </div>
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <p className="text-[#96fff2] text-lg leading-relaxed">{question?.hints[hintIndex]}</p>
              <div className="mt-6 flex justify-between items-center">
                <span className="text-[#96fff2]/60 text-sm">Click anywhere outside to close</span>
                <button 
                  onClick={() => {
                    handleButtonClick();
                    setHintIndex((prev) => (prev + 1) % question?.hints.length);
                  }}
                  className="px-4 py-2 bg-black/40 text-[#ff7700] border-2 border-[#ff7700] rounded-md hover:bg-[#ff7700]/10 transition-all duration-300"
                >
                  Next Hint
                </button>
              </div>
            </div>
          </div>
        )}
        {transitionOverlay}
        {errorMessageComponent}
        {submissionResultComponent}
        {evaluationResultComponent}
      </div>
    </>
  );
}