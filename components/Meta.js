import Head from 'next/head'
import { useRouter } from 'next/router'

const Meta = () => {
  const { basePath } = useRouter()
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>repository.surf | Powered by Supabase</title>
      <meta name="title" content="repository.surf | Powered by Supabase" />
      <meta name="description" content="Get insights across your organization's repositories" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://repository.surf/" />
      <meta property="og:title" content="repository.surf | Powered by Supabase" />
      <meta property="og:description" content="Get insights across your organization's repositories" />
      <meta property="og:image" content={`${basePath}/og-image.png`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://repository.surf/" />
      <meta property="twitter:title" content="repository.surf | Powered by Supabase" />
      <meta property="twitter:description" content="Get insights across your organization's repositories" />
      <meta property="twitter:image" content={`${basePath}/og-image.png`} />
    </Head>
  )
}

export default Meta