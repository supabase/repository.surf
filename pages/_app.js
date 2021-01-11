import '../styles/globals.css'
import "tailwindcss/tailwind.css";
import 'react-toastify/dist/ReactToastify.css';

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

import Layout from 'components/Layout'
import Meta from 'components/Meta'
import { fetchAndWait } from 'lib/fetchWrapper'
import { retrieveOrgAccessToken } from 'lib/auth'

const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY

function MyApp({ Component, pageProps, router }) {

  const supabase = createClient(supabaseURL, supabasePublicKey)

  const [loaded, setLoaded] = useState(false)
  const [organization, setOrganization] = useState({})
  const [orgAccessToken, setOrgAccessToken] = useState('')

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

        const accessToken = await retrieveOrgAccessToken(org.id)
        setOrgAccessToken(accessToken)

        const repos = await fetchAndWait(
          `https://api.github.com/orgs/${router.query.org}/repos?per_page=100`,
          { 'Authorization': `token ${accessToken}` }
        )
        setRepos(repos)
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
          toggleRepo={toggleRepo}
          toggleAllRepos={toggleAllRepos}
        > 
          <Component
            {...pageProps}
            loaded={loaded}
            references={references}
            supabase={supabase}
            organization={organization}
            orgAccessToken={orgAccessToken}
            repoNames={selectedRepos}
            starRetrievers={starRetrievers}
            setStarRetrievers={setStarRetrievers}
          />
        </Layout>
      )
  )
}

export default MyApp
