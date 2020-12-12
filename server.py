# -*- coding: utf-8 -*-
# test on python 3.4 ,python of lower version  has different module organization.
import http.server
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler


class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if 'dist' in self.path and '.js' not in self.path:
            self.path = self.path + '.js'
        print(self.path)
        super().do_GET()


MyHandler.extensions_map = {
    '.manifest': 'text/cache-manifest',
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg':	'image/svg+xml',
    '.css':	'text/css',
    '.js':	'application/x-javascript',
    '': 'application/octet-stream',  # Default
}

httpd = socketserver.TCPServer(("", PORT), MyHandler)

print("serving at port", PORT)
httpd.serve_forever()
