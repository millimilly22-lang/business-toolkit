const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT) || 10000;
const host = '0.0.0.0';
const siteUrl = 'https://business-toolkit-fu3w.onrender.com';
const googleVerificationTag = '<meta name="google-site-verification" content="nwqdV5DpQLxayr6MkGqKr4ptvxJ0Yz7xf1EgTLlfOvE" />';

const seoHead = `
  <link rel="canonical" href="${siteUrl}/">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Business Toolkit – Invoice Scanner, Receipt Scanner & Data Analyzer">
  <meta property="og:description" content="Scan invoices and receipts, analyze PDFs, Excel and CSV files, find missing information, create invoices and track expenses in one browser-based business toolkit.">
  <meta property="og:url" content="${siteUrl}/">
  <meta name="twitter:card" content="summary">
  <script type="application/ld+json">
  {
    "@context":"https://schema.org",
    "@type":"SoftwareApplication",
    "name":"Business Toolkit",
    "applicationCategory":"BusinessApplication",
    "operatingSystem":"Web",
    "url":"${siteUrl}/",
    "description":"Browser-based business toolkit for invoice scanning, receipt scanning, PDF analysis, Excel and CSV analysis, invoice creation, expense tracking and document organization.",
    "featureList":[
      "Invoice scanner",
      "Receipt scanner",
      "Document OCR",
      "PDF analyzer",
      "Excel analyzer",
      "CSV analyzer",
      "Invoice maker",
      "Expense tracker",
      "Missing information detection"
    ]
  }
  </script>
  <style>
    .seo-overview{margin-top:18px}
    .seo-overview h2{margin:0 0 8px;font-size:24px;line-height:1.2}
    .seo-overview h3{margin:0 0 6px;font-size:16px}
    .seo-overview p{color:#667085;line-height:1.6}
    .seo-feature-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}
    .seo-feature{border:1px solid #e3e8ef;border-radius:12px;padding:14px;background:#f8fafc}
    .seo-faq{margin-top:14px}
    .seo-faq details{border-top:1px solid #e3e8ef;padding:12px 0}
    .seo-faq summary{cursor:pointer;font-weight:800}
    .legal-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:14px;font-size:13px}
    @media(max-width:620px){.seo-feature-grid{grid-template-columns:1fr}.seo-overview h2{font-size:21px}}
  </style>`;

const seoSection = `
        <div class="seo-overview panel" id="businessToolsOverview">
          <h2>Invoice scanner, receipt scanner, PDF and Excel analyzer in one business toolkit</h2>
          <p>Business Toolkit helps small businesses and self-employed professionals scan invoices and receipts, read document text, find missing information, analyze PDF, Excel and CSV files, create invoices, record expenses and organize business documents from one browser-based workspace.</p>
          <div class="seo-feature-grid">
            <div class="seo-feature"><h3>Invoice & receipt scanner</h3><p>Photograph or upload invoices and receipts. OCR extracts readable text and the document checker highlights important missing information in red.</p></div>
            <div class="seo-feature"><h3>PDF document analyzer</h3><p>Upload text-based PDFs or scanned PDF pages to extract text and check business-document information.</p></div>
            <div class="seo-feature"><h3>Excel & CSV analyzer</h3><p>Review rows, columns, numeric totals, missing cells and duplicate rows, then export cleaned CSV data.</p></div>
            <div class="seo-feature"><h3>Invoice maker & expense tracker</h3><p>Create invoices with VAT calculations, track paid and unpaid invoices, record expenses and monitor basic revenue, costs and profit.</p></div>
          </div>
          <div class="seo-faq">
            <h3>Frequently asked questions</h3>
            <details><summary>Can Business Toolkit scan receipts and invoices?</summary><p>Yes. You can take a photo or upload an image or PDF. The browser reads document text and checks important fields.</p></details>
            <details><summary>Can I analyze Excel, CSV and PDF files?</summary><p>Yes. Spreadsheet files receive table analysis, while PDFs and document images receive text extraction and document checks.</p></details>
            <details><summary>Does Business Toolkit require an account?</summary><p>No account is required for the current public beta. Core records are stored locally in the browser.</p></details>
            <details><summary>Is OCR or financial analysis guaranteed to be correct?</summary><p>No. OCR and automated checks can make mistakes. Users should verify invoices, VAT, totals and other business information before relying on it.</p></details>
          </div>
          <div class="legal-links">
            <a href="terms.html">Terms of Service</a>
            <a href="privacy.html">Privacy Policy</a>
            <a href="disclaimer.html">Disclaimer</a>
            <a href="contact.html">Operator & Contact</a>
          </div>
        </div>`;

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
        let html = data.toString('utf8');
        html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>Business Toolkit – Invoice Scanner, Receipt Scanner & Data Analyzer</title>');
        html = html.replace(/<meta name="description"[^>]*>/i, '<meta name="description" content="Scan invoices and receipts, analyze PDFs, Excel and CSV files, find missing information, create invoices and track expenses with Business Toolkit.">');
        if (!html.includes('google-site-verification')) html = html.replace('<head>', `<head>\n  ${googleVerificationTag}`);
        if (!html.includes('rel="canonical"')) html = html.replace('</head>', `${seoHead}\n</head>`);
        if (!html.includes('businessToolsOverview')) {
          const marker = '      </section>\n\n      <section class="tab" id="scan">';
          if (html.includes(marker)) {
            html = html.replace(marker, `${seoSection}\n      </section>\n\n      <section class="tab" id="scan">`);
          }
        }
        html = html.replace(
          '<footer class="footer"><span>Business Toolkit</span><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></footer>',
          '<footer class="footer"><span>Business Toolkit</span><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="disclaimer.html">Disclaimer</a><a href="contact.html">Contact</a></footer>'
        );
        body = Buffer.from(html, 'utf8');
      }

      res.writeHead(200, {
        'Content-Type': types[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      });
      res.end(body);
    });
  });
});

server.listen(port, host, () => {
  console.log(`Business Toolkit running on http://${host}:${port}`);
});
