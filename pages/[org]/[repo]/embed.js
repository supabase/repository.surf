import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getRepositoryStarHistory } from 'lib/helpers'
import IssueTracker from 'components/IssueTracker'
import StarHistory from 'components/StarHistory'

const issuesTable = process.env.NEXT_PUBLIC_SUPABASE_ISSUES_TABLE
const starsTable = process.env.NEXT_PUBLIC_SUPABASE_STARS_TABLE

const EmbedRepositoryStatistics = ({ githubAccessToken, supabase, organization }) => {

  const router = useRouter()
  const repoName = router.query.repo
  const chartType = router.query.chart

  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (chartType === 'issues') {
      (async function retrieveRepositoryIssueCounts() {
        const { data, error } = await supabase
          .from(issuesTable)
          .select('*')
          .eq('organization', organization)
          .eq('repository', repoName)
        if (error) {
          console.error(error)
        } else if (data) {
          setChartData(data)
        }
      })()
    } else if (chartType === 'stars') {
      (async function retrieveRepositoryStarHistory() {
        const { starHistory } = await getRepositoryStarHistory(supabase, starsTable, organization, repoName, githubAccessToken)
        setChartData(starHistory)
      })()
    }
    if (repoName) setLoading(false)
  }, [repoName])

  return (
    <>
      {!chartType && !loading && (
        <div className="h-screen w-screen flex flex-col items-center justify-center">
          <p className="mb-2 text-white">Specify what type of charts you would like to embed as such:</p>
          <p className="text-white mb-5">/embed?chart=[chartType]</p>
          <p className="text-gray-400">
            Available chart types:
            <span className="font-mono ml-2 border-gray-400 border-r mr-2 pr-2">stars</span>
            <span className="font-mono">issues</span>
          </p>
        </div>
      )}
      {chartType === 'stars' && (
        <div className="h-screen w-screen pr-8 flex items-center">
          <StarHistory
            embed={true}
            repoName={repoName}
            starHistory={chartData}
            loadingStarHistory={loading}
          />
        </div>
      )}
      {chartType === 'issues' && (
        <div className="h-screen w-screen pr-8">
          <IssueTracker
            embed={true}
            repoName={repoName}
            issueCounts={chartData}
            loadingIssueCounts={loading}
          />
        </div>
      )}
    </>
  )
}

export default EmbedRepositoryStatistics