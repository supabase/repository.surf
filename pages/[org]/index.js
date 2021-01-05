import { useState, useEffect } from 'react'
import { groupBy } from 'lib/helpers'
import StarHistoryAggregator from 'lib/StarHistoryAggregator'
import {
  retrieveLatestOpenIssueCount,
  retrieveLatestCloseIssueCount,
  deriveOpenIssueCountComparison,
} from 'lib/helpers'
import StarHistory from 'components/StarHistory'
import IssueTracker from 'components/IssueTracker'
import Modal from 'components/Modal'
import IssueTrackerInfoModal from 'components/Modals/IssueTrackerInfoModal'

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
  const [showModal, setShowModal] = useState(false)
  const [issueCounts, setIssueCounts] = useState([])
  const [aggregatedStarHistory, setAggregatedStarHistory] = useState([])
  const [aggregationLoading, setAggregationLoading] = useState(true)
  const [aggregationLoadedTime, setAggregationLoadedTime] = useState(null)
  const [aggregationCount, setAggregationCount] = useState(0)
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
          const closedIssueCounts = group.map(row => row.closed_issues)
          overviewIssueCounts.push({
            'open_issues': openIssueCounts.reduce((a, b) => a + b, 0),
            'closed_issues': closedIssueCounts.reduce((a, b) => a + b, 0),
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
    setAggregationCount(aggregator.aggregationCount)
    // If aggregationLoadedTime is not null, then that means that
    // the aggregation has finished.
    if(aggregator.aggregationLoadedTime){
      setTotalStarCount(starHistory[starHistory.length - 1].starNumber)
      setAggregationLoading(false)
    }

    const { subscription } = aggregator.onAggregationUpdated(
        (starHistory, aggregationLoadedTime, aggregationCount) => {
      setAggregatedStarHistory(starHistory)
      setAggregationLoadedTime(aggregationLoadedTime)
      setAggregationCount(aggregationCount)
      if(aggregator.aggregationLoadedTime){
        setTotalStarCount(starHistory[starHistory.length - 1].starNumber)
        setAggregationLoading(false)
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [repoNames])

  return (
    <>
      <Modal
        showModal={showModal}
        onCloseModal={() => setShowModal(false)}
        className="sm:max-w-xl"
      >
        <IssueTrackerInfoModal orgName={organization.name} />
      </Modal>
      <StarHistory
        repoName="all repositories (up to 100) in this organization"
        lastUpdated={aggregationLoadedTime}
        starHistory={aggregatedStarHistory}
        totalStarCount={totalStarCount}
        loadingStarHistory={aggregationLoading}
        loadingMessage={`Preparing star history... ${aggregationCount} out of ${repoNames.length} repos loaded.`}
        enableSharing={false}
      />

      <IssueTracker
        header={`Overview of ${formattedOrgName}'s issues`}
        repoName="all repositories (up to 100) in this organization"
        issueCounts={issueCounts}
        loadingIssueCounts={loadingIssueCounts}
        latestOpenIssueCount={retrieveLatestOpenIssueCount(issueCounts)}
        openIssueCountComparison={deriveOpenIssueCountComparison(issueCounts)}
        latestClosedIssueCount={retrieveLatestCloseIssueCount(issueCounts)}
        enableSharing={false}
        onOpenInfo={() => setShowModal(true)}
      />
    </>
  )
}

export default OrganizationOverview