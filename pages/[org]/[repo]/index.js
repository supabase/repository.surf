import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import RepoStarHistoryRetriever from 'lib/RepoStarHistoryRetriever'
import {
  retrieveLatestOpenIssueCount,
  retrieveLatestCloseIssueCount,
  deriveOpenIssueCountComparison,
} from 'lib/helpers'
import IssueTracker from 'components/IssueTracker'
import StarHistory from 'components/StarHistory'
import Modal from 'components/Modal'
import ChartShareModal from 'components/Modals/ChartShareModal'
import IssueTrackerInfoModal from 'components/Modals/IssueTrackerInfoModal'
import ExternalLink from 'icons/ExternalLink'

const issuesTable = process.env.NEXT_PUBLIC_SUPABASE_ISSUES_TABLE
const starsTable = process.env.NEXT_PUBLIC_SUPABASE_STARS_TABLE

const RepositoryStatistics = ({
  githubAccessToken,
  organization,
  supabase,
  starRetrievers,
  setStarRetrievers
}) => {

  const router = useRouter()
  const orgName = router.query.org
  const repoName = router.query.repo

  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [iframeChartType, setIframeChartType] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  const textAreaRef = useRef(null)

  const [issueCounts, setIssueCounts] = useState([])
  const [loadingIssueCounts, setLoadingIssueCounts] = useState(false)

  const [lastUpdated, setLastUpdated] = useState(null)
  const [starHistory, setStarHistory] = useState([])
  const [loadingStarHistory, setLoadingStarHistory] = useState(false)
  const [totalStarCount, setTotalStarCount] = useState(null)

  useEffect(() => {
    (async function retrieveRepositoryIssueCounts() {
      setLoadingIssueCounts(true)
      const { data, error } = await supabase
        .from(issuesTable)
        .select('*')
        .eq('organization', orgName)
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
    // First, check if a corresponding star history retriever exists.
    // If not, create a new one.
    const starHistoryKey = `${orgName}/${repoName}`
    let starHistoryRetriever
    if (starHistoryKey in starRetrievers) {
      starHistoryRetriever = starRetrievers[starHistoryKey]
    } else {
      starHistoryRetriever = new RepoStarHistoryRetriever(supabase, starsTable, orgName, repoName, githubAccessToken)
      const newRetrievers = Object.assign({}, starRetrievers)
      newRetrievers[starHistoryKey] = starHistoryRetriever
      setStarRetrievers(newRetrievers)
    }

    // In case the star history is already retrieved, load it on on this component.
    setStarHistory(starHistoryRetriever.starHistory)
    setLastUpdated(starHistoryRetriever.historyUpdateTime)
    setLoadingStarHistory(starHistoryRetriever.isLoading)
    setTotalStarCount(starHistoryRetriever.totalStarCount)

    // Then, subscribe to any change in the star history retriever.
    const { subscription } = starHistoryRetriever.onLoaded(
        (starHistory, historyUpdateTime, isLoading, totalStarCount) => {
      setStarHistory(starHistory)
      setLastUpdated(historyUpdateTime)
      setLoadingStarHistory(isLoading)
      setTotalStarCount(totalStarCount)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [repoName])

  const toggleShareModal = (chartType) => {
    setCodeCopied(false)
    setModalType('share')
    setIframeChartType(chartType)
    setShowModal(true)
  }

  const toggleInfoModal = () => {
    setModalType('info')
    setShowModal(true)
  }

  return (
    <>
      <Modal
        showModal={showModal}
        onCloseModal={() => setShowModal(false)}
        className={`${modalType === 'info' ? 'sm:max-w-xl' : 'sm:max-w-md'}`}
      >
        {modalType === 'share' && (
          <ChartShareModal
            orgName={orgName}
            repoName={repoName}
            iframeChartType={iframeChartType}
          />
        )}
        {modalType === 'info' && <IssueTrackerInfoModal orgName={organization.name} />}
      </Modal>

      <div className="sm:mx-10 mb-12 sm:mb-20">
        <p className="text-gray-400 text-xs">REPOSITORY</p>
        <a
          href={`https://github.com/${orgName}/${repoName}`}
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
        totalStarCount={totalStarCount}
        onOpenShare={(chartType) => toggleShareModal(chartType)}
      />
      <IssueTracker
        repoName={repoName}
        issueCounts={issueCounts}
        loadingIssueCounts={loadingIssueCounts}
        latestOpenIssueCount={retrieveLatestOpenIssueCount(issueCounts)}
        openIssueCountComparison={deriveOpenIssueCountComparison(issueCounts)}
        latestClosedIssueCount={retrieveLatestCloseIssueCount(issueCounts)}
        onOpenShare={(chartType) => toggleShareModal(chartType)}
        onOpenInfo={() => toggleInfoModal()}
      />
    </>
  )
}

export default RepositoryStatistics