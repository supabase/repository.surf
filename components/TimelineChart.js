import { useEffect, useRef } from 'react'

const TimelineChart = ({ uPlot, issueCounts }) => {

  const issueCountsPlotRef = useRef(null)

  useEffect(() => {
    if (issueCounts.length > 0) {
      const chartData = [[], []]
      issueCounts.forEach(issue => {
        chartData[0].push(Math.floor(new Date(issue.inserted_at) / 1000))
        chartData[1].push(issue.open_issues)
      })
      issueCountsPlotRef.current?.setData(chartData)
    }
  }, [issueCounts])

  useEffect(() => {
    if (issueCountsPlotRef.current === null) {
      const chartDiv = document.getElementById("chart")

      let opts = {
        id: "chart1",
        class: "my-chart",
        width: chartDiv.offsetWidth,
        height: 300,
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
          {},
          {
            // initial toggled state (optional)
            show: true,
            spanGaps: false,
            // in-legend display
            label: "Open issues",
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

      issueCounts.forEach(issue => {
        chartData[0].push(Math.floor(new Date(issue.inserted_at) / 1000))
        chartData[1].push(issue.open_issues)
      })
    
      const plot = new uPlot(opts, chartData, document.getElementById("chart"))
      issueCountsPlotRef.current = plot
    }

    const handleResize = () => {
      const chartDiv = document.getElementById("chart")
      issueCountsPlotRef.current?.setSize({
        width: chartDiv.offsetWidth,
        height: 300
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  
  return (
    <div className="text-white">
      <div id="chart" className="w-full" style={{ height: 330 }} />
    </div>
  )
}

export default TimelineChart