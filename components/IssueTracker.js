import TimelineChart from '~/components/TimelineChart'
import StatsIndicator from '~/components/StatsIndicator'
import Url from '~/icons/Url'
import Info from 'icons/Info'

const IssueTracker = ({
  repoName,
  issueCounts,
  latestOpenIssueCount,
  openIssueCountComparison,
  latestClosedIssueCount
}) => {
  return (
    <>
      <div id="issueTrack" className="pb-5 sm:px-10 sm:pb-10">
        <a href="#issueTrack" className="text-white text-2xl flex items-center group">
          <h1>Issues Tracking</h1>
          <div className="hidden lg:block ml-3 transition opacity-0 group-hover:opacity-100">
            <Url />
          </div>
        </a>
        <p className="mt-2 text-base text-gray-400">This is a timeline of how many open issues {repoName} has over time.</p>
      </div>
      <div className="flex-1 flex flex-col items-start">
        {issueCounts.length > 0
          ? (
            <>
              <div className="w-full pb-3 sm:pb-0 sm:pr-5">
                <TimelineChart
                  id="issueCountsChart"
                  uPlot={uPlot}
                  data={issueCounts}
                  dateKey="inserted_at"
                  valueKey="open_issues"
                  xLabel="Open issues"
                  showBaselineToggle={true}
                />
              </div>
              <div className="sm:px-10 w-full mt-10 flex flex-col">
                <p className="text-white">Daily statistics</p>
                <div className="mt-5 grid grid-cols-12 gap-x-5">
                  <div className="col-span-6 sm:col-span-5 xl:col-span-4">
                    <p className="text-gray-400">Open issues</p>
                    <div id="numbers" className="flex items-center mt-2">
                      <p className="text-white text-3xl mr-2">{latestOpenIssueCount}</p>
                      <StatsIndicator countDiff={openIssueCountComparison} />
                    </div>
                  </div>
                  <div className="col-span-6 sm:col-span-5 xl:col-span-4">
                    <p className="text-gray-400">Total closed issues</p>
                    <p className="mt-2 text-white text-3xl">{latestClosedIssueCount}</p>
                  </div>
                </div>
              </div>
            </>
          )
          : (
            <div className="px-5 sm:px-10 text-gray-400 w-full flex-1 flex flex-col items-center justify-center text-center">
              <Info />
              <span className="mt-5">Issues under {repoName} are not being tracked at the moment.</span>
            </div>
          )
        }
      </div>
    </>
  )
}

export default IssueTracker