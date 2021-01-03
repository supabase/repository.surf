import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import RepoStarHistoryRetriever from 'lib/RepoStarHistoryRetriever'
import {
  generateIframeCode,
  retrieveLatestOpenIssueCount,
  retrieveLatestCloseIssueCount,
  deriveOpenIssueCountComparison,
} from 'lib/helpers'
import IssueTracker from 'components/IssueTracker'
import StarHistory from 'components/StarHistory'
import Modal from 'components/Modal'
import ExternalLink from 'icons/ExternalLink'
import Clipboard from 'icons/Clipboard'
import Check from 'icons/Check'

const issuesTable = process.env.NEXT_PUBLIC_SUPABASE_ISSUES_TABLE
const starsTable = process.env.NEXT_PUBLIC_SUPABASE_STARS_TABLE

const RepositoryStatistics = ({ githubAccessToken, supabase, starRetrievers, setStarRetrievers }) => {

  const router = useRouter()
  const orgName = router.query.org
  const repoName = router.query.repo

  const [showModal, setShowModal] = useState(false)
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

  const toggleEmbedModal = (chartType) => {
    setCodeCopied(false)
    setIframeChartType(chartType)
    setShowModal(true)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(textAreaRef.current.value)
    setCodeCopied(true)
  }

  return (
    <>
      <Modal
        showModal={showModal}
        onCloseModal={() => setShowModal(false)}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <p className="text-white">Embed this chart</p>
            <div
              onClick={() => copyCode()}
              className={`
                rounded-md border border-gray-400 p-2 transition
                ${!codeCopied && 'cursor-pointer hover:bg-gray-500'}
              `}
            >
              {codeCopied ? <Check size={16} className="stroke-current text-brand-700" /> : <Clipboard size={16} />}
            </div>
          </div>
          <textarea
            ref={textAreaRef}
            value={generateIframeCode(orgName, repoName, iframeChartType)}
            rows={4}
            readOnly
            className="w-full bg-gray-500 rounded-md p-3 font-mono text-sm text-white"
            style={{ resize: 'none' }}
          />
        </div>
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
        onOpenModal={(chartType) => toggleEmbedModal(chartType)}
      />
      <IssueTracker
        repoName={repoName}
        issueCounts={issueCounts}
        loadingIssueCounts={loadingIssueCounts}
        latestOpenIssueCount={retrieveLatestOpenIssueCount(issueCounts)}
        openIssueCountComparison={deriveOpenIssueCountComparison(issueCounts)}
        latestClosedIssueCount={retrieveLatestCloseIssueCount(issueCounts)}
        onOpenModal={(chartType) => toggleEmbedModal(chartType)}
      />
    </>
  )
}

export default RepositoryStatistics