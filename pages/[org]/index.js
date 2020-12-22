import { useState, useEffect } from 'react'
import { groupBy } from 'lib/helpers'
import TimelineChart from 'components/TimelineChart'

const issuesTable = process.env.NEXT_PUBLIC_SUPABASE_ISSUES_TABLE

const OrganizationOverview = ({ supabase, organization, repoNames }) => {

  const [issueCounts, setIssueCounts] = useState([])
  const organizationName = organization.charAt(0).toUpperCase() + organization.slice(1)

  useEffect(() => {
    (async function retrieveOrganizationStats() {
      const { data, error } = await supabase
        .from(issuesTable)
        .select('*')
        .eq('organization', organization)
      if (error) {
        console.error(error)
      } else if (data) {
        const overviewIssueCounts = []
        const formattedData = data.map(row => {
          return { ...row, inserted_at: Math.floor(new Date(row.inserted_at))}
        })
        const groupedData = groupBy(formattedData, row => row.inserted_at)
        groupedData.forEach(group => {
          const openIssueCounts = group.map(row => row.open_issues)
          overviewIssueCounts.push({
            'open_issues': openIssueCounts.reduce((a, b) => a + b, 0),
            'inserted_at': group[0].inserted_at
          })
        })
        const sortedIssueCounts = overviewIssueCounts.sort((a, b) => a.inserted_at - b.inserted_at)
        setIssueCounts(sortedIssueCounts)
      }
    })()
  }, [])

  return (
    <>
      <div className="pb-5 sm:px-10 sm:pb-10">
        <h1 className="text-white text-2xl">Overview of {organizationName} on Github</h1>
        <p className="mt-2 text-base text-gray-400">Timeline of open issues across all {repoNames.length} repositories</p>
      </div>
      <div className="flex-1 flex flex-col items-start">
        <div className="w-full sm:pr-5">
          <TimelineChart
            id="overviewIssuesChart"
            uPlot={uPlot}
            data={issueCounts}
            dateKey="inserted_at"
            valueKey="open_issues"
            xLabel="Open issues"
          />
        </div>
      </div>
    </>
  )
}

export default OrganizationOverview