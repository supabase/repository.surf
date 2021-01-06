import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Icon } from '@supabase/ui'
import { toast } from 'react-toastify'
import Link from 'next/link'

import { fetchAndWait } from 'lib/fetchWrapper'

const Header = ({
  organizationSlug,
  organizationAvatar,
  organizationName,
  openSidebar,
}) => {

  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [organization, setOrganization] = useState('')

  useEffect(() => {
    if (organizationSlug) setOrganization(organizationSlug)
  }, [organizationSlug])

  const goToOrganization = async(event) => {
    event.preventDefault()
    event.stopPropagation()

    setLoading(true)
    const org = await fetchAndWait(`https://api.github.com/orgs/${organization}`)
    if (org.name) {
      router.push(organization.toLowerCase())
    } else {
      toast.error(`The organization ${organization} cannot be found`)
    }
    setLoading(false)
  }

  return (
    <div className="sticky top-0 z-30">

      {/* Repository.surf Context Nav Bar */}
      <div className="bg-gray-900 h-14 flex items-center">
        <div className="mx-auto container flex items-center justify-between">
          <div className="flex-1 flex items-center justify-start">
            <Link href="/">
              <img className="h-6 cursor-pointer" src="logo.png" />
            </Link>
          </div>
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
                className="flex-1 bg-gray-500 text-white focus:outline-none"
              />
              {loading && <Icon type="Loader" size={18} strokeWidth={2} className="animate-spin" />}
            </form>
          </div>
          <div className="flex-1 flex items-center justify-end space-x-8">
            <div className="cursor-pointer" onClick={() => {console.log("Settings")}}>
              <Icon type="Settings" size={20} strokeWidth={2} className="text-white" />
            </div>
            <div className="cursor-pointer" onClick={() => {console.log("User")}}>
              <Icon type="User" size={20} strokeWidth={2} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Organization Context Nav Bar */}
      <div className="bg-gray-700 h-14 flex items-center shadow-md ">
        <div className="mx-auto container flex items-center justify-between">
          <div className="flex-1 flex items-center justify-start">
            <div
              className="h-8 w-8 rounded-md bg-cover bg-center no-repeat"
              style={{ backgroundImage: `url(${organizationAvatar})`}}
            />
            <a
              className="ml-4 text-white group flex items-center"
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
          <div className="flex-1 flex items-center justify-center space-x-6 text-white">
            <p>Stars</p>
            <p>Issues</p>
          </div>
          <div className="flex-1 flex items-center justify-end">
            <div className="cursor-pointer" onClick={() => openSidebar()}>
              <Icon type="Filter" size={20} strokeWidth={2} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header