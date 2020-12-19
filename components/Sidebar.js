import { useState } from 'react'

const SideBar = ({
  logoUrl,
  repositories,
  selectedView,
  onSelectOverview,
  onSelectRepo,
}) => {

  const [expandRepositories, setExpandRepositories] = useState(false)

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

  return (
    <div className="bg-gray-500 flex flex-col h-screen w-64">
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
        <div className="flex items-center h-8 w-auto text-white">
          <img className="h-6" src={logoUrl} />
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto bg-gray-800 py-3">
        <nav className="flex-1 px-2 py-4 space-y-2">
          <div
            onClick={() => onSelectOverview()}
            className={`
              px-2 py-2 rounded-md cursor-pointer
              ${selectedView === 'Overview' ? 'bg-gray-900 text-brand-700' : 'text-gray-200 hover:bg-gray-600 hover:text-white'}
            `}
          >
            <span>Overview</span>
          </div>
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
          <div className={`overflow-y-hidden space-y-1 ${expandRepositories ? 'max-h-auto' : 'max-h-0'}`}>
            {repositories.map((repo, idx) => (
              <div
                key={`repo_${idx}`}
                onClick={() => onSelectRepo(repo)}
                className={`
                  pl-5 pr-2 py-2 rounded-md cursor-pointer text-sm
                  ${selectedView === repo ? 'bg-gray-900 text-brand-700' : 'text-gray-400 hover:bg-gray-600 hover:text-white'}
                `}
              >
                {repo}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default SideBar