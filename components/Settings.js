import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

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
  onUpdateWhitelist,
}) => {

  const [whitelist, setWhitelist] = useState('')

  useEffect(() => {
    const whitelistRepos = localStorage.getItem(`issueTracker_${organization}`)
    if (whitelistRepos) setWhitelist(whitelistRepos)
  }, [])

  const onSaveSettings = (event) => {
    let error = false
    
    if (event) {
      document.activeElement.blur();
      event.preventDefault()
      event.stopPropagation()
    }

    // This part below is very messy, please do refactor

    if (whitelist.length > 0) {
      const whiteListRepos = whitelist.split(',').map(repo => repo.replace(/^[ ]+/g, ""))

      for (const repo of whiteListRepos) {
        if (repoNames.indexOf(repo) === -1) {
          toast.error(`Unable to find ${repo} repository within the organization`)
          if (!error) error = true
        }
      }

      if (!error) {
        localStorage.setItem(`issueTracker_${organization}`, whitelist)
        onUpdateWhitelist(whiteListRepos)
        toast.success('Successfully updated settings!')
      }

    } else if (whitelist.length === 0) {
      localStorage.removeItem(`issueTracker_${organization}`)
      onUpdateWhitelist([])
      toast.success('Successfully updated settings!')
    }
  }

  return (
    <>
      <div className="px-10 pb-10 flex items-center justify-between">
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
      <div className="flex-1 flex flex-col items-start px-10 text-white">

        <form className="w-full" onSubmit={(e) => onSaveSettings(e)}>
          <label htmlFor="whitelist">
            Whitelist Repositories
            <span className="block text-gray-400 text-sm mt-1">Hide certain repositories in the side bar</span>
          </label>
          <input
            type="text"
            value={whitelist}
            onChange={(e) => setWhitelist(e.target.value)}
            placeholder="Comma separated strings"
            className="w-full text-sm bg-gray-700 border border-gray-500 rounded-md mt-3 py-2 px-2 font-light focus:outline-none focus:border-brand-600"
          />
        </form>

        {/* <div className="flex flex-col justify-center overflow-y-auto">
          <p>Whitelist Repositories</p>
          <span className="text-gray-400 text-sm mt-1">Hide certain repositories in the side bar</span>
        </div>
        <input
          type="text"
          placeholder="Comma separated strings"
          className="w-full bg-gray-700 border border-gray-500 rounded-md mt-3 py-2 px-2 font-light focus:outline-none focus:border-brand-600"
        /> */}
      </div>
    </>
  )
}

export default Settings