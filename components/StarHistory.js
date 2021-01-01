import Loader from 'icons/Loader'
import Star from 'icons/Star'
import Share from '~/icons/Share'
import TimelineChart from '~/components/TimelineChart'

const StarHistory = ({
  header = 'Star History',
  embed = false,
  enableSharing = true,
  repoName,
  lastUpdated,
  starHistory,
  loadingStarHistory,
  totalStarCount,
  onOpenModal
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
    <div id="starHistory" className={`w-full ${embed ? '' : 'mb-12 lg:mb-20'}`}>
      {!embed && (
        <div className="pb-5 sm:px-10 sm:pb-10">
          <div className="flex items-center justify-between">
            <div className="text-white text-2xl flex items-center group flex-1">
              <h1>{header}</h1>
              {enableSharing && (
                <div className="hidden lg:flex items-center ml-3 transition opacity-0 group-hover:opacity-100">
                  <div className="cursor-pointer" onClick={() => onOpenModal('stars')}>
                    <Share size={20} className="stroke-current text-gray-400" />
                  </div>
                </div>
              )}
            </div>
            {!loadingStarHistory && lastUpdated && starHistory.length > 0 && (
              <div className="flex items-center">
                <Star />
                <span className="ml-2 text-white">{totalStarCount}</span>
              </div>
            )}
          </div>
          <p className="mt-2 text-base text-gray-400">This is a timeline of how the star count of {repoName} has grown till today.</p>
          {!loadingStarHistory && (
            <div className="mt-3 text-gray-400 text-xs">
              {lastUpdated
                ? (
                  <span>
                    Last updated on: {new Date(lastUpdated).toLocaleDateString()}, {new Date(lastUpdated).toTimeString().split('(')[0]}
                  </span>
                )
                : starHistory.length > 0 && (
                  <div className="flex item-center">
                    <Loader size={18} additionalClassName="inline"/>
                    <span className="ml-2 transform translate-x-0.5 translate-y-0.5 inline-block">
                      Loading data (
                        {(starHistory[starHistory.length - 1].starNumber / totalStarCount * 100).toString().slice(0, 5)
                      }% complete)
                    </span>
                  </div>
                )
              }
            </div>
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col items-start">
        <div className={`w-full ${embed ? '' : 'pb-3 sm:pb-0 sm:pr-3'}`}>
          {loadingStarHistory
            ? (
              <div className="py-24 lg:py-32 text-white w-full flex flex-col items-center justify-center">
                <Loader />
                <p className="text-xs mt-3 leading-5 text-center">Retrieving repository star history</p>
              </div>
            )
            : (
              <>{renderTimelineChart()}</>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default StarHistory