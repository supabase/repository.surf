import '../styles/globals.css'
import "tailwindcss/tailwind.css";
import 'react-toastify/dist/ReactToastify.css';

import { useEffect, useState, useRef } from 'react'

import Layout from 'components/Layout'
import Meta from 'components/Meta'
import { fetchAndWait } from 'lib/fetchWrapper'
import { supabase, retrieveOrganizationConfig } from 'lib/auth'

function MyApp({ Component, pageProps, router }) {

  const [loaded, setLoaded] = useState(false)
  const [organization, setOrganization] = useState({})
  const [orgConfig, setOrgConfig] = useState('')

  // Stores all the repositories of the organization
  const [repos, setRepos] = useState([])
  // Stores all the repositories selected in the side bar to show cumulative data in the chart
  const [selectedRepos, setSelectedRepos] = useState([])

  // An object of star history retrievers.
  // Example: {'supabase/supabase': RepoStarHistoryRetriever1, 'supabase/realtime': RepoStarHistoryRetriever2}
  const [starRetrievers, setStarRetrievers] = useState({})

  const references = {
    stars: useRef(null),
    issues: useRef(null),
  }

  useEffect(() => {
    if (router.pathname !== '/' && router.query.org) {
      (async function retrieveOrganizationProfile() {
        setLoaded(false)
        const org = await fetchAndWait(`https://api.github.com/orgs/${router.query.org}`)
        setOrganization(org)

        const orgConfig = await retrieveOrganizationConfig(org.id)
        setOrgConfig(orgConfig)

        const repos = await fetchAndWait(
          `https://api.github.com/orgs/${router.query.org}/repos?per_page=100`,
          { 'Authorization': `token ${orgConfig.access_token}` }
        )

        if (!orgConfig.show_private_repos) {
          setRepos(repos.filter(repo => repo.private === false))
        } else {
          setRepos(repos)
        }
        setLoaded(true)
      })()
    }
  }, [router.query.org])

  useEffect(() => {
    setSelectedRepos(repos.map(repo => repo.name))
  }, [repos])

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
          references={references}
          repos={repos}
          supabase={supabase}
          selectedRepos={selectedRepos}
          loaded={loaded}
          organization={organization}
          orgConfig={orgConfig}
          toggleRepo={toggleRepo}
          toggleAllRepos={toggleAllRepos}
        > 
          <Component
            {...pageProps}
            loaded={loaded}
            references={references}
            supabase={supabase}
            organization={organization}
            orgConfig={orgConfig}
            repoNames={selectedRepos}
            starRetrievers={starRetrievers}
            setStarRetrievers={setStarRetrievers}
          />
        </Layout>
      )
  )
}

export default MyApp
