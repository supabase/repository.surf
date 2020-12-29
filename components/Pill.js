const Pill = ({
  label = '',
  selected = false,
  onSelectPill = () => {},
}) => (
  <div
    onClick={() => onSelectPill()}
    className={`
      border rounded-full text-xs text-gray-300 px-3 py-1 mr-2 cursor-pointer transition
      ${selected ? 'text-brand-700 bg-gray-900' : 'hover:bg-gray-400 hover:text-white'}
    `}
  >
    {label}
  </div>
)

export default Pill