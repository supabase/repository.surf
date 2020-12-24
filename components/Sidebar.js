import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Dropdown from 'components/Dropdown'
import ExternalLink from 'icons/ExternalLink'
import Slider from 'icons/Slider'
import Close from 'icons/Close'

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

const ChevronLeft = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
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
  const [repoList, setRepoList] = useState(repositories)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [expandRepositories, setExpandRepositories] = useState(false) 

  const toggleSortMenu = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setShowSortMenu(!showSortMenu)
  }

  const sortRepositories = (key, order) => {
    const sortedRepoList = order === 'asc'
      ? repositories.sort((a, b) => a[key] < b[key] ? -1 : 1)
      : repositories.sort((a, b) => a[key] > b[key] ? -1 : 1)
    setRepoList(sortedRepoList)
  }

  const sortOptions = [
    {
      key: 'name',
      label: 'Sort by alphabetical',
      action: () => sortRepositories('name', 'asc')
    },
    {
      key: 'stars',
      label: 'Sort by most stars ',
      action: () => sortRepositories('stargazers_count', 'desc')
    }
  ]

  return (
    <div className={`bg-gray-500 flex flex-col h-screen w-64 ${className}`}>
      <div className="flex items-center h-16 flex-shrink-0 px-2 bg-gray-900">
        <div className="flex w-full items-center justify-between h-8 w-auto text-white">
          <div className="flex items-center">
            <Link href={'/'}>
              <div className="cursor-pointer mr-2">
                <ChevronLeft />
              </div>
            </Link>
            <div
              className="h-8 w-8 rounded-md bg-cover bg-center no-repeat"
              style={{ backgroundImage: `url(${organizationAvatar})`}}
            />
            <div className="ml-4 flex flex-col ">
              <p className="text-gray-400" style={{ fontSize: '0.6rem'}}>ORGANIZATION</p>
              <a
                className="text-white group flex items-center"
                href={`https://github.com/${router.query.org}`}
                target="_blank"
                style={{ marginTop: '-2px'}}
              >
                <span>{organizationName}</span>
                <div className="ml-2 transition opacity-0 group-hover:opacity-100">
                  <ExternalLink size={14} />
                </div>
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
            <div className="flex items-center">
              <div
                onClick={(e) => toggleSortMenu(e)}
                className={`transition relative ${expandRepositories ? 'opacity-100' : 'opacity-0'}`}
              >
                <Slider size={16} />
                <Dropdown showDropdown={showSortMenu} options={sortOptions} />
              </div>              
              <div className={`ml-4 transform transition ${expandRepositories ? 'rotate-180' : 'rotate-0'}`}>
                <ChevronDown />
              </div>
            </div>
          </div>
          {expandRepositories && (
            <div className="overflow-y-hidden space-y-1">
              {repoList.map((repo, idx) => (
                <Link key={`repo_${idx}`} href={`/${router.query.org}/${repo.name}`}>
                  <div
                    onClick={() => closeSidebar()}
                    className={`
                      pl-5 pr-2 py-2 rounded-md cursor-pointer text-sm
                      ${selectedView === repo ? 'bg-gray-900 text-brand-700' : 'text-gray-400 hover:bg-gray-600 hover:text-white'}
                    `}
                  >
                    {repo.name}
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