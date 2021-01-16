import { useState, useEffect } from 'react'
import StarHistoryAggregator from 'lib/StarHistoryAggregator'
import RepoStarHistoryRetriever from 'lib/RepoStarHistoryRetriever'
import {
  formatOrganizationIssueCount,
  retrieveLatestOpenIssueCount,
  retrieveLatestCloseIssueCount,
  deriveOpenIssueCountComparison,
} from 'lib/helpers'
import { ISSUES_TABLE, STARS_TABLE } from 'lib/constants'
import StarHistory from 'components/StarHistory'
import IssueTracker from 'components/IssueTracker'
import Modal from 'components/Modal'
import IssueTrackerInfoModal from 'components/Modals/IssueTrackerInfoModal'

const OrganizationOverview = ({
  references,
  loaded,
  supabase,
  organization,
  repoNames,
  starRetrievers,
  orgConfig
}) => {
  const [showModal, setShowModal] = useState(false)
  const [allIssueCounts, setAllIssueCounts] = useState([])
  const [selectedIssueCounts, setSelectedIssueCounts] = useState([])
  const [loadingIssueCounts, setLoadingIssueCounts] = useState(false)

  const [aggregatedStarHistory, setAggregatedStarHistory] = useState([])
  const [aggregationLoading, setAggregationLoading] = useState(true)
  const [aggregationLoadedTime, setAggregationLoadedTime] = useState(null)
  const [aggregationCount, setAggregationCount] = useState(0)
  const [totalStarCount, setTotalStarCount] = useState(null)
  const orgName = organization.login

  useEffect(() => {
    (async function retrieveOrganizationStats() {
      setLoadingIssueCounts(true)
      const { data, error } = await supabase
        .from(ISSUES_TABLE)
        .select('*')
        .eq('organization', orgName)
      if (error) {
        console.error(error)
      } else if (data) {
        setAllIssueCounts(data)
        const formattedIssueCounts = formatOrganizationIssueCount(data)
        setSelectedIssueCounts(formattedIssueCounts)
      }
      setLoadingIssueCounts(false)
    })()
  }, [organization])

  useEffect(() => {
    // If orgName is not loaded yet, do nothing.
    if (!loaded || !orgName || repoNames.length === 0) {
      setAggregatedStarHistory([])
      return
    }

    // If we're looking at a single repo, create a
    // starHistoryRetriever instead of a starHistoryAggregator.
    if (repoNames.length === 1) {
      const repoName = repoNames[0]
      const starHistoryKey = `${orgName}/${repoName[0]}`
      let starHistoryRetriever
      if (starHistoryKey in starRetrievers) {
        starHistoryRetriever = starRetrievers[starHistoryKey]
      } else {
        starHistoryRetriever = new RepoStarHistoryRetriever(supabase,
            STARS_TABLE, orgName, repoName, orgConfig.access_token)
        starRetrievers[starHistoryKey] = starHistoryRetriever
      }

      // In case the star history is already retrieved, load it on on this component.
      setAggregatedStarHistory(starHistoryRetriever.starHistory)
      setAggregationLoadedTime(starHistoryRetriever.historyUpdateTime)
      setAggregationLoading(starHistoryRetriever.isLoading)
      setTotalStarCount(starHistoryRetriever.totalStarCount)
      setAggregationCount(starHistoryRetriever.isLoading ? 0 : 1)

      // Then, subscribe to any change in the star history retriever.
      const { subscription } = starHistoryRetriever.onLoaded(
          (starHistory, historyUpdateTime, isLoading, totalStarCount) => {
        setAggregatedStarHistory(starHistory)
        setAggregationLoadedTime(historyUpdateTime)
        setAggregationLoading(isLoading)
        setTotalStarCount(totalStarCount)
        setAggregationCount(starHistoryRetriever.isLoading ? 0 : 1)
      })
      
      return () => {
        subscription.unsubscribe()
        setAggregationLoading(true)
        setAggregationCount(0)
      }
    }

    const aggregator = new StarHistoryAggregator(supabase, STARS_TABLE,
      orgName, orgConfig.access_token, starRetrievers, repoNames)
    const starHistory = aggregator.aggregatedStarHistory
    setAggregatedStarHistory(starHistory)
    setAggregationLoadedTime(aggregator.aggregationLoadedTime)
    setAggregationCount(aggregator.aggregationCount)
    // If aggregationLoadedTime is not null, then that means that
    // the aggregation has finished.
    if(aggregator.aggregationLoadedTime !== null && starHistory.length > 0){
      setTotalStarCount(starHistory[starHistory.length - 1].starNumber)
      setAggregationLoading(false)
    }

    const { subscription } = aggregator.onAggregationUpdated(
        (starHistory, aggregationLoadedTime, aggregationCount) => {
      setAggregatedStarHistory(starHistory)
      setAggregationLoadedTime(aggregationLoadedTime)
      setAggregationCount(aggregationCount)
      if(aggregationLoadedTime !== null){
        setTotalStarCount(starHistory[starHistory.length - 1].starNumber)
        setAggregationLoading(false)
      }
    })
    return () => {
      subscription.unsubscribe()
      setAggregationLoading(true)
      setAggregationCount(0)
    }
  }, [repoNames, orgConfig])

  useEffect(() => {
    if (allIssueCounts.length > 0) {
      const filteredRepoIssueCounts = allIssueCounts.filter(issueCountEvent => {
        if (repoNames.indexOf(issueCountEvent.repository) >= 0) return issueCountEvent
      })
      const formattedIssueCounts = formatOrganizationIssueCount(filteredRepoIssueCounts)
      setSelectedIssueCounts(formattedIssueCounts)
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
      <div className="container mx-auto">
        <StarHistory
          starHistoryRef={references.stars}
          repoName={`the selected ${repoNames.length} repositories (up to 100)`}
          lastUpdated={aggregationLoadedTime}
          starHistory={aggregatedStarHistory}
          totalStarCount={totalStarCount}
          loadingStarHistory={aggregationLoading}
          loadingMessage={`Preparing star history... ${aggregationCount} out of ${repoNames.length} repos loaded.`}
          enableSharing={false}
          noStarHistory={repoNames.length > 0 && aggregatedStarHistory.length === 0}
          noReposSelected={repoNames.length === 0}
        />
        <IssueTracker
          issuesRef={references.issues}
          repoName={`the selected ${repoNames.length} repositories (up to 100)`}
          issueCounts={selectedIssueCounts}
          loadingIssueCounts={loadingIssueCounts}
          latestOpenIssueCount={retrieveLatestOpenIssueCount(selectedIssueCounts)}
          openIssueCountComparison={deriveOpenIssueCountComparison(selectedIssueCounts)}
          latestClosedIssueCount={retrieveLatestCloseIssueCount(selectedIssueCounts)}
          enableSharing={false}
          onOpenInfo={() => setShowModal(true)}
          noIssueCounts={repoNames.length > 0 && selectedIssueCounts.length === 0}
        />
      </div>
    </>
  )
}

export default OrganizationOverview