import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { fetchAndWait } from 'lib/fetchWrapper'
import { toast, ToastContainer } from 'react-toastify'
import Loader from 'components/Loader'

export default function Home() {

  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')
  const [organization, setOrganization] = useState('')

  useEffect(() => {
    setUrl(window.location.host)
  }, [])

  const goToOrganization = async(event) => {
    event.preventDefault()
    event.stopPropagation()

    setLoading(true)
    const org = await fetchAndWait(`https://api.github.com/orgs/${organization}`)
    if (org.name) {
      router.push(organization)
    } else {
      toast.error(`The organization ${organization} cannot be found`)
    }
    setLoading(false)
  }

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        hideProgressBar
      />
      <Head>
        <title>Insights | Supabase</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col h-screen justify-center bg-gray-800 relative">
        <div className="absolute -top-16 -left-36 xl:-left-16 w-full sm:w-2/3 transform rotate-6 bg-gray-900" style={{ height: '120vh'}}/>
        <div className="container px-5 sm:px-20 xl:px-28 mx-auto z-10">
          <div className="mb-10">
            <h1 className="text-white text-3xl xl:text-5xl sm:w-2/3 xl:w-1/2 mb-5 leading-snug">
              Get <span className="text-brand-700">insights</span> across your organization's repositories
            </h1>
            <p className="text-white w-3/4 sm:w-auto text-lg xl:text-xl text-gray-400">Star history, issue tracking, and more to come</p>
          </div>
          <div className="mb-10">
            <form
              onSubmit={(e) => goToOrganization(e)}
              className={`
                flex items-center bg-gray-500 font-mono px-2 py-1 rounded-md text-white focus:border sm:w-2/3 xl:w-1/2
                ${loading ? 'opacity-75' : ''}
              `}
            >
              <p className="hidden sm:block">insights.supabase.io/</p>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="organization"
                disabled={loading}
                className="flex-1 bg-gray-500 text-white focus:outline-none"
              />
              {loading && <Loader size={18} />}
            </form>
          </div>
          <a href="https://supabase.io" target="_blank" className="text-white sm:w-1/4 text-gray-200 flex items-center opacity-75 hover:opacity-100 transition cursor-pointer">
            <span>Powered by</span>
            <img src='logo-dark.png' className="ml-2 h-5 relative" style={{ top: '2px'}}/>
          </a>
        </div>
      </div>
    </>
  )
}