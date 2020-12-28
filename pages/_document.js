import Document, { Html, Head, Main, NextScript } from 'next/document'
import { useRouter } from 'next/router'

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