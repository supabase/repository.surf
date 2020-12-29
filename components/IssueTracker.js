import { useState } from 'react'
import TimelineChart from '~/components/TimelineChart'
import StatsIndicator from '~/components/StatsIndicator'
import Pill from '~/components/Pill'
import Loader from 'icons/Loader'
import Url from '~/icons/Url'
import Info from 'icons/Info'

const IssueTracker = ({
  embed = false,
  repoName,
  issueCounts,
  loadingIssueCounts = false,
  latestOpenIssueCount,
  openIssueCountComparison,
  latestClosedIssueCount
}) => {

  const options = [
    {
      key: 'open_issues',
      label: 'Open issues'
    },
    {
      key: 'closed_issues',
      label: 'Closed issues'
    }
  ] 
  
  const [issueType, setIssueType] = useState(options[0])

  const renderTimelineChart = () => {
    if (issueCounts.length > 0) {
      return (
        <>
          <div className="w-full pb-3 sm:pb-0 sm:pr-3">
            <TimelineChart
              id="issueCountsChart"
              uPlot={uPlot}
              data={issueCounts}
              dateKey="inserted_at"
              valueKey={issueType.key}
              xLabel="Issue count"
              showBaselineToggle={true}
            />
          </div>
          {!embed && (
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
          )}
        </>
      )
    } else {
      return (
        <div className="px-5 sm:px-10 text-gray-400 w-full flex-1 flex flex-col items-center justify-center text-center">
          <Info />
          <span className="mt-5">Issues under {repoName} are not being tracked at the moment.</span>
        </div>
      )
    }
  }

  return (
    <>
      <div id="issueTrack" className="pb-5 sm:px-10 sm:pb-10">
        <a href="#issueTrack" className="text-white text-2xl flex items-center group">
          <h1>Issues Tracking</h1>
          <div className="hidden lg:block ml-3 transition opacity-0 group-hover:opacity-100">
            <Url />
          </div>
        </a>
        <div className="mt-5 flex items-center flex-wrap">
          <p className="text-white text-sm mr-2">View for:</p>
          {options.map((option) => (
            <Pill              
              key={option.key}
              label={option.label}
              selected={option.key === issueType.key}
              onSelectPill={() => setIssueType(option)}
            />
          ))}
        </div>
        <p className="mt-5 text-base text-gray-400">
          This is a timeline of how many {issueType.label.toLowerCase()} {repoName} has over time.
        </p>
      </div>
      <div className="flex-1 flex flex-col items-start">
        {loadingIssueCounts
          ? (
            <div className="py-24 lg:py-32 text-white w-full flex flex-col items-center justify-center">
              <Loader />
              <p className="text-xs mt-3 leading-5 text-center">Retrieving issues from {repoName}</p>
            </div>
          )
          : (
            <>{renderTimelineChart()}</>
          )
        }
      </div>
    </>
  )
}

export default IssueTracker