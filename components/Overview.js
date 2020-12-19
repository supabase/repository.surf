import TimelineChart from '~/components/TimelineChart'

const Overview = ({
  uPlot,
  organizationName,
  repoNames,
  issueCounts,
}) => {
  return (
    <>
      <div className="px-10 pb-10">
        <h1 className="text-white text-2xl">Overview of {organizationName} on Github</h1>
        <p className="mt-2 text-base text-gray-400">Timeline of open issues across all {repoNames.length} repositories</p>
      </div>
      <div className="flex-1 flex flex-col items-start">
        <div className="w-full pr-5">
          <TimelineChart uPlot={uPlot} issueCounts={issueCounts} />
        </div>
      </div>
    </>
  )
}

export default Overview