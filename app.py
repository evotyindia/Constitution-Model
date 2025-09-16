import os
import pathlib
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai
import markdown

# Load API key
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in .env file.")

# Configure GenAI
genai.configure(api_key=api_key)

# Load Indian Constitution PDF from local path
file_path = pathlib.Path("20240716890312078.pdf")
if not file_path.exists():
    raise FileNotFoundError(f"PDF not found at {file_path}")
print(f"📄 PDF loaded from {file_path}")

# Create model instance
model = genai.GenerativeModel("gemini-2.0-flash")

# Initial system instruction
system_prompt = (
    "You are a friendly, experienced constitutional lawyer. "
    "You are speaking to a client who has little legal knowledge. "
    "Answer straight and don’t include unnecessary legal jargon. "
    "Explain answers in clear, simple language, while telling what steps to take. "
    "Ask relevant questions to understand the user's needs better. "
    "<br><br>"
    "<strong>Please start your issue by answering these questions in bold:</strong><br>"
    "<strong>What happened?</strong> (Who did what to whom, when, and where?)<br>"
    "<strong>Why do you think it might be a constitutional issue?</strong> (What right do you believe was violated?)<br>"
    "<strong>What do you hope to achieve?</strong> (What outcome are you looking for?)<br>"
    "<strong>Have you already taken any steps to address this issue?</strong> (e.g., contacted anyone, filed a complaint)<br>"
)

# Flask app
app = Flask(__name__)

# Keep chat history
chat_history = [{"role": "system", "content": system_prompt}]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "").strip()
    if not user_message:
        return jsonify({"reply": "Please enter a valid question."})

    chat_history.append({"role": "user", "content": user_message})
    conversation = [m["content"] for m in chat_history]


    reply_text = ""
    response = model.generate_content(conversation)
    if hasattr(response, "text"):
        # Convert Markdown to HTML for proper rendering
        reply_text = markdown.markdown(response.text)

    chat_history.append({"role": "assistant", "content": reply_text})

    return jsonify({"reply": reply_text})

if __name__ == "__main__":
    app.run(debug=True)

