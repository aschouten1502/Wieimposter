const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const pwaTags = `
    <meta name="theme-color" content="#0D0D0D" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Imposter" />
    <link rel="manifest" href="/manifest.json" />`;

// Inject before </head>
html = html.replace('</head>', pwaTags + '\n  </head>');

// Set lang to nl
html = html.replace('lang="en"', 'lang="nl"');

// Add viewport-fit=cover for notch support
html = html.replace(
  'width=device-width, initial-scale=1, shrink-to-fit=no',
  'width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
);

fs.writeFileSync(htmlPath, html);
console.log('PWA tags injected into dist/index.html');
