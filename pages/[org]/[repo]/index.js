import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import TimelineChart from '~/components/TimelineChart'
import StatsIndicator from '~/components/StatsIndicator'

const RepositoryStatistics = ({ supabase, organization, issuesTable }) => {

  const router = useRouter()
  const [issueCounts, setIssueCounts] = useState([])

  useEffect(() => {
    (async function retrieveOrganizationStats() {
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
      <div className="pb-5 sm:px-10 sm:pb-10">
        <h1 className="text-white text-2xl">Statistics for {router.query.repo}</h1>
        <p className="mt-2 text-base text-gray-400">This is a timeline of how many open issues {router.query.repo} has on Github over time.</p>
      </div>
      <div className="flex-1 flex flex-col items-start">
        <div className="w-full pb-3 sm:pb-0 sm:pr-5">
          <TimelineChart uPlot={uPlot} issueCounts={issueCounts} />
        </div>
        <div className="sm:px-10 w-full mt-10 flex flex-col">
          <p className="text-white">Daily statistics</p>
          <div className="mt-5 grid grid-cols-12 gap-x-5">
            <div className="col-span-6 sm:col-span-5 xl:col-span-4">
              <p className="text-gray-400">Open issues</p>
              <div id="numbers" className="flex items-center mt-2">
                <p className="text-white text-3xl mr-2">{retrieveLatestOpenIssueCount()}</p>
                <StatsIndicator countDiff={deriveOpenIssueCountComparison()} />
              </div>
            </div>
            <div className="col-span-6 sm:col-span-5 xl:col-span-4">
              <p className="text-gray-400">Total closed issues</p>
              <p className="mt-2 text-white text-3xl">{retrieveLatestCloseIssueCount()}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RepositoryStatistics