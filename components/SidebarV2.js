import { useState, useEffect } from 'react'
import { Icon, Transition } from '@supabase/ui'
import Link from 'next/link'

import Dropdown from 'components/Dropdown'
import { updateUserPreferences } from 'lib/helpers'

const Sidebar = ({
  showSidebar = false,
  direction='right',
  repositories = [],
  organizationSlug,
  onCloseSidebar = () => {},
}) => {

  const [showSortMenu, setShowSortMenu] = useState(false)
  const [repoList, setRepoList] = useState(repositories)
  const [selectedSort, setSelectedSort] = useState({ key: 'stargazers_count', order: 'desc' })

  useEffect(() => {
    const userPreferences = JSON.parse(localStorage.getItem(`repoSurf_${organizationSlug}`))
    if (userPreferences && userPreferences.sort) {
      const [key, order] = userPreferences.sort.split(' ')
      sortRepositories(key, order)
    }
  }, [organizationSlug])

  useEffect(() => {
    if (repositories.length > 0) sortRepositories(selectedSort.key, selectedSort.order)
  }, [repositories])
  
  const sortOptions = [
    {
      key: 'stargazers_count',
      label: 'Sort by most stars ',
      action: () => {
        sortRepositories('stargazers_count', 'desc')
        updateUserPreferences(organizationSlug, { sort: "stargazers_count desc" })
      }
    },
    {
      key: 'name',
      label: 'Sort by alphabetical',
      action: () => {
        sortRepositories('name', 'asc')
        updateUserPreferences(organizationSlug, { sort: "name asc" })
      }
    }
  ]

  const sortRepositories = (key, order) => {
    const sortedRepoList = order === 'asc'
      ? repositories.sort((a, b) => a[key] < b[key] ? -1 : 1)
      : repositories.sort((a, b) => a[key] > b[key] ? -1 : 1)
    setRepoList(sortedRepoList)
    setSelectedSort({ key, order })
  }

  return (
    <Transition
      show={showSidebar}
      enter="transition ease-out duration-100"
      enterFrom={`transform ${direction === 'right' ? 'translate-x-64' : '-translate-x-64'}`}
      enterTo="transform translate-x-0"
      leave="transition ease-in duration-75"
      leaveFrom="transform translate-x-0"
      leaveTo={`transform ${direction === 'right' ? 'translate-x-64' : '-translate-x-64'}`}
    >
      <div
        className={`
          bg-gray-800 flex flex-col w-64 z-50 fixed top-14 p-4 overflow-y-auto
          ${direction === 'right' ? 'right-0' : 'left-0'}
        `}
        style={{ height: 'calc(100vh - 3.5rem)'}}
      >
        <div className="flex items-center justify-between text-white">
          <p>Repositories</p>
          <div className="flex items-center space-x-4">
            <div className="cursor-pointer relative" onClick={() => setShowSortMenu(!showSortMenu)}>
              <Icon type="Sliders" size={16} strokeWidth={2} />
              <Dropdown
                showDropdown={showSortMenu}
                options={sortOptions}
                selectedOptionKey={selectedSort.key}
              />
            </div>
            <div className="cursor-pointer" onClick={() => onCloseSidebar()}>
              <Icon type="X" size={20} strokeWidth={2} />
            </div>
          </div>
        </div>


        <div>Search</div>

        <div>
          {repoList.map((repo, idx) => (
            <Link key={`repo_${idx}`} href={`/${organizationSlug}/${repo.name}`}>
              <div
                onClick={() => onCloseSidebar()}
                className={`
                  pl-5 pr-2 py-2 rounded-md cursor-pointer text-sm
                  text-gray-400 hover:bg-gray-600 hover:text-white
                `}
              >
                {repo.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Transition>
  )
}

export default Sidebar