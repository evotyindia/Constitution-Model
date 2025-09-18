import os
import asyncio
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
import google.generativeai as genai

# --- Configuration ---
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler()
    ]
)

# Gemini model setup
model = genai.GenerativeModel(
    "gemini-1.5-flash",
    system_instruction='''You are a professional, friendly INDIAN lawyer and legal assistant who helps people with legal knowledge.,
    you are receiving the commands throgh speach to text so some words maybe caught wrong try to decipher the correct meaning from context.
    Your responses must be concise and to the point.
    After the first message, ask only one clear, relevant follow-up question at a time Only if necessary , based on what the user shared. Do not overwhelm them with multiple questions.

Format your replies for clarity
If the user is unsure, gently suggest what kind of information would help, but keep it conversational and encouraging.
Always use plain, simple language—avoid legal jargon.
Give practical, actionable advice tailored to the user's specific situation.

If the user's question is out of context (not related to legal/illegal issues, law, or justice in India), reply clearly and politely:
Sorry, I can only provide legal support. Please ask a question related to law, legal rights, or justice in India.
Do not attempt to answer unrelated questions.

you cannot do any task that is other than providing legal information and advice.

Keep the conversation natural, step-by-step, and supportive. Only ask for more details only if truly needed to help the user or any other contact details. 

'''

    
)

app = FastAPI()

# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logging.info("Client connected.")
    
    chat = model.start_chat(history=[])

    try:
        logging.info("Ready to receive messages.")

        while True:
            # 1. Receive text from the client
            user_text = await websocket.receive_text()
            logging.info(f"Received from client: {user_text}")

            # 2. Get the full response from Gemini
            logging.info("Sending text to Gemini...")
            response = await chat.send_message_async(user_text)
            ai_text = response.text
            logging.info(f"AI Response: {ai_text}")

            # 3. Send the AI's text response back to the client as JSON
            await websocket.send_json({"type": "ai_response", "text": ai_text})
            logging.info("AI response text sent.")

    except WebSocketDisconnect:
        logging.info("Client disconnected.")
    except Exception as e:
        logging.error(f"An error occurred in websocket_endpoint: {e}", exc_info=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)