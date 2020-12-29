import UpArrow from 'icons/UpArrow'
import DownArrow from 'icons/DownArrow'

const StatsIndicator = ({ countDiff }) => {

  let arrowIndicator;
  let color;

  if (countDiff > 0) {
    arrowIndicator = <UpArrow />
    color = 'text-red-400'
  } else if (countDiff === 0) {
    arrowIndicator = <div />
    color = 'text-gray-400'
  } else {
    arrowIndicator = <DownArrow />
    color = 'text-brand-600'
  }

  return (
    <div className="flex items-center">
      {arrowIndicator}
      <span
        className={`text-sm ml-1 ${color}`}
      >
        {
          countDiff !== 0
            ? `${Math.abs(countDiff)} issue${Math.abs(countDiff) > 1 ? 's' : ''}`
            : 'No change'
        } from yesterday
      </span>
    </div>
  )
}

export default StatsIndicator