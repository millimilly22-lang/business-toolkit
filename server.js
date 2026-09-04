const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT) || 10000;
const host = '0.0.0.0';
const googleVerificationTag = '<meta name="google-site-verification" content="nwqdV5DpQLxayr6MkGqKr4ptvxJ0Yz7xf1EgTLlfOvE" />';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function safePath(urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  const requested = clean === '/' ? '/index.html' : clean;
  const resolved = path.resolve(root, '.' + requested);
  return resolved.startsWith(root) ? resolved : null;
}

const server = http.createServer((req, res) => {
  let filePath;
  try {
    filePath = safePath(req.url);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad request');
  }

  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, 'index.html');

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Not found');
      }

      const ext = path.extname(filePath).toLowerCase();
      let body = data;

      if (path.basename(filePath) === 'index.html') {
        const html = data.toString('utf8');
        body = Buffer.from(html.includes('google-site-verification') ? html : html.replace('<head>', `<head>\n  ${googleVerificationTag}`), 'utf8');
      }

      res.writeHead(200, {
        'Content-Type': types[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
      });
      res.end(body);
    });
  });
});

server.listen(port, host, () => {
  console.log(`Business Toolkit running on http://${host}:${port}`);
});
