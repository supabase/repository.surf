import { useState } from 'react'
import { Icon } from '@supabase/ui'
import TimelineChart from 'components/TimelineChart'
import StatsIndicator from 'components/StatsIndicator'
import Pill from 'components/Pill'

const IssueTracker = ({
  issuesRef,
  header = 'Issues',
  embed = false,
  enableSharing = true,
  repoName,
  issueCounts,
  loadingIssueCounts = false,
  latestOpenIssueCount,
  openIssueCountComparison,
  latestClosedIssueCount,
  noIssueCounts = false,
  onOpenShare = () => {},
  onOpenInfo = () => {},
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
              renderAdditionalActions={() => {
                return (
                  <div className="space-x-2 flex items-center">
                    {options.map((option) => (
                      <Pill              
                        key={option.key}
                        label={option.label}
                        selected={option.key === issueType.key}
                        onSelectPill={() => setIssueType(option)}
                      />
                    ))}
                  </div>
                )
              }}
            />
          </div>
          {!embed && (
            <div className="sm:px-10 w-full mt-6 flex flex-col">
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
        <div
          className={`
            px-5 sm:px-10 py-24 lg:py-36 text-gray-400 mx-auto w-full flex-1
            flex flex-col items-center justify-center text-center
          `}
        >
          {noIssueCounts
            ? (
              <>
                <div className="cursor-pointer transition opacity-25 hover:opacity-75" onClick={() => onOpenInfo()}>
                  <Icon type="Info" size={24} strokeWidth={2} className="text-white" />
                </div>
                <span className="mt-5 block">Issues are not being tracked at the moment.</span>
                <span className="mt-2 block">Click on the icon above for more information.</span>
              </>
            )
            : (
              <span className="mt-5">Select a repository first to view its issues trend.</span>
            )
          }
        </div>
      )
    }
  }

  return (
    <>
      {!embed && (
        <div ref={issuesRef} id="issueTrack" className="w-full pb-5 sm:px-10 sm:pb-10">
          <div className="text-white text-2xl flex items-center group">
            <h1>{header}</h1>
            {!enableSharing && (
              <div className="hidden lg:block ml-3 transition opacity-0 group-hover:opacity-100">
                <div className="cursor-pointer" onClick={() => onOpenShare('issues')}>
                  <Icon type="Share2" size={20} strokeWidth={2} className="text-gray-400" />
                </div>
              </div>
            )}
          </div>
          <p className="mt-5 text-base text-gray-400">
            This is a timeline of how many {issueType.label.toLowerCase()} {repoName} has over time.
          </p>
        </div>
      )}
      <div className="flex-1 flex flex-col items-start">
        {loadingIssueCounts
          ? (
            <div className="py-24 lg:py-32 text-white w-full flex flex-col items-center justify-center">
              <Icon type="Loader" className="animate-spin text-white" size={24} strokeWidth={2} />
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