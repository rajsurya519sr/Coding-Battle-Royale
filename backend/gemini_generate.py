from flask import Flask, jsonify, request
from flask_cors import CORS
import google.generativeai as genai
import random
import re

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True, methods=["GET", "POST", "OPTIONS"])

# Handle preflight CORS requests
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        headers = response.headers
        headers["Access-Control-Allow-Origin"] = "*"
        headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

# 🔑 Replace with your Gemini API key
genai.configure(api_key="AIzaSyCbNnmY8DKQbqra0F6S7hba7rGNpoc1E3M")
model = genai.GenerativeModel(model_name="models/gemini-1.5-flash-latest")

# Topics categorized by difficulty
level_topics = {
    1: ['arrays', 'strings', 'recursion', 'basic math'],
    2: ['linked list', 'stack', 'queue', 'hash map'],
    3: ['graph', 'tree', 'binary tree', 'DFS', 'BFS']
}

# Generate prompt for Gemini
def generate_prompt(level):
    topic = random.choice(level_topics[level])
    difficulty = {1: "Easy", 2: "Medium", 3: "Hard"}[level]
    return f"""
You are a top-tier competitive programming problem setter.

Generate ONE high-quality coding problem for an online judge like LeetCode.

- Difficulty: {difficulty}
- Topic: {topic}

The problem must include:

---

Title: A short, descriptive title

Description:
A detailed problem statement including:
- What the function should do
- Definitions and behavior of inputs
- Edge cases
- Real-world scenario if possible

Input Format:
- Number of inputs
- Type/structure (e.g., list of integers, string, tree)
- Preconditions/constraints

Output Format:
- What to return (e.g., integer, string)
- Edge behavior

Constraints:
- 3–6 constraints with appropriate ranges

Sample Input 1:
Example input

Sample Output 1:
Correct output for above input

Explanation 1:
Step-by-step explanation of output

Function Signature:
Python-style function signature, e.g., for a method within a class like LeetCode:

```python
class Solution:
  def solve(self, ...):
    # Your code here
    pass
```

Edge Cases:
Mention 2–3 edge cases

Summary:
Short summary of the task

---

**Hidden Test Cases (for internal validation only)**

Provide exactly 4 hidden test cases. Do NOT provide more or less than 4.

Test Case 1:
Input: ...
Expected Output: ...

Test Case 2:
Input: ...
Expected Output: ...

(Only plain text, no explanation.)
"""

# Route to generate coding problem
@app.route('/generate-question', methods=['GET'])
def generate_question():
    level = int(request.args.get('level', 1))
    prompt = generate_prompt(level)
    response = model.generate_content(prompt)
    full_text = response.text

    question_md = full_text.strip()
    hidden_tests = ""

    # Define the regex to find the start of the hidden test cases block for extraction.
    # This matches the header itself.
    hidden_tests_header_regex = re.compile(
        r'''\*\*Hidden Test Cases \(for internal validation only\)\*\*[
]+([\s\S]*)''',
        re.IGNORECASE
    )

    # Attempt to extract hidden_tests content first.
    hidden_tests_extract_match = hidden_tests_header_regex.search(full_text)
    if hidden_tests_extract_match:
        hidden_tests = hidden_tests_extract_match.group(1).strip()

    # Now, define a regex to find and remove the *entire* block (including --- and header)
    # from the question_md. This regex is for removal from the original text.
    block_to_remove_regex = re.compile(
        r'''---\s*\*\*Hidden Test Cases \(for internal validation only\)\*\*[
]+[\s\S]*''',
        re.DOTALL | re.IGNORECASE
    )

    # Use re.sub to remove the entire block from the full_text to get the clean question_md.
    question_md = block_to_remove_regex.sub('', full_text, 1).strip()

    # Ensure no trailing '---' is left in the problem statement.
    question_md = re.sub(r'\n---\s*$', '', question_md).strip()

    return jsonify({
        "question": question_md,
        "hidden_tests": hidden_tests
    })

# Route to evaluate user code
@app.route('/evaluate-code', methods=['POST', 'OPTIONS'])
def evaluate_code():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    user_code = data.get("code", "")
    question = data.get("question", "")
    language = data.get("language", "")
    hidden_tests = data.get("hidden_tests", "")

    prompt = f"""
You are a code evaluator.

Below is a coding problem followed by a solution written in {language}.

Evaluate the code by running it against each hidden test case.

Return your output in this format:
- "Test Cases Passed: X/Y"
- List each test case result (Pass/Fail)
- If failed, mention expected vs actual output briefly
- End with a short evaluation summary (logic, correctness, etc.)

---

Problem:
{question}

User Code:
```{language.lower()}
{user_code}
"""
    response = model.generate_content(prompt)
    return jsonify({"result": response.text})

if __name__ == '__main__':
    print("✅ Gemini backend running at http://localhost:5000")
    app.run(debug=True)

