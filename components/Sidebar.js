import { useState, useEffect } from 'react'
import { Checkbox, Icon, Transition, Input } from '@supabase/ui'

import Dropdown from 'components/Dropdown'
import { updateUserPreferences } from 'lib/helpers'

const Sidebar = ({
  showSidebar = false,
  direction='right',
  repositories = [],
  selectedRepositories = [],
  organizationSlug,
  onToggleRepo = () => {},
  onToggleAllRepos = () => {},
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
    } else {
      sortRepositories('stargazers_count', 'desc')
    }
  }, [organizationSlug])

  useEffect(() => {
    if (repositories.length > 0) sortRepositories(selectedSort.key, selectedSort.order)
    else setRepoList(repositories)
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
    const filteredRepos = repositories.filter(repo => repo.name.indexOf(text) >= 0)
    setRepoList(filteredRepos)
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
            <div className="cursor-pointer" onClick={() => {
              onCloseSidebar()
              setRepoList(repositories)
            }}>
              <Icon type="X" size={20} strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="mt-3 mb-6">
          <Input
            icon={<Icon type="Search" />}
            onChange={(text) => onSearchRepository(text)}
            type="text"
            placeholder="Search for a repository"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              label="Select all"
              checked={selectedRepositories.length === repositories.length}
              onChange={() => onToggleAllRepos()}
            />
          </div>
          <p className="text-sm text-gray-400">
            {selectedRepositories.length > 0 ? selectedRepositories.length : 'No'} repo{selectedRepositories.length > 1 && 's'} selected
          </p>
        </div>

        <div className="border-t border-gray-500 my-4" />

        <div className="space-y-4">
          {repoList.map((repo, idx) => {
            return (
              <div key={`repo_${idx}`} className="flex items-center">
                <Checkbox
                  label={repo.name}
                  checked={selectedRepositories.indexOf(repo.name) >= 0}
                  onChange={() => onToggleRepo(repo.name)}
                />
                {repo.private && (
                  <div className="text-gray-400 text-xs border border-gray-400 rounded-full ml-3 px-2">
                    Private
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Transition>
  )
}

export default Sidebar