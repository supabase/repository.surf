import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { Icon } from '@supabase/ui'

import { fetchAndWait } from 'lib/fetchWrapper'
import CountUp from 'components/CountUp'
import Header from 'components/Header'
import OrgFeatureCard from 'components/OrgFeatureCard'

const githubAccessToken = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN
const featuredOrgNames = ['supabase', 'postgrest', 'superfly', 'questdb', 'vercel', 'posthog']

export async function getStaticProps() {
  const featuredOrganizations = await Promise.all(
    featuredOrgNames.map(org => fetch(
      `https://api.github.com/orgs/${org}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `bearer ${githubAccessToken}` 
        }
      }
    ).then(res => res.json()))
  )
  return {
    props: { featuredOrganizations }
  }
}

export default function Home({ userProfile, featuredOrganizations }) {
  const router = useRouter()
  const [loadGraphic, setLoadGraphic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [organization, setOrganization] = useState('')

  useEffect(() => {
    if (router.asPath.includes("access_token")) {
      router.push('/')
      toast.success('Successfully logged in')
    }
    setLoadGraphic(true)
  }, [])

  const goToOrganization = async(event) => {
    event.preventDefault()
    event.stopPropagation()

    setLoading(true)
    const org = await fetchAndWait(`https://api.github.com/orgs/${organization.toLowerCase()}`)
    if (org.login) {
      router.push(org.login)
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
        <title>repository.surf</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header
        hideOrgNav
        userProfile={userProfile}
      />
      <div className="flex flex-col min-h-screen items-center bg-gray-800 relative overflow-y-hidden">
        <div
          className="absolute top-8 sm:-top-16 -left-40 sm:-left-36 xl:-left-36 w-full sm:w-2/3 transform rotate-6 bg-gray-900 shadow-xl"
          style={{ height: '150vh'}}
        />
        <div className="min-h-screen sm:min-h-full lg:min-h-screen items-center py-40 sm:py-0 grid grid-cols-12 gap-x-4 container px-10 sm:px-20 xl:px-28 mx-auto z-10 flex-col-reverse sm:my-56 lg:my-0">
          <div className="row-start-2 lg:row-start-1 col-span-12 lg:col-span-6 relative">
            <div className="mb-10">
              <div className="flex items-center mb-5">
                <h1 className="text-white text-3xl xl:text-5xl leading-snug">
                  Get <span className="text-brand-700">insights</span> across your organization's repositories
                </h1>
              </div>
              <p className="text-white sm:w-auto text-lg xl:text-xl text-gray-400">Star history, issue tracking, and more to come</p>
            </div>
            <div className="mb-10">
              <form
                onSubmit={(e) => goToOrganization(e)}
                className={`
                  flex items-center bg-gray-500 font-mono px-2 py-1 rounded-md text-white focus:border
                  ${loading ? 'opacity-75' : ''}
                `}
              >
                <p className="hidden sm:block">repository.surf/</p>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="organization"
                  disabled={loading}
                  className="flex-1 bg-gray-500 text-white focus:outline-none"
                />
                {loading && <Icon type="Loader" size={18}  strokeWidth={2} className="text-white animate-spin" />}
              </form>
            </div>
            <div className="flex items-center justify-between">
              <a href="https://supabase.io" target="_blank" className="text-white text-gray-200 flex items-center opacity-75 hover:opacity-100 transition cursor-pointer">
                <span>Powered by</span>
                <img src='logo-dark.png' className="ml-2 h-5 relative" style={{ top: '2px'}}/>
              </a>
              <div className="flex items-center space-x-6">
                <a href="https://twitter.com/supabase_io" target="_blank">
                  <Icon type="Twitter" size={20} strokeWidth={2} className="text-white" />
                </a>
                <a href="https://github.com/supabase/repository.surf" target="_blank">
                  <Icon type="GitHub" size={20} strokeWidth={2} className="text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Graphic */}
          <div 
            className={`
              col-span-12 lg:col-start-9 lg:col-span-5 flex items-center justify-center
              transform skew-y-12 w-4/5 h-40 mx-auto sm:w-3/5 lg:w-full lg:h-56 mb-20 sm:mb-40 lg:mb-0
            `}
          >
            <div className="relative h-full w-full border-b border-gray-400">
              <div className="w-full h-full absolute bottom-0 flex items-end justify-between px-2 sm:px-5 z-20">
                <div className={`w-5 transition-all duration-300 bg-brand-800 ${loadGraphic ? 'h-3/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-75 duration-300 bg-brand-800 ${loadGraphic ? 'h-2/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-100 duration-300 bg-brand-700 ${loadGraphic ? 'h-1/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-100 duration-300 bg-brand-700 ${loadGraphic ? 'h-4/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-200 duration-300 bg-brand-700 ${loadGraphic ? 'h-full' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-300 duration-300 bg-brand-600 ${loadGraphic ? 'h-2/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-300 duration-300 bg-brand-600 ${loadGraphic ? 'h-1/5' : 'h-0'}`} />
              </div>
              <div className="w-full h-full absolute bottom-0 flex items-end justify-between px-2 sm:px-5 z-10 left-1 -top-1">
                <div className={`w-5 transition-all duration-300 bg-brand-900 ${loadGraphic ? 'h-3/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-75 duration-300 bg-brand-900 ${loadGraphic ? 'h-2/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-100 duration-300 bg-brand-900 ${loadGraphic ? 'h-1/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-100 duration-300 bg-brand-900 ${loadGraphic ? 'h-4/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-200 duration-300 bg-brand-900 ${loadGraphic ? 'h-full' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-300 duration-300 bg-brand-900 ${loadGraphic ? 'h-2/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-300 duration-300 bg-brand-900 ${loadGraphic ? 'h-1/5' : 'h-0'}`} />
              </div>
              <div 
                className={`
                  absolute bg-gray-600 h-16 w-24 rounded-md top-0 left-0 flex items-center justify-center transform transition-all
                  duration-200 ${loadGraphic ? 'opacity-100 scale-x-100 -translate-y-4 lg:translate-y-0' : 'opacity-0 scale-x-95 translate-y-2'}
                `}
                style={{ transitionDelay: '1500ms' }}
              >
                <span className="text-white mr-1">9,000</span>
                <Icon type="Star" size={20} strokeWidth={2} className="text-white" />
              </div>
              <div className="absolute -bottom-10 right-0 text-brand-700 flex items-center">
                <Icon type="ArrowDown" size={20} strokeWidth={2} className="text-brand-600 mr-1" />
                <CountUp>150</CountUp>
                <span className="text-xs ml-2 relative" style={{ top: '1px' }}>Issues</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Organizations */}
        <div className="w-full z-10 px-10 sm:px-20 xl:px-28 container mx-auto -mt-24 sm:-mt-32">
          <p className="text-white">Explore organizations</p>
          <div className="mt-8 mb-24 grid grid-cols-12 gap-x-0 sm:gap-x-4 lg:gap-x-8 gap-y-8">
            {featuredOrganizations.map(org => (
              <OrgFeatureCard key={org.id} org={org} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}