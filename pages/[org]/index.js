import { useState, useEffect } from 'react'
import { groupBy } from 'lib/helpers'
import StarHistoryAggregator from 'lib/StarHistoryAggregator'
import StarHistory from '~/components/StarHistory'
import Info from 'icons/Info'
import Loader from 'icons/Loader'
import TimelineChart from 'components/TimelineChart'

const issuesTable = process.env.NEXT_PUBLIC_SUPABASE_ISSUES_TABLE
const starsTable = process.env.NEXT_PUBLIC_SUPABASE_STARS_TABLE

const OrganizationOverview = ({
  loaded,
  supabase,
  organization,
  repoNames,
  starRetrievers,
  githubAccessToken
}) => {
  const [issueCounts, setIssueCounts] = useState([])
  const [aggregatedStarHistory, setAggregatedStarHistory] = useState([])
  const [aggregationLoading, setAggregationLoading] = useState(true)
  const [aggregationLoadedTime, setAggregationLoadedTime] = useState(null)
  const [totalStarCount, setTotalStarCount] = useState(null)
  const [loadingIssueCounts, setLoadingIssueCounts] = useState(false)
  const orgName = organization.login
  const formattedOrgName = organization.name

  useEffect(() => {
    (async function retrieveOrganizationStats() {
      setLoadingIssueCounts(true)
      const { data, error } = await supabase
        .from(issuesTable)
        .select('*')
        .eq('organization', orgName)
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
        const sortedIssueCounts = overviewIssueCounts.sort((a, b) => a.inserted_at - b.inserted_at)
        setIssueCounts(sortedIssueCounts)
      }
      setLoadingIssueCounts(false)
    })()
  }, [organization])

  useEffect(() => {
    // If orgName is not loaded yet, do nothing.
    if (!loaded || !orgName || repoNames.length === 0) {
      return
    }
    const aggregator = new StarHistoryAggregator(supabase, starsTable,
      orgName, githubAccessToken, starRetrievers, repoNames)
    const starHistory = aggregator.aggregatedStarHistory
    setAggregatedStarHistory(starHistory)
    setAggregationLoadedTime(aggregator.aggregationLoadedTime)
    if(aggregator.aggregatedStarHistory.length > 0){
      setTotalStarCount(starHistory[starHistory.length - 1].starNumber)
      setAggregationLoading(false)
    }

    const { subscription } = aggregator.onAggregationFinished((starHistory, aggregationLoadedTime) => {
      setAggregatedStarHistory(starHistory)
      setTotalStarCount(starHistory[starHistory.length - 1].starNumber)
      setAggregationLoadedTime(aggregationLoadedTime)
      setAggregationLoading(false)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [repoNames])

  const renderOrganizationIssuesTimeline = () => {
    if (issueCounts.length > 0) {
      return (
        <TimelineChart
          id="overviewIssuesChart"
          uPlot={uPlot}
          data={issueCounts}
          dateKey="inserted_at"
          valueKey="open_issues"
          xLabel="Open issues"
          showBaselineToggle={true}
        />
      )
    } else {
      return (
        <div className="px-5 sm:px-10 text-gray-400 w-full flex-1 flex flex-col items-center justify-center text-center">
          <Info />
          <span className="mt-5">Issues under {formattedOrgName} are not being tracked at the moment.</span>
        </div>
      )
    }
  }

  return (
    <>
      <div className="pb-5 sm:px-10 sm:pb-10">
        <h1 className="text-white text-2xl">Overview of {formattedOrgName} on Github</h1>
        <p className="mt-2 text-base text-gray-400">Timeline of open issues across all {repoNames.length} repositories</p>
      </div>
      <div className="flex-1 flex flex-col items-start">
        <div className="w-full sm:pr-5">
          {loadingIssueCounts
            ? (
              <div className="py-24 lg:py-32 text-white w-full flex flex-col items-center justify-center">
                <Loader />
                <p className="text-xs mt-3 leading-5 text-center">Retrieving issues from {formattedOrgName}</p>
              </div>
            )
            : <>{renderOrganizationIssuesTimeline()}</>
          }
        </div>
      </div>
      <div className="mt-16">
        <StarHistory
          repoName={'all repos (up to 100) in this organization'}
          lastUpdated={aggregationLoadedTime}
          starHistory={aggregatedStarHistory}
          totalStarCount={totalStarCount}
          loadingStarHistory={aggregationLoading}
          onOpenModal={false}
        />
      </div>
    </>
  )
}

export default OrganizationOverview