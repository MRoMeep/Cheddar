import webview
import os
import threading
import http.server
import socketserver
import sys
import socket

def get_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath(os.path.dirname(__file__)), relative_path)

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

def start_server(port):
    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass  # Wyłączenie logowania konsoli

    os.chdir(get_path(""))
    with socketserver.TCPServer(("", port), QuietHandler) as httpd:
        httpd.serve_forever()

if __name__ == "__main__":
    try:
        port = find_free_port()
    except Exception:
        port = 8080

    t = threading.Thread(target=start_server, args=(port,), daemon=True)
    t.start()

    icon_path = get_path('logo.ico')
    window = webview.create_window(
        'Cheddar',
        f'http://localhost:{port}',
        width=1280,
        height=860,
        min_size=(960, 680)
    )
    webview.start(icon=icon_path if os.path.exists(icon_path) else None)