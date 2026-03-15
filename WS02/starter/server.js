const http = require('http'); 
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json'
};

// Create HTTP server
const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    try {
        let filePath;

        // Routing
        if (req.url === '/') {
            filePath = path.join(PUBLIC_DIR, 'index.html');
        } else if (req.url === '/about') {
            filePath = path.join(PUBLIC_DIR, 'about.html');
        } else if (req.url === '/contact') {
            filePath = path.join(PUBLIC_DIR, 'contact.html');
        } else if (req.url.startsWith('/styles/')) {
            filePath = path.join(PUBLIC_DIR, req.url);

            // Security: Prevent path traversal
            const normalizedPath = path.normalize(filePath);
            if (!normalizedPath.startsWith(PUBLIC_DIR)) {
                handle404(res);
                return;
            }
        } else {
            handle404(res);
            return;
        }

        // Serve file
        const extname = path.extname(filePath);
        const contentType = MIME_TYPES[extname] || 'text/html';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    handle404(res);
                } else {
                    handleServerError(res, err);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });

    } catch (error) {
        handleServerError(res, error);
    }
});

// 404 handler
function handle404(res) {
    const notFoundPath = path.join(PUBLIC_DIR, '404.html');
    fs.readFile(notFoundPath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - Page Not Found');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
        }
    });
}

// 500 handler
function handleServerError(res, error) {
    console.error(error);
    const serverErrorPath = path.join(PUBLIC_DIR, '500.html');
    fs.readFile(serverErrorPath, (err, content) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 - Internal Server Error');
        } else {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
        }
    });
}

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('  GET /         -> index.html');
    console.log('  GET /about    -> about.html');
    console.log('  GET /contact  -> contact.html');
});