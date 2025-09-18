# Legal AI Conversational App

Welcome to the Legal AI Conversational App! This is a voice-based conversational AI assistant designed to provide information on legal topics. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Python 3.9+**: You can download it from [python.org](https://www.python.org/downloads/).

### Installation

Follow these steps to set up your local development environment.

**1. Clone the Repository**

First, you need to get the project files. If you have `git` installed, you can clone the repository. If not, you can download the source code as a ZIP file and extract it.

**2. Create a Virtual Environment**

A virtual environment is a self-contained directory that contains a specific version of Python and all the necessary packages for a project. This is a best practice to avoid conflicts between projects.

*   **Open your terminal or command prompt.**
*   **Navigate to the project directory:**

    ```bash
    cd path/to/your/project
    ```

*   **Create the virtual environment:**

    ```bash
    python -m venv .venv
    ```

    This will create a `.venv` folder in your project directory.

**3. Activate the Virtual Environment**

Before you can install packages or run the application, you need to activate the virtual environment.

*   **On macOS and Linux:**

    ```bash
    source .venv/bin/activate
    ```

*   **On Windows:**

    ```bash
    .venv\Scripts\activate
    ```

    Your terminal prompt should now show the name of the virtual environment (e.g., `(.venv) ...`).

**4. Install Dependencies**

Now that you are in the virtual environment, you can install the required Python packages using `pip` and the `requirements.txt` file.

```bash
pip install -r requirements.txt
```

**5. Configure API Keys**

This application uses the Gemini API to power the conversational AI. You will need to get an API key from Google AI Studio.

1.  Go to [Google AI Studio](https://aistudio.google.com/) and create an API key.
2.  Create a new file named `.env` inside the `backend` directory.
3.  Open the `.env` file and add the following line, replacing `your_gemini_api_key_here` with your actual API key:

    ```
    GEMINI_API_KEY="your_gemini_api_key_here"
    ```

### Running the Application

Once you have completed the setup, you can run the application using the provided `start_app.py` script. This script will start both the backend server and the frontend server.

1.  **Make sure your virtual environment is activated.**
2.  **Run the start script:**

    ```bash
    python start_app.py
    ```

3.  **Access the application:**

    Open your web browser and navigate to [http://localhost:8001](http://localhost:8001).

    You should now see the Legal AI Assistant interface. Click on "Start Conversation" to begin.

### Stopping the Application

To stop the application, go back to your terminal where the `start_app.py` script is running and press `q` followed by `Enter`.

## Project Structure

*   `frontend/`: Contains the HTML, CSS, and JavaScript for the web interface.
*   `backend/`: Contains the FastAPI Python server that handles the AI logic and WebSocket communication.
*   `start_app.py`: A script to start both the frontend and backend servers.
*   `requirements.txt`: A list of Python dependencies for the project.

## Troubleshooting

*   **Port already in use**: If you get an error that port 8000 or 8001 is already in use, it means another application is using that port. The `start_app.py` script attempts to clear these ports, but if it fails, you may need to manually stop the process using the port.
*   **Browser compatibility**: This application uses the Web Speech API, which is not supported by all browsers. For the best experience, use a modern browser like Google Chrome or Microsoft Edge.
