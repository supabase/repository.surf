import '../styles/globals.css'
import "tailwindcss/tailwind.css";
import 'react-toastify/dist/ReactToastify.css';

import { useEffect, useState, useRef } from 'react'

import Layout from 'components/Layout'
import Meta from 'components/Meta'
import { fetchAndWait } from 'lib/fetchWrapper'
import { supabase } from 'lib/auth'
import { USERS_TABLE } from 'lib/constants'

function MyApp({ Component, pageProps, router }) {

  const [loaded, setLoaded] = useState(false)
  const [userProfile, setUserProfile] = useState(null)

  const [organization, setOrganization] = useState({})
  const [orgConfig, setOrgConfig] = useState('')

  const [repos, setRepos] = useState([])
  const [selectedRepos, setSelectedRepos] = useState([])

  // An object of star history retrievers.
  // Example: {'supabase/supabase': RepoStarHistoryRetriever1, 'supabase/realtime': RepoStarHistoryRetriever2}
  const [starRetrievers, setStarRetrievers] = useState({})

  const references = {
    stars: useRef(null),
    issues: useRef(null),
  }

  supabase.auth.onAuthStateChange(async(event, session) => {
    if (event === 'SIGNED_IN') {
      setUserProfile(session.user.user_metadata)
      const { data: user, error } = await supabase
        .from(USERS_TABLE)
        .select('*')
        .eq('id', session.user.id)
  
      if (error) {
        console.error(error)
      } else if (user.length === 0) {
        await supabase
          .from(USERS_TABLE)
          .insert([
            {
              id: session.user.id,
              name: session.user.user_metadata.full_name,
              email: session.user.email
            }
          ])
      }
    }
  })

  useEffect(() => {
    if (router.pathname !== '/' && router.query.org) {
      (async function retrieveOrganizationProfile() {
        setLoaded(false)
        const org = await fetchAndWait(`https://api.github.com/orgs/${router.query.org}`)
        setOrganization(org)

        const orgConfig = await fetchAndWait(`/api/organizations?id=${org.id}`)
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

  useEffect(() => {
    const user = supabase.auth.user()
    if (user) setUserProfile(user.user_metadata)
  })

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
            userProfile={userProfile}
            supabase={supabase} 
            organization={router.query.org}
          />
        </>
      )
      : (
        <Layout
          references={references}
          repos={repos}
          selectedRepos={selectedRepos}
          loaded={loaded}
          organization={organization}
          orgConfig={orgConfig}
          userProfile={userProfile}
          toggleRepo={toggleRepo}
          toggleAllRepos={toggleAllRepos}
        > 
          <Component
            {...pageProps}
            loaded={loaded}
            userProfile={userProfile}
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
