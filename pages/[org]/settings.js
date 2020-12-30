import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { updateUserPreferences } from 'lib/helpers'

const SaveIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
)

const Settings = ({
  repoNames,
  organization,
  onUpdateFilterList,
}) => {

  const [filterList, setFilterList] = useState('')

  useEffect(() => {
    const userPreferences = JSON.parse(localStorage.getItem(`repoSurf_${organization.login}`))
    if (userPreferences && userPreferences.repoFilter) setFilterList(userPreferences.repoFilter)
  }, [])

  const onSaveSettings = (event) => {
    let error = false
    
    if (event) {
      document.activeElement.blur();
      event.preventDefault()
      event.stopPropagation()
    }

    if (filterList.length > 0) {
      const filterListRepos = filterList.split(',').map(repo => repo.replace(/^[ ]+/g, ""))

      for (const repo of filterListRepos) {
        if (repoNames.indexOf(repo) === -1) {
          toast.error(`Unable to find ${repo} repository within the organization`)
          if (!error) error = true
        }
      }

      if (!error) {
        updateUserPreferences(organization.login, { repoFilter: filterList })
        onUpdateFilterList(filterListRepos)
        toast.success('Successfully updated settings!')
      }
    } else if (filterList.length === 0) {
      updateUserPreferences(organization.login, { repoFilter: [] })
      onUpdateFilterList([])
      toast.success('Successfully updated settings!')
    }
  }

  return (
    <>
      <div className="pb-5 sm:px-10 sm:pb-10 flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl">Settings</h1>
          <p className="mt-2 text-base text-gray-400">Adjust your settings here</p>
        </div>
        <div
          onClick={() => onSaveSettings()}
          className="text-white bg-brand-800 py-2 px-2 rounded-md cursor-pointer">
          <SaveIcon />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-start sm:px-10 text-white">
        <form className="w-full" onSubmit={(e) => onSaveSettings(e)}>
          <label htmlFor="filterList">
            Filter Repositories
            <span className="block text-gray-400 text-sm mt-1">Hide certain repositories in the side bar</span>
          </label>
          <input
            type="text"
            value={filterList}
            onChange={(e) => setFilterList(e.target.value)}
            placeholder="Comma separated strings"
            className="w-full text-sm bg-gray-700 border border-gray-500 rounded-md mt-3 py-2 px-2 font-light focus:outline-none focus:border-brand-600"
          />
        </form>
      </div>
    </>
  )
}

export default Settings