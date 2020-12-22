import Loader from 'components/Loader'
import TimelineChart from '~/components/TimelineChart'

const StarHistory = ({
  repoName,
  starHistory,
  loadingStarHistory
}) => {

  const renderTimelineChart = () => {
    if (starHistory.length > 0) {
      return (
        <TimelineChart
          id="starHistoryChart"
          uPlot={uPlot}
          data={starHistory}
          dateKey="date"
          valueKey="starNumber"
          xLabel="Number of stars"
        />
      )
    } else {
      return (
        <div className="py-24 lg:py-36 flex items-center justify-center text-gray-400">
          Repository has no stars
        </div>
      )
    }
  }

  return (
    <div className="mb-12 lg:mb-20">
      <div className="pb-5 sm:px-10 sm:pb-10">
        <h1 className="text-white text-2xl">Star history for {repoName}</h1>
        <p className="mt-2 text-base text-gray-400">This is a timeline of how the stars of {repoName} has grown till today.</p>
      </div>
      <div className="flex-1 flex flex-col items-start">
        <div className="w-full pb-3 sm:pb-0 sm:pr-5">
          {loadingStarHistory
            ? (
              <div className="py-24 lg:py-32 text-white w-ful flex flex-col items-center justify-center">
                <Loader />
                <p className="text-xs mt-3 leading-5 text-center">Retrieving repository star history</p>
              </div>
            )
            : (
              <>
                {renderTimelineChart()}
              </>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default StarHistory