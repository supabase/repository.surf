import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { Icon } from '@supabase/ui'

import { fetchAndWait } from 'lib/fetchWrapper'
import { getUser } from 'lib/auth'
import CountUp from 'components/CountUp'
import Header from 'components/Header'

export default function Home() {

  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [loadGraphic, setLoadGraphic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [organization, setOrganization] = useState('')

  useEffect(() => {
    if (router.asPath.includes("access_token")) {
      router.push('/')
      setTimeout(() => setUserProfile(getUser()), 100)
      toast.success('Successfully logged in')
    }
    setLoadGraphic(true)
    setUserProfile(getUser())
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
        onLogout={() => {
          setUserProfile(null)
          toast.success('Successfully logged out')
        }}
      />
      <div className="flex lg:flex-row h-screen items-center bg-gray-800 relative overflow-y-hidden">
        <div
          className="absolute -top-16 -left-36 xl:-left-36 w-full sm:w-2/3 transform rotate-6 bg-gray-900 shadow-xl"
          style={{ height: '120vh'}}
        />
        <div className="grid grid-cols-12 gap-x-4 container px-10 sm:px-20 xl:px-28 mx-auto z-10 flex-col-reverse">
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
            {/* {user && (
              <div className="absolute -bottom-12 text-sm text-gray-400 flex items-center">
                <div
                  className="h-5 w-5 rounded-full bg-no-repeat bg-center bg-cover"
                  style={{ backgroundImage: `url('${user.user_metadata.avatar_url}')`}}
                />
                <span className="ml-2">{user.user_metadata.full_name}</span>
              </div>
            )} */}
          </div>

          {/* Graphic */}
          <div 
            className={`
              col-span-12 lg:col-start-9 lg:col-span-5 flex items-center justify-center
              transform skew-y-12 w-4/5 h-40 mx-auto lg:w-full lg:h-56 mb-20 lg:mb-0
            `}
          >
            <div className="relative h-full w-full border-b border-gray-400">
              <div className="w-full h-full absolute bottom-0 flex items-end justify-between px-8 lg:px-5 z-20">
                <div className={`w-5 transition-all duration-300 bg-brand-800 ${loadGraphic ? 'h-3/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-75 duration-300 bg-brand-800 ${loadGraphic ? 'h-2/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-100 duration-300 bg-brand-700 ${loadGraphic ? 'h-1/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-100 duration-300 bg-brand-700 ${loadGraphic ? 'h-4/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-200 duration-300 bg-brand-700 ${loadGraphic ? 'h-full' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-300 duration-300 bg-brand-600 ${loadGraphic ? 'h-2/5' : 'h-0'}`} />
                <div className={`w-5 transition-all delay-300 duration-300 bg-brand-600 ${loadGraphic ? 'h-1/5' : 'h-0'}`} />
              </div>
              <div className="w-full h-full absolute bottom-0 flex items-end justify-between px-8 lg:px-5 z-10 left-1 -top-1">
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
      </div>
    </>
  )
}