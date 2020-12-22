import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { renewStarHistory } from 'lib/helpers'
import IssueTracker from '~/components/IssueTracker'
import StarHistory from '~/components/StarHistory'

const issuesTable = process.env.NEXT_PUBLIC_SUPABASE_ISSUES_TABLE
const starsTable = process.env.NEXT_PUBLIC_SUPABASE_STARS_TABLE

const RepositoryStatistics = ({ githubAccessToken, supabase, organization }) => {

  const router = useRouter()

  const [issueCounts, setIssueCounts] = useState([])
  const [loadingIssueCounts, setLoadingIssueCounts] = useState(false)

  const [starHistory, setStarHistory] = useState([])
  const [loadingStarHistory, setLoadingStarHistory] = useState(false)

  useEffect(() => {
    (async function retrieveRepositoryIssueCounts() {
      setLoadingIssueCounts(true)
      const { data, error } = await supabase
        .from(issuesTable)
        .select('*')
        .eq('organization', organization)
        .eq('repository', router.query.repo)
      if (error) {
        console.error(error)
      } else if (data) {
        setIssueCounts(data)
      }
      setLoadingIssueCounts(false)
    })()
  }, [router.query.repo])

  useEffect(() => {
    (async function retrieveRepositoryStarHistory() {
      setLoadingStarHistory(true)

      const { data, error } = await supabase
        .from(starsTable)
        .select('*')
        .eq('organization', organization)
        .eq('repository', router.query.repo)
      if (error) {
        console.log(error)
      } else if (data) {
        if (data.length == 0) {
          const starHistory = await renewStarHistory(supabase, starsTable, organization, router.query.repo, githubAccessToken)
          setStarHistory(starHistory)
        } else {
          // Check if its valid within 12 hours
          const historyUpdateTime = new Date(data[0].updated_at).getTime()
          const currentTime = new Date().getTime()
          if (currentTime - historyUpdateTime <= (12*60*60*1000)) {
            setStarHistory(data[0].star_history)
          } else {
            const starHistory = await renewStarHistory(supabase, starsTable, organization, router.query.repo, githubAccessToken)
            setStarHistory(starHistory)
          }

        }
      }
      setLoadingStarHistory(false)
    })()
  }, [router.query.repo])

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
      <StarHistory
        repoName={router.query.repo}
        starHistory={starHistory}
        loadingStarHistory={loadingStarHistory}
      />
      <IssueTracker
        repoName={router.query.repo}
        issueCounts={issueCounts}
        loadingIssueCounts={loadingIssueCounts}
        latestOpenIssueCount={retrieveLatestOpenIssueCount()}
        openIssueCountComparison={deriveOpenIssueCountComparison()}
        latestClosedIssueCount={retrieveLatestCloseIssueCount()}
      />
    </>
  )
}

export default RepositoryStatistics