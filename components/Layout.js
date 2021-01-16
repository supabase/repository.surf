import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { Icon } from '@supabase/ui'

import Sidebar from 'components/Sidebar'
import Header from 'components/Header'
import Footer from 'components/Footer'

const Layout = ({
  references,
  repos,
  selectedRepos,
  loaded,
  organization,
  supabase,
  children,
  toggleRepo = () => {},
  toggleAllRepos = () => {},
}) => {

  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [uPlotLoaded, setUPlotLoaded] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    if (uPlot) setUPlotLoaded(true)
  }, [])

  useEffect(() => {
    const user = supabase.auth.user()
    if (user) setUserProfile(user.user_metadata)
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

      <Sidebar
        repositories={repos}
        selectedRepositories={selectedRepos}
        showSidebar={showSidebar}
        organizationSlug={organization.login}
        onToggleRepo={(repoName) => toggleRepo(repoName)}
        onToggleAllRepos={() => toggleAllRepos()}
        onCloseSidebar={() => setShowSidebar(false)}
      />

      <Header
        references={references}
        userProfile={userProfile}
        organizationSlug={organization.login}
        organizationAvatar={organization.avatar_url}
        organizationName={organization.name || organization.login}
        numberOfSelectedRepos={selectedRepos.length}
        openSidebar={() => setShowSidebar(true)}
        // onLogout={() => {
        //   setUserProfile(null)
        //   toast.success('Successfully logged out')
        // }}
      />

      {uPlotLoaded && (
        <main className="min-h-screen focus:outline-none flex flex-col bg-gray-700 px-5 py-14 sm:px-10 sm:py-24">
          {router.pathname !== '/settings' && !loaded
            ? (
              <div className="text-white flex-1 flex flex-col justify-center items-center">
                <Icon type="Loader" size={20} strokeWidth={2} className="animate-spin text-white" />
                <p className="text-xs mt-3 leading-5 text-center">Retrieving organization data</p>
              </div>
            )
            : <>{children}</>
          }
        </main>
      )}

      <Footer />
    </div>
  )
}

export default Layout