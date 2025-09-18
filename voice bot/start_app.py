import subprocess
import os
import signal
import time
import sys
import platform

def clear_port_windows(port):
    print(f"Attempting to clear port {port} on Windows...")
    try:
        command = f"netstat -ano | findstr :{port}"
        result = subprocess.run(command, capture_output=True, text=True, shell=True)
        if result.stdout:
            for line in result.stdout.strip().split('\n'):
                parts = line.strip().split()
                if len(parts) >= 5:
                    pid = parts[-1]
                    if pid.isdigit():
                        print(f"Killing process with PID {pid} using port {port}")
                        subprocess.run(f"taskkill /F /PID {pid}", shell=True)
    except Exception as e:
        print(f"Error clearing port {port} on Windows: {e}")

def clear_port_linux(port):
    print(f"Attempting to clear port {port} on Linux...")
    try:
        subprocess.run(["fuser", "-k", "-s", "-n", "tcp", str(port)], check=False)
        print(f"Port {port} cleared (if in use).")
    except FileNotFoundError:
        print(f"Warning: 'fuser' command not found. Cannot automatically clear port {port}.")
    except Exception as e:
        print(f"Error clearing port {port}: {e}")

def start_server(command, cwd, name):
    print(f"Starting {name} with command: {' '.join(command)}")
    if platform.system() == "Windows":
        process = subprocess.Popen(command, cwd=cwd, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
    else:
        process = subprocess.Popen(command, cwd=cwd, preexec_fn=os.setsid)
    print(f"{name} started with PID: {process.pid}")
    return process

def main():
    if platform.system() == "Windows":
        clear_port_windows(8000)
        clear_port_windows(8001)
    else:
        clear_port_linux(8000)
        clear_port_linux(8001)
    time.sleep(1)

    backend_command = [sys.executable, "-m", "uvicorn", "main:app", "--reload"]
    frontend_command = [sys.executable, "-m", "http.server", "8001"]

    backend_process = None
    frontend_process = None

    try:
        backend_process = start_server(backend_command, "backend", "Backend")
        time.sleep(2)
        frontend_process = start_server(frontend_command, "frontend", "Frontend")

        print("\nApplication started. Press Ctrl+C to quit.")
        print(f"Frontend accessible at: http://localhost:8001")

        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("Quitting application...")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if backend_process:
            print(f"Terminating Backend (PID: {backend_process.pid})...")
            if platform.system() == "Windows":
                os.kill(backend_process.pid, signal.CTRL_C_EVENT)
            else:
                os.killpg(os.getpgid(backend_process.pid), signal.SIGTERM)
            backend_process.wait()
            print("Backend terminated.")
        if frontend_process:
            print(f"Terminating Frontend (PID: {frontend_process.pid})...")
            if platform.system() == "Windows":
                os.kill(frontend_process.pid, signal.CTRL_C_EVENT)
            else:
                os.killpg(os.getpgid(frontend_process.pid), signal.SIGTERM)
            frontend_process.wait()
            print("Frontend terminated.")
        print("Application stopped.")

if __name__ == "__main__":
    main()
