#!/usr/bin/env python3
"""CORS를 지원하는 간단한 HTTP 서버"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='src/binPacking/assets', **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    port = 8082
    server = HTTPServer(('127.0.0.1', port), CORSRequestHandler)
    print(f'CORS PLY 서버 시작: http://localhost:{port}')
    server.serve_forever()
