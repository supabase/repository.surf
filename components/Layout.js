import Head from 'next/head'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify';

import Sidebar from 'components/Sidebar'

const organizationLogo = process.env.NEXT_PUBLIC_ORGANIZATION_LOGO
const organization = process.env.NEXT_PUBLIC_GITHUB_ORGANIZATION
const organizationName = organization.charAt(0).toUpperCase() + organization.slice(1);

const Loader = () => (
  <svg
    className="animate-spin"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
)

const Menu = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="#FFF"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const Layout = ({ view, repos, loaded, children }) => {

  const [uPlotLoaded, setUPlotLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (uPlot) setUPlotLoaded(true)
  }, [])

  return (
    <div className="sm:flex">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        hideProgressBar
      />
      <Head>
        <title>{organizationName} | Issue Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar on mobile */}
      <div className={`absolute top-0 z-50 transform transition ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}>
        <Sidebar
          logoUrl={organizationLogo}
          repositories={repos}
          selectedView={view}
          closeSidebar={() => setSidebarOpen(false)}
        />
      </div>
      <div className="sm:hidden h-16 bg-gray-900 px-4 py-2 flex items-center">
        <div onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu />
        </div>
      </div>

      <Sidebar
        className="hidden sm:flex"
        logoUrl={organizationLogo}
        repositories={repos}
        selectedView={view}
      />

      {uPlotLoaded && (
        <main className="h-screen flex-1 overflow-y-auto focus:outline-none flex flex-col bg-gray-700 px-5 py-14 sm:px-10 sm:py-24">
          {!loaded
            ? (
              <div className="text-white flex-1 flex flex-col justify-center items-center">
                <Loader />
                <p className="text-xs mt-3 leading-5 text-center">Retrieving organization data</p>
              </div>
            )
            : <div>{children}</div>
          }
        </main>
      )}
    </div>
  )
}

export default Layout