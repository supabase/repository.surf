import '../styles/globals.css'
import "tailwindcss/tailwind.css";
import 'react-toastify/dist/ReactToastify.css';

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

import Layout from 'components/Layout'
import { fetchAndWait } from 'lib/fetchWrapper'

const githubAccessToken = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN
const organization = process.env.NEXT_PUBLIC_GITHUB_ORGANIZATION
const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
const issuesTable = process.env.NEXT_PUBLIC_SUPABASE_TABLE_NAME

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
  const [repoNames, setRepoNames] = useState([])
  const [viewableRepos, setViewableRepos] = useState([])
  const [filteredRepoNames, setFilteredRepoNames] = useState([])

  useEffect(() => {
    (async function retrieveGithub() {
      const repos = await fetchAndWait(`https://api.github.com/orgs/${organization}/repos?access_token=${githubAccessToken}`)
      const repoNames = repos.map(repo => repo.name)
      setRepoNames(repoNames.sort())
      setLoaded(true)
    })()

    const filterListRepos = localStorage.getItem(`issueTracker_${organization}`)
    if (filterListRepos) {
      const formattedFilterList = filterListRepos.split(',').map(repo => repo.replace(/^[ ]+/g, ""))
      setFilteredRepoNames(formattedFilterList)      
    }
  }, [])

  useEffect(() => {
    let repositories = repoNames.slice()
    filteredRepoNames.forEach(filteredRepo => {
      repositories = repositories.filter(repo => repo !== filteredRepo)
    })
    setViewableRepos(repositories)
  }, [repoNames, filteredRepoNames])

  return (
    <Layout view={selectedView} repos={viewableRepos} loaded={loaded}>
      <Component
        {...pageProps}
        supabase={supabase}
        issuesTable={issuesTable}
        organization={organization}
        repoNames={repoNames}
        onUpdateFilterList={(repos) => setFilteredRepoNames(repos)}
      />
    </Layout>
  )
}
MyApp.getInitialProps = ({ ctx }) => {
  if (ctx.pathname === '/' && ctx.res) {
    ctx.res.writeHead(302, { Location: `/${organization}` });
    ctx.res.end();
  }
  return { };
}

export default MyApp
