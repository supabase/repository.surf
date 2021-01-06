import { useEffect, useRef, useState } from 'react'
import Toggle from 'components/Toggle'
import Pill from 'components/Pill'
import { convertCumulativeToDailyNewStars } from '~/lib/helpers'

const options = [
  {
    key: 'allTime',
    label: 'All time',
  },
  {
    key: 'pastNinetyDays',
    label: 'Past 90 days',
    duration: 90*24*60*60*1000,
  },
  {
    key: 'pastThirtyDays',
    label: 'Past 30 days',
    duration: 30*24*60*60*1000,
  },
  {
    key: 'pastWeek',
    label: 'Past week',
    duration: 7*24*60*60*1000,
  },
]

const TimelineChart = ({
  id,
  uPlot,
  data,
  dateKey,
  valueKey,
  chartType = null,
  xLabel = '',
  showOnlyDate = false,
  showBaselineToggle = false,
  showTimeFilter = true,
  renderAdditionalActions = null,
}) => {
  const dataPlotRef = useRef(null)
  const [isBaselineZero, setIsBaselineZero] = useState(false)
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('allTime')

  const deriveOptions = () => {
    const currentTime = new Date()
    const formattedData = data.map(row => {
      return { ...row, [dateKey]: new Date(row[dateKey]).toISOString() }
    })
    return options.filter(option => {
      if (option.key === 'allTime') return option
      else {
        const cutoffDate = new Date(currentTime - option.duration)
        const filteredData = formattedData.filter(row => {
          if (row[dateKey] >= cutoffDate.toISOString() ) return row
        })
        if (filteredData.length !== data.length) return option
      }
    })
  }

  const handleToggle = () => {
    setIsBaselineZero(!isBaselineZero)
  }

  useEffect(() => {
    if (data.length > 0) {

      const currentTime = new Date()
      const formattedData = data.map(row => {
        return { ...row, [dateKey]: new Date(row[dateKey]).toISOString() }
      })
      let filteredData = formattedData.slice()

      // If the chartType exists and is 'daily_new_counts', then
      // convert our data from cumulative to daily increase counts.
      // NOTE: convertCumulativeToDailyNewStars currently only works
      // for star counts.
      // ASSUMPTION: When looking at star counts, the data is already sorted.
      if (chartType && chartType === 'daily_new_counts') {
        filteredData = convertCumulativeToDailyNewStars(filteredData)
      }

      // We'll show data after the cutoffDate if other than allTime is selected
      if (selectedTimeFilter != 'allTime') {
        const [selectedTimeFilterOption] = options.filter(option => option.key === selectedTimeFilter)
        const cutoffDate = new Date(currentTime - selectedTimeFilterOption.duration)
        filteredData = filteredData.filter(row => {
          if (row[dateKey] >= cutoffDate.toISOString() ) return row
        })
      }

      const sortedData = filteredData.sort((a, b) => {
        return (a[dateKey] < b[dateKey]) ? -1 : ((a[dateKey] > b[dateKey]) ? 1 : 0);
      })
      const chartData = [[], []]
      sortedData.forEach(row => {
        chartData[0].push(Math.floor(new Date(row[dateKey]) / 1000))
        chartData[1].push(row[valueKey])
      })
      // sortedData format example:
      // [{<dateKey>: "2019-10-15T00:00:00.000Z", <valueKey>: 1},
      //  {<dateKey>: "2020-01-15T00:00:00.000Z", <valueKey>: 2},
      //  {<dateKey>: "2020-01-16T00:00:00.000Z", <valueKey>: 15}]
      
      // We need to pass true as the second argument of setData
      // in order to reset the scale.
      dataPlotRef.current?.setData(chartData, true)

      if (isBaselineZero) {
        dataPlotRef.current?.setScale('y', {
          min: 0,
          max: Math.max(...data.map(issue => issue[valueKey]))
        })
      }
      
    }
  }, [data, valueKey, chartType, isBaselineZero, selectedTimeFilter])

  useEffect(() => {
    if (dataPlotRef.current === null) {
      const chartDiv = document.getElementById(id)

      let opts = {
        id: "chart1",
        class: "my-chart",
        width: chartDiv.offsetWidth,
        height: chartDiv.offsetHeight - 30,
        cursor: {
          points: {
            size:   (u, seriesIdx)       => u.series[seriesIdx].points.size * 2.5,
            width:  (u, seriesIdx, size) => size / 4,
            stroke: (u, seriesIdx)       => u.series[seriesIdx].points.stroke(u, seriesIdx) + '90',
            fill:   (u, seriesIdx)       => "#fff",
          }
        },
        scales: {
          x: {},
          y: {},
        },
        series: [
          {
            value: (self, rawValue) => {
              const date = new Date(rawValue * 1000)
              return showOnlyDate
                ? date.toLocaleDateString()
                : `${date.toLocaleDateString()} ${date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
            }
          },
          {
            // initial toggled state (optional)
            show: true,
            spanGaps: false,
            // in-legend display
            label: xLabel,
            value: (self, rawValue) => rawValue,
            stroke: "#00BA55",
            width: 1,
            fill: "rgba(0, 186, 85, 0.3)",
            dash: [10, 5],
          }
        ],
        axes: [
          // x-axis
          {
            stroke: "#FFFFFF",
            grid: {
              width: 1 / devicePixelRatio,
              stroke: "rgba(255, 255, 255, 0.3)",
            },
          },
          // y-axis
          {
            stroke: "#FFFFFF",
            size: 90,
            grid: {
              width: 0,
              stroke: "transparent"
            }
          }
        ],
      };

      const chartData = [[], []]

      const formattedData = data.map(row => {
        return { ...row, [dateKey]: new Date(row[dateKey]).toISOString() }
      })
      
      const sortedData = formattedData.sort((a, b) => {
        return (a[dateKey] < b[dateKey]) ? -1 : ((a[dateKey] > b[dateKey]) ? 1 : 0);
      })

      sortedData.forEach(issue => {
        chartData[0].push(Math.floor(new Date(issue[dateKey]) / 1000))
        chartData[1].push(issue[valueKey])
      })
    
      const plot = new uPlot(opts, chartData, document.getElementById(id))
      dataPlotRef.current = plot
    }

    const legend = dataPlotRef.current?.root.querySelector(".u-legend")
    const chartRegion = dataPlotRef.current?.root.querySelector(".u-over")
    if (legend) legend.style.visibility = 'hidden'

    const handleResize = () => {
      const chartDiv = document.getElementById(id)
      dataPlotRef.current?.setSize({
        width: chartDiv.offsetWidth,
        height: chartDiv.offsetHeight - 30
      })
    }

    const handleMouseEnter = () => {
      if (legend) legend.style.visibility = 'visible'
    }

    const handleMouseLeave = () => {
      if (legend) legend.style.visibility = 'hidden'
    }

    window.addEventListener("resize", handleResize)
    chartRegion.addEventListener("mouseenter", handleMouseEnter)
    chartRegion.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      window.removeEventListener("resize", handleResize)
      chartRegion.removeEventListener("mouseenter", handleMouseEnter)
      chartRegion.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  const chartMinValue = Math.min(...data.map(issue => issue[valueKey]))
  
  return (
    <>
      <div className="sm:px-10 mb-3 flex flex-col items-start lg:flex-row lg:items-center lg:justify-between">
        {showTimeFilter && (
          <div className="flex items-center mb-5 lg:mb-0">
            {deriveOptions().map(option => (
              <Pill
                key={option.key}
                label={option.label}
                selected={option.key === selectedTimeFilter}
                withoutBorder={true}
                onSelectPill={() => setSelectedTimeFilter(option.key)}
              />
            ))}
          </div>
        )}
        {renderAdditionalActions && renderAdditionalActions()}
      </div>
      <div className="text-white clear-both">
        <div
          id={id}
          className="w-full h-60 sm:h-80 flex items-center justify-center"
        />
        <div className="sm:px-10 -mt-6">
          {showBaselineToggle && chartMinValue !== 0 && (
            <Toggle
              isOn={isBaselineZero}
              onToggle={handleToggle}
              label="Set baseline to 0" 
              labelPosition="right"
            />
          )}
        </div>
      </div>
    </>
  )
}

export default TimelineChart