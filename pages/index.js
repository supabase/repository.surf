import Head from 'next/head'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

import { fetchAndWait } from 'lib/fetchWrapper'
import { groupBy, formatIssueCounts } from 'lib/helpers'

import Sidebar from 'components/Sidebar'
import Overview from 'components/Overview'
import IssueTracker from 'components/IssueTracker'

export default function Home() {

  const organization = process.env.NEXT_PUBLIC_GITHUB_ORGANIZATION
  const organizationLogo = process.env.NEXT_PUBLIC_ORGANIZATION_LOGO
  const githubAccessToken = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN
  const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
  const issuesTable = process.env.NEXT_PUBLIC_SUPABASE_TABLE_NAME

  const supabase = createClient(supabaseURL, supabasePublicKey)
  const organizationName = organization.charAt(0).toUpperCase() + organization.slice(1);

  const [repoNames, setRepoNames] = useState([])
  const [issueCounts, setIssueCounts] = useState([])
  const [selectedView, setSelectedView] = useState('Overview')
  const [uPlotLoaded, setUPlotLoaded] = useState(false)

  useEffect(() => {
    (async function retrieveGithub() {
      const repos = await fetchAndWait(`https://api.github.com/orgs/${organization}/repos?access_token=${githubAccessToken}`)
      const repoNames = repos.map(repo => repo.name)
      setRepoNames(repoNames.sort())
      await onSelectOverview()
    })()

    if (uPlot) setUPlotLoaded(true)

    const subscription = supabase
      .from(issuesTable)
      .on('*', payload => {
        if (payload.new.repository === selectedView) {
          retrieveRepoIssueCounts(selectedView)
        }
      })
      .subscribe()
    
    return () => {
      supabase.removeSubscription(subscription)
    }
  }, [])

  const retrieveRepoIssueCounts = async(repo) => {
    if (selectedView !== repo) {
      const { data, error } = await supabase
        .from(issuesTable)
        .select('*')
        .eq('organization', organization)
        .eq('repository', repo)
      if (error) {
        console.error(error)
      } else if (data) {
        setIssueCounts(data)
      }
      setSelectedView(repo)
    }
  }

  const deriveOpenIssueCountComparison = () => {
    if (issueCounts.length > 0) {
      const formattedIssueCounts = issueCounts.map(repo => {
        return {
          open_issues: repo.open_issues,
          inserted_at: (Math.floor(new Date(repo.inserted_at) / 1000))
        }
      })

      const latestCount = formattedIssueCounts[formattedIssueCounts.length - 1]
      const previousDayTimestamp = latestCount.inserted_at - 86400
      const previousDayIssueCounts = formattedIssueCounts.filter(repo => {
        if (repo.inserted_at <= previousDayTimestamp) return repo
      })

      if (previousDayIssueCounts.length > 0) {
        const previousDayCount = previousDayIssueCounts[previousDayIssueCounts.length - 1]
        return (latestCount.open_issues - previousDayCount.open_issues)
      } else {
        return 0
      }
    } else {
      return 0
    }
  }

  const retrieveLatestOpenIssueCount = () => {
    if (issueCounts.length > 0) {
      const latestCount = issueCounts[issueCounts.length - 1]
      return latestCount.open_issues
    } else {
      return 0
    }
  }

  const retrieveLatestCloseIssueCount = () => {
    if (issueCounts.length > 0) {
      const latestCount = issueCounts[issueCounts.length - 1]
      return latestCount.closed_issues
    } else {
      return 0
    }
  }

  const onSelectOverview = async() => {
    const { data, error } = await supabase
      .from(issuesTable)
      .select('*')
      .eq('organization', organization)
    if (error) {
      console.error(error)
    } else if (data) {
      const overviewIssueCounts = []
      const formattedData = data.map(row => {
        return { ...row, inserted_at: Math.floor(new Date(row.inserted_at))}
      })
      const groupedData = groupBy(formattedData, row => row.inserted_at)
      groupedData.forEach(group => {
        const openIssueCounts = group.map(row => row.open_issues)
        overviewIssueCounts.push({
          'open_issues': openIssueCounts.reduce((a, b) => a + b, 0),
          'inserted_at': group[0].inserted_at
        })
      })
      setIssueCounts(overviewIssueCounts)
    }
    setSelectedView('Overview')
  }

  return (
    <div className="flex">
      <Head>
        <title>{organizationName} | Issue Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Sidebar
        logoUrl={organizationLogo}
        repositories={repoNames}
        selectedView={selectedView}
        onSelectOverview={() => onSelectOverview()}
        onSelectRepo={(repo) => retrieveRepoIssueCounts(repo)}
      />

      {uPlotLoaded && (
        <main className="h-screen flex-1 overflow-y-auto focus:outline-none flex flex-col bg-gray-700 px-10 py-24">
          {selectedView === 'Overview' && (
            <Overview
              uPlot={uPlot}
              organizationName={organizationName}
              repoNames={repoNames}
              issueCounts={issueCounts}
            />
          )}
          {selectedView !== 'Overview' && (
            <IssueTracker
              uPlot={uPlot}
              selectedView={selectedView}
              issueCounts={issueCounts}
              latestOpenIssueCount={retrieveLatestOpenIssueCount()}
              latestClosedIssueCount={retrieveLatestCloseIssueCount()}
              openIssueCountComparison={deriveOpenIssueCountComparison()}
            />
          )}
        </main>
      )}
    </div>
  )
}