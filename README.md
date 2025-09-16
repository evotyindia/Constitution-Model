# 🇮🇳 Constitutional Advisor Chatbot

A Flask-based web application that leverages Google's Gemini API to assist users with constitutional issues in India. The chatbot functions as a friendly, experienced constitutional lawyer, providing clear and simple explanations of rights and legal steps.

## 🚀 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/M-luthra07/Constitution-Model.git
   cd Constitution-Model
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   venv\Scripts\activate     # On Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   - Create a `.env` file in the project root.
   - Add your Google API key:
     ```
     GOOGLE_API_KEY=your_google_api_key_here
     ```

5. **Run the Flask application:**
   ```bash
   python app.py
   ```

6. **Access the application:**
   - Open your browser and navigate to:
     ```
     http://127.0.0.1:5000
     ```
