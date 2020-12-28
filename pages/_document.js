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
          <meta property="og:title" content="repository.surf" key="title" />
          <meta property="og:description" content="Get insights across your organization's repositories" key="description" />
          <meta property="og:image" content="og-image.png" />
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