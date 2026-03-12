import webview
import os
import threading
import http.server
import socketserver
import sys

def get_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath(os.path.dirname(__file__)), relative_path)

def start_server():
    port = 8080
    handler = http.server.SimpleHTTPRequestHandler
    os.chdir(get_path(""))
    with socketserver.TCPServer(("", port), handler) as httpd:
        httpd.serve_forever()

if __name__ == "__main__":
    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    icon_path = get_path('logo.ico')
    window = webview.create_window('Cheddar', 'http://localhost:8080', width=1200, height=800)
    webview.start(icon=icon_path)