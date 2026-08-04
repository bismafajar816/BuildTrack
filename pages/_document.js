import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Urdu Font */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
        {/* You can add other meta tags, favicons, etc. here */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}