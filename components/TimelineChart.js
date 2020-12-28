import { useEffect, useRef, useState } from 'react'
import Toggle from 'components/Toggle'

const TimelineChart = ({
  id,
  uPlot,
  data,
  dateKey,
  valueKey,
  xLabel = '',
  showOnlyDate = false,
  showBaselineToggle = false,
}) => {
  const dataPlotRef = useRef(null)
  const [isBaselineZero, setIsBaselineZero] = useState(false)

  const handleToggle = () => {
    setIsBaselineZero(!isBaselineZero)
  }

  useEffect(() => {
    if (data.length > 0) {
      const sortedData = data.sort((a, b) => {
        return (a[dateKey] < b[dateKey]) ? -1 : ((a[dateKey] > b[dateKey]) ? 1 : 0);
      })
      const chartData = [[], []]
      sortedData.forEach(issue => {
        chartData[0].push(Math.floor(new Date(issue[dateKey]) / 1000))
        chartData[1].push(issue[valueKey])
      })
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
  }, [data, valueKey, isBaselineZero])

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
            grid: {
              width: 0,
              stroke: "transparent"
            }
          }
        ]
      };

      const chartData = [[], []]

      data.forEach(issue => {
        chartData[0].push(Math.floor(new Date(issue[dateKey]) / 1000))
        chartData[1].push(issue[valueKey])
      })
    
      const plot = new uPlot(opts, chartData, document.getElementById(id))
      dataPlotRef.current = plot
    }

    const handleResize = () => {
      const chartDiv = document.getElementById(id)
      dataPlotRef.current?.setSize({
        width: chartDiv.offsetWidth,
        height: chartDiv.offsetHeight - 30
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  
  return (
    <>
      {showBaselineToggle && (
        <div className="sm:px-10">
          <Toggle isOn={isBaselineZero} onToggle={handleToggle} label="Set baseline to 0" />
        </div>
      )}
      <div className="text-white clear-both">
        <div id={id} className="w-full h-60 sm:h-80" />
      </div>
    </>
  )
}

export default TimelineChart