const UpArrow = () => (
  <svg
    className="self-center flex-shrink-0 h-5 w-5 text-red-500"
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
)

const DownArrow = () => (
  <svg
    className="self-center flex-shrink-0 h-5 w-5 text-brand-600"
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
)

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