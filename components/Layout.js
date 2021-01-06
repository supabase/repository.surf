import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify';

// import Sidebar from 'components/Sidebar'
import SidebarV2 from 'components/SidebarV2'
import Header from 'components/Header'
import Loader from 'icons/Loader'

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

const Layout = ({
  view,
  repos,
  loaded,
  organization,
  children }) => {

  const router = useRouter()
  const [uPlotLoaded, setUPlotLoaded] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    if (uPlot) setUPlotLoaded(true)
  }, [])

  return (
    <div className="flex flex-col">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        hideProgressBar
      />
      <Head>
        <title>{router.query.org ? `${organization.name} ${router.query.repo ? '| ' + router.query.repo : ''}` : 'repository.surf'}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar on mobile */}
      {/* <div className={`fixed top-0 z-50 transform transition ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}>
        <Sidebar
          repositories={repos}
          selectedView={view}
          organizationAvatar={organization.avatar_url}
          organizationName={organization.name}
          closeSidebar={() => setSidebarOpen(false)}
        />
      </div>
      <div className="sm:hidden h-16 bg-gray-900 px-4 py-2 flex items-center">
        <div onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu />
        </div>
      </div> */}

      {/* <Sidebar
        className="hidden sm:flex"
        repositories={repos}
        selectedView={view}
        organizationAvatar={organization.avatar_url}
        organizationName={organization.name}
      /> */}

      <SidebarV2
        repositories={repos}
        showSidebar={showSidebar}
        organizationSlug={organization.login}
        onCloseSidebar={() => setShowSidebar(false)}
      />

      <Header
        organizationSlug={organization.login}
        organizationAvatar={organization.avatar_url}
        organizationName={organization.name}
        openSidebar={() => setShowSidebar(true)}
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
            : <>{children}</>
          }
        </main>
      )}
    </div>
  )
}

export default Layout