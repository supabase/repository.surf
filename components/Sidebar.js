import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const ChevronDown = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="1"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const Close = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const Home = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
)

const SideBar = ({
  className = '',
  organizationAvatar,
  organizationName,
  repositories,
  selectedView,
  closeSidebar = () => {},
}) => {

  const router = useRouter()
  const [expandRepositories, setExpandRepositories] = useState(false) 

  return (
    <div className={`bg-gray-500 flex flex-col h-screen w-64 ${className}`}>
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
        <div className="flex w-full items-center justify-between h-8 w-auto text-white">
          <div className="flex items-center">
            {/* <Link href={'/'}>
              <div className="cursor-pointer">
                <Home />
              </div>
            </Link> */}
            <div
              className="h-8 w-8 rounded-md bg-cover bg-center no-repeat"
              style={{ backgroundImage: `url(${organizationAvatar})`}}
            />
            <div className="ml-4 flex flex-col ">
              <p className="text-gray-400" style={{ fontSize: '0.6rem'}}>ORGANIZATION</p>
              <a
                className="text-gray-200 hover:text-white"
                href={`https://github.com/${router.query.org}`}
                style={{ marginTop: '-2px'}}
              >
                {organizationName}
              </a>
            </div>
          </div>
          <div className="sm:hidden" onClick={() => closeSidebar()}>
            <Close />
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto bg-gray-800 py-3">
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link href={`/${router.query.org}`}>
            <div
              onClick={() => closeSidebar()}
              className={`
              px-2 py-2 rounded-md cursor-pointer
              ${selectedView === 'Overview' ? 'bg-gray-900 text-brand-700' : 'text-gray-200 hover:bg-gray-600 hover:text-white'}
              `}
            >
              <span>Overview</span>
            </div>
          </Link>
          <div
            onClick={() => setExpandRepositories(!expandRepositories)}
            className={`
              px-2 py-2 rounded-md cursor-pointer flex items-center justify-between
              ${selectedView === 'Repositories' ? 'bg-gray-900 text-brand-700' : 'text-gray-200 hover:bg-gray-600 hover:text-white'}
            `}
          >
            <span>Repositories</span>
            <div className={`transform transition ${expandRepositories ? 'rotate-180' : 'rotate-0'}`}>
              <ChevronDown />
            </div>
          </div>
          {expandRepositories && (
            <div className="overflow-y-hidden space-y-1">
              {repositories.map((repo, idx) => (
                <Link key={`repo_${idx}`} href={`/${router.query.org}/${repo}`}>
                  <div
                    onClick={() => closeSidebar()}
                    className={`
                      pl-5 pr-2 py-2 rounded-md cursor-pointer text-sm
                      ${selectedView === repo ? 'bg-gray-900 text-brand-700' : 'text-gray-400 hover:bg-gray-600 hover:text-white'}
                    `}
                  >
                    {repo}
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link href={`/${router.query.org}/settings`}>
            <div
              onClick={() => closeSidebar()}
              className={`
              px-2 py-2 rounded-md cursor-pointer
              ${selectedView === 'Settings' ? 'bg-gray-900 text-brand-700' : 'text-gray-200 hover:bg-gray-600 hover:text-white'}
              `}
            >
              <span>Settings</span>
            </div>
          </Link>
        </nav>
      </div>
    </div>
  )
}

export default SideBar