import { useState } from 'react'
import { Icon } from '@supabase/ui'
import TimelineChart from '~/components/TimelineChart'
import Pill from 'components/Pill'
import { retrieveStarGrowthToday, retrieveStarGrowthMonth } from 'lib/helpers' 

const StarHistory = ({
  starHistoryRef,
  header = 'Stars',
  embed = false,
  enableSharing = true,
  repoName,
  lastUpdated,
  starHistory,
  loadingStarHistory,
  loadingMessage = null,
  totalStarCount,
  noStarHistory = false,
  onOpenShare = () => {},
}) => {

  const options = [
    {
      key: 'cumulative_counts',
      label: 'Cumulative counts'
    },
    {
      key: 'daily_new_counts',
      label: 'Daily new counts'
    }
  ] 
  
  const [chartType, setChartType] = useState(options[0].key)

  const renderTimelineChart = () => {
    if (starHistory.length == 0) {
      return (
        <div className="py-24 lg:py-36 flex items-center justify-center text-gray-400">
          {noStarHistory ? 'Selected repositories have no stars' : 'Select a repository first to view its star history'}
        </div>
      )
    }
    
    return (
      <>
        <TimelineChart
          id="starHistoryChart"
          uPlot={uPlot}
          data={starHistory}
          chartType={chartType}
          dateKey="date"
          valueKey="starNumber"
          xLabel="Number of stars"
          showOnlyDate={true}
          renderAdditionalActions={() => {
            return (
              <div className="space-x-2 flex items-center">
                {options.map((option) => (
                  <Pill
                    key={option.key}
                    label={option.label}
                    selected={option.key === chartType}
                    onSelectPill={() => setChartType(option.key)}
                  />
                ))}
              </div>
            )
          }}
        />
        {!embed && (
          <div className="sm:px-10 w-full mt-6 flex flex-col">
            <p className="text-white">Growth statistics</p>
            <div className="mt-5 grid grid-cols-12 gap-x-5">
              <div className="col-span-6 sm:col-span-5 xl:col-span-4">
                <p className="text-gray-400">Past day</p>
                <div id="numbers" className="flex items-center mt-2">
                  <p className="text-white text-3xl mr-2">{retrieveStarGrowthToday(starHistory)}</p>
                </div>
              </div>
              <div className="col-span-6 sm:col-span-5 xl:col-span-4">
                <p className="text-gray-400">For the month</p>
                <p className="mt-2 text-white text-3xl">{retrieveStarGrowthMonth(starHistory)}</p>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div ref={starHistoryRef} id="starHistory" className={`w-full ${embed ? '' : 'mb-12 lg:mb-20'}`}>
      {!embed && (
        <div className="pb-5 sm:px-10 sm:pb-7">
          <div className="flex items-center justify-between">
            <div className="text-white text-2xl flex items-center group flex-1">
              <h1>{header}</h1>
              {enableSharing && (
                <div className="hidden lg:flex items-center ml-3 transition opacity-0 group-hover:opacity-100">
                  <div className="cursor-pointer" onClick={() => onOpenShare('stars')}>
                    <Icon type="Share2" size={20} strokeWidth={2} className="text-gray-400" />
                  </div>
                </div>
              )}
            </div>
            {!loadingStarHistory && lastUpdated && starHistory.length > 0 && (
              <div className="flex items-center">
                <Icon type="Star" size={20} strokeWidth={2} className="text-white" />
                <span className="ml-2 text-white">{totalStarCount}</span>
              </div>
            )}
          </div>
          <p className="mt-2 text-base text-gray-400">This is a timeline of how the star count of {repoName} has grown till today.</p>
          {!loadingStarHistory && !lastUpdated && starHistory.length > 0 && (
            <div className="mt-5 flex item-center text-xs text-gray-400">
              <Icon type="Loader" className="animate-spin text-white inline" size={18} strokeWidth={2} />
              <span className="ml-2 transform translate-x-0.5 translate-y-0.5 inline-block">
                Loading data (
                  {(starHistory[starHistory.length - 1].starNumber / totalStarCount * 100).toString().slice(0, 5)
                }% complete)
              </span>
            </div>
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col items-start">
        <div className={`w-full ${embed ? '' : 'pb-3 sm:pb-0 sm:pr-3'}`}>
          {loadingStarHistory
            ? (
              <div className="py-24 lg:py-32 text-white w-full flex flex-col items-center justify-center">
                <Icon type="Loader" className="animate-spin text-white" size={24} strokeWidth={2} />
                <p className="text-xs mt-3 leading-5 text-center">
                  {loadingMessage || "Retrieving repository star history"}
                </p>
              </div>
            )
            : (<>{renderTimelineChart()}</>)
          }
        </div>
      </div>
    </div>
  )
}

export default StarHistory