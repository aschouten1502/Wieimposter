import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0A0A1A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Imposter" />
        <link rel="manifest" href="/manifest.json" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            height: 100%;
            min-height: 100vh;
            min-height: -webkit-fill-available;
            background-color: #0A0A1A;
            margin: 0;
            padding: 0;
          }
          body {
            overflow: hidden;
            padding-bottom: env(safe-area-inset-bottom);
          }
          #root {
            display: flex;
            height: 100%;
            min-height: 100vh;
            min-height: -webkit-fill-available;
            flex: 1;
            background-color: #0A0A1A;
          }
        `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
