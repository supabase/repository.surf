import TimelineChart from '~/components/TimelineChart'
import StatsIndicator from '~/components/StatsIndicator'

const IssueTracker = ({
  uPlot,
  selectedView,
  issueCounts,
  latestOpenIssueCount,
  latestClosedIssueCount,
  openIssueCountComparison,
}) => {
  return (
    <>
      <div className="px-10 pb-10">
        <h1 className="text-white text-2xl">Issues tracking for {selectedView}</h1>
        <p className="mt-2 text-base text-gray-400">This is a timeline of how many open issues {selectedView} has on Github over time.</p>
      </div>
      <div className="flex-1 flex flex-col items-start">
        <div className="w-full pr-5">
          <TimelineChart uPlot={uPlot} issueCounts={issueCounts} />
        </div>
        <div className="px-10 w-full mt-10 flex flex-col">
          <p className="text-white">Daily statistics</p>
          <div className="mt-5 grid grid-cols-12 gap-x-5">
            <div className="col-span-5 xl:col-span-4">
              <p className="text-gray-400">Open issues</p>
              <div id="numbers" className="flex items-center mt-2">
                <p className="text-white text-3xl mr-2">{latestOpenIssueCount}</p>
                <StatsIndicator countDiff={openIssueCountComparison} />
              </div>
            </div>
            <div className="col-span-5 xl:col-span-4">
              <p className="text-gray-400">Total closed issues</p>
              <p className="mt-2 text-white text-3xl">{latestClosedIssueCount}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default IssueTracker