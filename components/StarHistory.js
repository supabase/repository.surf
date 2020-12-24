import Loader from 'icons/Loader'
import Url from 'icons/Url'
import TimelineChart from '~/components/TimelineChart'

const Star = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="#FFFFFF"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const StarHistory = ({
  repoName,
  lastUpdated,
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
          showOnlyDate={true}
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
    <div id="starHistory" className="mb-12 lg:mb-20">
      <div className="pb-5 sm:px-10 sm:pb-10">
        <div className="flex items-center justify-between">
          <a href="#starHistory" className="text-white text-2xl flex items-center group">
            <h1>Star History</h1>
            <div className="hidden lg:block ml-3 transition opacity-0 group-hover:opacity-100">
              <Url />
            </div>
          </a>
          {!loadingStarHistory && starHistory.length > 0 && (
            <div className="flex items-center">
              <Star />
              <span className="ml-2 text-white">{starHistory[starHistory.length - 1].starNumber}</span>
            </div>
          )}
        </div>
        <p className="mt-2 text-base text-gray-400">This is a timeline of how the stars of {repoName} has grown till today.</p>
        {lastUpdated && <p className="mt-3 text-gray-400 text-xs">Last updated on: {new Date(lastUpdated).toDateString()}</p>}
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