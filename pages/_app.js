import '../styles/globals.css'
import "tailwindcss/tailwind.css";
import 'react-toastify/dist/ReactToastify.css';

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

import Layout from 'components/Layout'
import Meta from 'components/Meta'
import { fetchAndWait } from 'lib/fetchWrapper'

const githubAccessToken = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN
const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY

function MyApp({ Component, pageProps, router }) {

  const supabase = createClient(supabaseURL, supabasePublicKey)

  const [loaded, setLoaded] = useState(false)
  const [organization, setOrganization] = useState({})

  // Stores all the repositories of the organization
  const [repos, setRepos] = useState([])
  // Stores all the repositories whose names are not included in filteredRepoNames
  const [viewableRepos, setViewableRepos] = useState([])
  // Stores all the repositories selected to show cumulative data in the chart
  const [selectedRepos, setSelectedRepos] = useState([])
  const [filteredRepoNames, setFilteredRepoNames] = useState([])

  // An object of star history retrievers.
  // Example: {'supabase/supabase': RepoStarHistoryRetriever1, 'supabase/realtime': RepoStarHistoryRetriever2}
  const [starRetrievers, setStarRetrievers] = useState({})

  useEffect(() => {
    if (router.pathname !== '/' && router.query.org) {
      (async function retrieveOrganizationProfile() {
        setLoaded(false)
        const org = await fetchAndWait(`https://api.github.com/orgs/${router.query.org}`)
        setOrganization(org)

        const repos = await fetchAndWait(
          `https://api.github.com/orgs/${router.query.org}/repos?per_page=100`,
          { 'Authorization': `token ${githubAccessToken}` }
        )
        setRepos(repos.sort((a, b) => a.stargazers_count > b.stargazers_count ? -1 : 1))
        setLoaded(true)
      })()

      const userPreferences = JSON.parse(localStorage.getItem(`repoSurf_${router.query.org}`))
      if (userPreferences && userPreferences.repoFilter) {
        const formattedFilterList = userPreferences.repoFilter?.split(',').map(repo => repo.replace(/^[ ]+/g, "")) || []
        setFilteredRepoNames(formattedFilterList)      
      }
    }
  }, [router.query.org])

  useEffect(() => {
    let repositories = repos.slice()
    filteredRepoNames.forEach(filteredRepo => {
      repositories = repositories.filter(repo => repo.name !== filteredRepo)
    })
    setViewableRepos(repositories)
    setSelectedRepos(repositories.map(repo => repo.name))
  }, [repos, filteredRepoNames])

  const toggleRepo = (repoName) => {
    let updatedSelectedRepos = selectedRepos.slice()
    if (selectedRepos.indexOf(repoName) !== -1) {
      updatedSelectedRepos = updatedSelectedRepos.filter(repo => repo !== repoName)
    } else {
      updatedSelectedRepos.push(repoName)
    }
    setSelectedRepos(updatedSelectedRepos)
  }

  const toggleAllRepos = () => {
    if (selectedRepos.length === repos.length) {
      setSelectedRepos([])
    } else {
      setSelectedRepos(repos.map(repo => repo.name))
    }
  }

  return (
    router.route === '/' || router.route.indexOf('embed') > 0
      ? (
        <>
          <Meta />
          <Component
            {...pageProps}
            supabase={supabase} 
            organization={router.query.org}
          />
        </>
      )
      : (
        <Layout
          repos={viewableRepos}
          selectedRepos={selectedRepos}
          loaded={loaded}
          organization={organization}
          toggleRepo={toggleRepo}
          toggleAllRepos={toggleAllRepos}
        > 
          <Component
            {...pageProps}
            loaded={loaded}
            githubAccessToken={githubAccessToken}
            supabase={supabase}
            organization={organization}
            repoNames={selectedRepos}
            onUpdateFilterList={(repos) => setFilteredRepoNames(repos)}
            starRetrievers={starRetrievers}
            setStarRetrievers={setStarRetrievers}
          />
        </Layout>
      )
  )
}

export default MyApp
