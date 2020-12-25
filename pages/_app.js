import '../styles/globals.css'
import "tailwindcss/tailwind.css";
import 'react-toastify/dist/ReactToastify.css';

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

import Layout from 'components/Layout'
import { fetchAndWait } from 'lib/fetchWrapper'

const githubAccessToken = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN
const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY

function MyApp({ Component, pageProps, router }) {

  const supabase = createClient(supabaseURL, supabasePublicKey)
  const selectedView = router.asPath.indexOf('settings') !== -1
    ? 'Settings'
    : router.query.repo
    ? router.query.repo
    : router.query.org
    ? 'Overview'
    : ''

  const [loaded, setLoaded] = useState(false)
  const [organization, setOrganization] = useState({})

  const [repos, setRepos] = useState([])
  const [viewableRepos, setViewableRepos] = useState([])
  const [filteredRepoNames, setFilteredRepoNames] = useState([])

  useEffect(() => {
    if (router.pathname !== '/' && router.query.org) {
      (async function retrieveGithub() {
        const repos = await fetchAndWait(
          `https://api.github.com/orgs/${router.query.org}/repos?per_page=100`,
          { 'Authorization': `token ${githubAccessToken}` }
        )
        setRepos(repos.sort((a, b) => a.name < b.name ? -1 : 1))
        setLoaded(true)
      })()
  
      const userPreferences = JSON.parse(localStorage.getItem(`repoSurf_${router.query.org}`))
      if (userPreferences && userPreferences.repoFilter) {
        const formattedFilterList = userPreferences.repoFilter.split(',').map(repo => repo.replace(/^[ ]+/g, ""))
        setFilteredRepoNames(formattedFilterList)      
      }
    }
  }, [router.query.org])

  useEffect(() => {
    if (router.pathname !== '/' && router.query.org) {
      (async function retrieveOrganizationProfile() {
        const org = await fetchAndWait(`https://api.github.com/orgs/${router.query.org}`)
        setOrganization(org)
      })()
    }
  }, [router.query.org])

  useEffect(() => {
    let repositories = repos.slice()
    filteredRepoNames.forEach(filteredRepo => {
      repositories = repositories.filter(repo => repo.name !== filteredRepo)
    })
    setViewableRepos(repositories)
  }, [repos, filteredRepoNames])

  return (
    router.route === '/'
      ? <Component {...pageProps} />
      : (
        <Layout
          view={selectedView}
          repos={viewableRepos}
          loaded={loaded}
          organization={organization}
        >
          <Component
            {...pageProps}
            githubAccessToken={githubAccessToken}
            supabase={supabase}
            organization={router.query.org}
            repoNames={repos.map(repo => repo.name)}
            onUpdateFilterList={(repos) => setFilteredRepoNames(repos)}
          />
        </Layout>
      )
  )
}

export default MyApp
