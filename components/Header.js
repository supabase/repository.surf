import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Icon } from '@supabase/ui'
import { toast } from 'react-toastify'
import Link from 'next/link'

import { fetchAndWait } from 'lib/fetchWrapper'
import { login } from 'lib/auth'

const Header = ({
  hideOrgNav = false,
  references,
  userProfile,
  organizationSlug,
  organizationAvatar,
  organizationName,
  numberOfSelectedRepos = 0,
  openSidebar = () => {},
}) => {

  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [organization, setOrganization] = useState('')

  useEffect(() => {
    if (organizationSlug) setOrganization(organizationSlug.toLowerCase())
  }, [organizationSlug])

  const goToOrganization = async(event) => {
    event.preventDefault()
    event.stopPropagation()

    setLoading(true)
    const org = await fetchAndWait(`https://api.github.com/orgs/${organization.toLowerCase()}`)
    if (org.login) {
      router.push(`/${org.login}`)
    } else {
      toast.error(`The organization ${organization} cannot be found`)
    }
    setLoading(false)
  }

  const scrollTo = (key) => {
    if (references[key]) {
      references[key].current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className={`${hideOrgNav ? 'absolute w-full' : 'sticky'} top-0 z-10`}>

      {/* Repository.surf Context Nav Bar */}
      <div className={`px-4 2xl:px-0 ${hideOrgNav && 'shadow'} bg-gray-900 h-14 flex items-center`}>
        <div className="mx-auto container flex items-center justify-between">
          <div className="flex-1 flex items-center justify-start">
            <Link href="/">
              <img className="h-6 cursor-pointer" src="/logo.png" />
            </Link>
          </div>
          {!hideOrgNav && (
            <div className="flex-1 flex items-center justify-center">
              <form
                onSubmit={(e) => goToOrganization(e)}
                className={`
                  flex items-center bg-gray-500 font-mono px-2 py-1 rounded-md text-white
                  w-full text-sm ${loading ? 'opacity-75' : ''}
                `}
              >
                <p className="hidden sm:block">repository.surf/</p>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="organization"
                  disabled={loading}
                  className="flex-1 bg-gray-500 text-white focus:outline-none text-center sm:text-left"
                />
                {loading && <Icon type="Loader" size={18} strokeWidth={2} className="animate-spin" />}
              </form>
            </div>
          )}
          <div className="flex-1 flex items-center justify-end">
            <div className="cursor-pointer relative">
              {userProfile
                ? (
                  <div
                    onClick={() => router.push('/settings')}
                    style={{ backgroundImage: `url('${userProfile.avatar_url}')` }}
                    className="h-8 w-8 bg-no-repeat bg-center bg-cover rounded-full" 
                  />
                )
                : (
                  <button
                    onClick={() => login()}
                    className={`
                      text-xs text-white border transition opacity-50 hover:opacity-100 px-3 py-1
                      rounded-full focus:outline-none
                    `}
                  >
                    Sign in with Github
                  </button>
                )
              }
            </div>
          </div>
        </div>
      </div>

      {/* Organization Context Nav Bar */}
      {!hideOrgNav && (
        <div className="px-4 2xl:px-0 bg-gray-700 h-14 flex items-center shadow-md ">
          {router.pathname !== '/settings' && (
            <div className="mx-auto container flex items-center justify-between">
              <div className="flex-1 flex items-center justify-start">
                <div
                  className="h-8 w-8 rounded-md bg-cover bg-center no-repeat"
                  style={{ backgroundImage: `url(${organizationAvatar})`}}
                />
                <a
                  className="hidden sm:flex ml-4 text-white group items-center"
                  href={`https://github.com/${router.query.org}`}
                  target="_blank"
                  style={{ marginTop: '-2px'}}
                >
                  <span>{organizationName}</span>
                  <div className="ml-4 transition opacity-0 group-hover:opacity-100">
                    <Icon type="ExternalLink" size={16} strokeWidth={2} className="text-gray-400" />
                  </div>
                </a>
              </div>
              <div className="flex-1 flex items-center justify-center space-x-8 text-white">
                <p className="cursor-pointer" onClick={() => scrollTo('stars')}>Stars</p>
                <p className="cursor-pointer" onClick={() => scrollTo('issues')}>Issues</p>
              </div>
              <div className="flex-1 flex items-center justify-end">
                <div className="hidden sm:flex px-2 py-1 text-white rounded-full border items-center justify-center mr-2" style={{ fontSize: '0.65rem' }}>
                  {numberOfSelectedRepos} repo{numberOfSelectedRepos > 1 && 's'} selected
                </div>
                <div className="cursor-pointer" onClick={() => openSidebar()}>
                  <Icon type="Filter" size={20} strokeWidth={2} className="text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Header