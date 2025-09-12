import os
import pathlib
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import google.genai as genai

# Load API key
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in .env file.")

# Create GenAI client
client = genai.Client(api_key=api_key)

# Upload Indian Constitution PDF once
file_path = pathlib.Path("https://github.com/M-luthra07/Constitution-Model/blob/main/20240716890312078.pdf")
if not file_path.exists():
    raise FileNotFoundError(f"PDF not found at {file_path}")

sample_file = client.files.upload(file=file_path)
print(f"📄 PDF uploaded with ID: {sample_file.name}")

# Initial system instruction
system_prompt = (
    "You are a friendly, experienced constitutional lawyer. "
    "You are speaking to a client who has little legal knowledge. "
    "Answer straight and don’t include unnecessary legal jargon. "
    "Explain answers in clear, simple language, while telling what steps to take. "
    "Ask relevant questions to understand the user's needs better."
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
    conversation = [sample_file] + [m["content"] for m in chat_history]

    reply_text = ""
    for chunk in client.models.generate_content_stream(
        model="gemini-2.5-flash",
        contents=conversation
    ):
        if chunk.text:
            reply_text += chunk.text

    chat_history.append({"role": "assistant", "content": reply_text})

    return jsonify({"reply": reply_text})

if __name__ == "__main__":
    app.run(debug=True)

