import { useState, useEffect } from 'react'
import { Icon, Transition, Checkbox } from '@supabase/ui'

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

  const onSearchRepository = (text) => {
    console.log("Search", text)
  }

  return (
    <Transition
      show={showSidebar}
      enter="transition ease-out duration-100"
      enterFrom={`transform ${direction === 'right' ? 'translate-x-80' : '-translate-x-80'}`}
      enterTo="transform translate-x-0"
      leave="transition ease-in duration-75"
      leaveFrom="transform translate-x-0"
      leaveTo={`transform ${direction === 'right' ? 'translate-x-80' : '-translate-x-80'}`}
    >
      <div
        className={`
          bg-gray-800 flex flex-col w-80 z-50 fixed top-14 p-4 overflow-y-auto
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

        <div className="my-6">
          <input
            className={`
              w-full rounded-md bg-gray-800 border border-gray-600 text-sm py-2 px-3 text-white
              focus:outline-none focus:border-brand-800
            `}
            placeholder="Search for a repository"
            onChange={(e) => onSearchRepository(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Checkbox label="Select all" onChange={() => console.log("Select all")} />
          <p className="text-sm text-gray-400">5 repos selected</p>
        </div>

        <div className="border-t border-gray-500 my-4" />

        <div className="space-y-4">
          {repoList.map((repo, idx) => (
            <Checkbox
              key={`repo_${idx}`}
              label={repo.name}
              layout="vertical"
              className="font-sans text-gray-400"
              onChange={() => {console.log("selecting", repo.name)}}
            />
          ))}
        </div>
      </div>
    </Transition>
  )
}

export default Sidebar