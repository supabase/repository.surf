import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { renewStarHistory } from 'lib/helpers'
import IssueTracker from '~/components/IssueTracker'
import StarHistory from '~/components/StarHistory'
import ExternalLink from '~/icons/ExternalLink'

const issuesTable = process.env.NEXT_PUBLIC_SUPABASE_ISSUES_TABLE
const starsTable = process.env.NEXT_PUBLIC_SUPABASE_STARS_TABLE

const RepositoryStatistics = ({ githubAccessToken, supabase, organization }) => {

  const router = useRouter()
  const repoName = router.query.repo

  const [issueCounts, setIssueCounts] = useState([])
  const [loadingIssueCounts, setLoadingIssueCounts] = useState(false)

  const [lastUpdated, setLastUpdated] = useState(null)
  const [starHistory, setStarHistory] = useState([])
  const [loadingStarHistory, setLoadingStarHistory] = useState(false)

  useEffect(() => {
    (async function retrieveRepositoryIssueCounts() {
      setLoadingIssueCounts(true)
      const { data, error } = await supabase
        .from(issuesTable)
        .select('*')
        .eq('organization', organization)
        .eq('repository', repoName)
      if (error) {
        console.error(error)
      } else if (data) {
        setIssueCounts(data)
      }
      setLoadingIssueCounts(false)
    })()
  }, [repoName])

  useEffect(() => {
    (async function retrieveRepositoryStarHistory() {
      setLoadingStarHistory(true)

      const { data, error } = await supabase
        .from(starsTable)
        .select('*')
        .eq('organization', organization)
        .eq('repository', repoName)
      if (error) {
        console.log(error)
      } else if (data) {
        if (data.length == 0) {
          const starHistory = await renewStarHistory(supabase, starsTable, organization, repoName, githubAccessToken)
          setStarHistory(starHistory)
        } else {
          // Check if its valid within 12 hours
          const historyUpdateTime = new Date(data[0].updated_at).getTime()
          const currentTime = new Date().getTime()
          if (currentTime - historyUpdateTime <= (12*60*60*1000)) {
            console.log(`Star history of ${repoName} still valid`)
            setLastUpdated(historyUpdateTime)
            setStarHistory(data[0].star_history)
          } else {
            console.log(`Star history of ${repoName} invalid, refreshing`)
            const starHistory = await renewStarHistory(supabase, starsTable, organization, repoName, githubAccessToken, true)
            setLastUpdated(currentTime)
            setStarHistory(starHistory)
          }

        }
      }
      setLoadingStarHistory(false)
    })()
  }, [repoName])

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

  return (
    <>
      {!router.query.embed
        ? (
          <>
            <div className="sm:mx-10 mb-12 sm:mb-20">
              <p className="text-gray-400 text-xs">REPOSITORY</p>
              <a
                href={`https://github.com/${organization}/${repoName}`}
                target="_blank"
                className="text-white text-3xl mt-1 group flex items-center"
              >
                <h1>{repoName.toString()}</h1>
                <div className="transition ml-3 opacity-0 group-hover:opacity-100">
                  <ExternalLink />
                </div>
              </a>
            </div>
            <StarHistory
              repoName={repoName}
              lastUpdated={lastUpdated}
              starHistory={starHistory}
              loadingStarHistory={loadingStarHistory}
            />
            <IssueTracker
              repoName={repoName}
              issueCounts={issueCounts}
              loadingIssueCounts={loadingIssueCounts}
              latestOpenIssueCount={retrieveLatestOpenIssueCount()}
              openIssueCountComparison={deriveOpenIssueCountComparison()}
              latestClosedIssueCount={retrieveLatestCloseIssueCount()}
            />
          </>
        )
        : (
          <div className="p-10">
            {!router.query.type && (
              <div className="h-screen w-screen flex flex-col items-center justify-center">
                <p className="mb-2 text-white">Specify what type of charts you would like to embed as such:</p>
                <p className="text-white mb-5">{window.location.href}&type=[chartType]</p>
                <p className="text-gray-400">
                  Available chart types:
                  <span className="font-mono ml-2 border-r mr-2 pr-2">stars</span>
                  <span className="font-mono">issues</span>
                </p>
              </div>
            )}
            {router.query.type === 'stars' && (
              <StarHistory
                embed={true}
                repoName={repoName}
                lastUpdated={lastUpdated}
                starHistory={starHistory}
                loadingStarHistory={loadingStarHistory}
              />
            )}
            {router.query.type === 'issues' && (
              <IssueTracker
                embed={true}
                repoName={repoName}
                issueCounts={issueCounts}
                loadingIssueCounts={loadingIssueCounts}
                latestOpenIssueCount={retrieveLatestOpenIssueCount()}
                openIssueCountComparison={deriveOpenIssueCountComparison()}
                latestClosedIssueCount={retrieveLatestCloseIssueCount()}
              />
            )}
          </div>
        )
      }
    </>
  )
}

export default RepositoryStatistics