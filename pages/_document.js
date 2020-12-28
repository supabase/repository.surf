import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="stylesheet" href="/uPlot/uPlot.min.css" />

          {/* Primary Meta Tags */}
          <title>repository.surf | Powered by Supabase</title>
          <meta name="title" content="repository.surf | Powered by Supabase" />
          <meta name="description" content="Get insights across your organization's repositories" />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://repository.surf/" />
          <meta property="og:title" content="repository.surf | Powered by Supabase" />
          <meta property="og:description" content="Get insights across your organization's repositories" />
          <meta property="og:image" content="og-image.png" />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://repository.surf/" />
          <meta property="twitter:title" content="repository.surf | Powered by Supabase" />
          <meta property="twitter:description" content="Get insights across your organization's repositories" />
          <meta property="twitter:image" content="og-image.png" />

          <script type="text/javascript" src="/uPlot/uPlot.iife.min.js" />
        </Head>
        <body className="bg-gray-700">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument