let editor;
let hiddenTests = "";

// Load Monaco Editor
// require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@latest/min/vs' } });
// require(['vs/editor/editor.main'], function () {
//   editor = monaco.editor.create(document.getElementById('editor'), {
//     value: ``,
//     language: 'python',
//     theme: 'vs-dark'
//   });
// });

// Load Gemini-generated question
async function loadQuestion(level = 1) {
  document.getElementById("question").innerText = "Loading question...";
  try {
    const response = await fetch(`http://localhost:5000/generate-question?level=${level}`);
    const data = await response.json();
    
    let questionContent = data.question;
    let functionSignature = ''; // Set to empty string for no boilerplate

    // Store hidden tests privately without displaying them
    hiddenTests = data.hidden_tests || "";
    
    // Display only the visible question content
    document.getElementById("question").innerHTML = questionContent;

    // Set the editor content to the extracted function signature boilerplate
    editor.setValue(functionSignature);

  } catch (error) {
    document.getElementById("question").innerText = "Failed to load question.";
    console.error("Error fetching question:", error);
  }
}

// Run user code via Judge0
async function runCode() {
  const code = editor.getValue();
  const languageId = document.getElementById('language').value;
  const inputField = document.getElementById('user-input');
  const input = inputField.value;

  document.getElementById("output").innerText = "Running...";
  inputField.style.display = "block"; // Show input box when running

  try {
    const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-RapidAPI-Key": "78e9b0679dmshd8d773023b772ebp170d1djsn0f55845d4872" // 🔑 Replace with your key
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: input
      })
    });

    const result = await response.json();
    const output = result.stdout || result.stderr || "No output.";
    document.getElementById("output").innerText = output;
  } catch (error) {
    document.getElementById("output").innerText = "Error running code.";
    console.error("Judge0 Error:", error);
  }
}

// Evaluate code with Gemini using hidden test cases
async function evaluateCode() {
  const userCode = editor.getValue();
  const currentQuestion = document.getElementById("question").innerText;
  const selectedLanguage = document.getElementById("language").selectedOptions[0].text;

  // If user code is empty, display a message and do not evaluate
  if (userCode.trim() === '') {
    document.getElementById("output").innerText = "Please write some code before evaluating.";
    document.getElementById("test-summary-text").innerText = "No code to evaluate";
    document.getElementById("test-details").innerHTML = "";
    return;
  }

  document.getElementById("output").innerText = "Evaluating your solution...";
  document.getElementById("test-summary-text").innerText = "Running tests...";
  document.getElementById("test-details").innerHTML = "";

  try {
    const response = await fetch('http://localhost:5000/evaluate-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: userCode,
        question: currentQuestion,
        language: selectedLanguage,
        hidden_tests: hiddenTests
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.result || "No evaluation result.";
    
    // Only show the summary in the output
    const summaryMatch = result.match(/Test Cases Passed: (\d+)\/(\d+)/);
    if (summaryMatch) {
      let passed = parseInt(summaryMatch[1]);
      const total = 4; // Hardcode total to 4 test cases as per requirement

      // Ensure passed count does not exceed the fixed total of 4
      if (passed > total) {
        passed = total;
      }

      const percentage = Math.round((passed / total) * 100);
      
      // Update the summary text
      document.getElementById("test-summary-text").innerText = 
        `Test Cases Passed: ${passed}/${total} (${percentage}%)`;
      
      // Show a message in the output
      document.getElementById("output").innerText = 
        `Your solution passed ${passed} out of ${total} test cases (${percentage}%).\n\n` +
        (percentage === 100 ? "🎉 Congratulations! All test cases passed!" : 
         "Keep working on your solution to pass all test cases.");
    }

    // Uncommenting the following code block to make individual test cases visible again.
    const testDetails = document.getElementById("test-details");
    testDetails.innerHTML = ""; // Clear previous test details

    // Regex to find all test cases, capturing the number and the status (PASS/FAIL)
    const testCaseRegex = /Test Case (\d+): (PASS|FAIL)(?:\s*|\n*)(.*?)(?=(?:Test Case \d+:)|$)/gis;
    let match;
    let parsedTestCases = [];

    while ((match = testCaseRegex.exec(result)) !== null) {
        const testNumber = parseInt(match[1]);
        const testStatus = match[2];
        const testErrorDetails = match[3] ? match[3].trim() : '';

        parsedTestCases.push({
            number: testNumber,
            status: testStatus,
            errorDetails: testErrorDetails
        });
    }

    // Limit to the first 4 parsed test cases
    parsedTestCases = parsedTestCases.slice(0, 4);
    
    parsedTestCases.forEach((testCase, index) => {
      const isPass = testCase.status.toLowerCase() === 'pass';
      const testDiv = document.createElement('div');
      testDiv.className = `test-case ${isPass ? 'pass' : 'fail'}`;
      
      const testNumberSpan = document.createElement('span');
      testNumberSpan.className = 'test-number';
      testNumberSpan.textContent = `Test Case ${testCase.number}:`;
      
      const testStatusSpan = document.createElement('span');
      testStatusSpan.className = 'test-status';
      testStatusSpan.textContent = testCase.status;
      
      testDiv.appendChild(testNumberSpan);
      testDiv.appendChild(testStatusSpan);
      
      if (!isPass) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'test-error';
        errorDiv.textContent = "Test case failed. Try to handle this case in your solution.";
        // Optionally, if you want to show specific error details from Gemini (but you said hidden)
        if (testCase.errorDetails) {
          errorDiv.textContent += ` (Details: ${testCase.errorDetails})`;
        }
        testDiv.appendChild(errorDiv);
      }
      
      testDetails.appendChild(testDiv);
    });

  } catch (err) {
    document.getElementById("output").innerText = "Error during evaluation.";
    document.getElementById("test-summary-text").innerText = "Error running tests";
    console.error("Evaluation error:", err);
  }
}

// Load a question when the page first loads
window.onload = () => {
  loadQuestion(1);
};
