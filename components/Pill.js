const Pill = ({
  label = '',
  selected = false,
  onSelectPill = () => {},
  withoutBorder = false,
}) => {
  const unselectedPillStyle = withoutBorder ? 'hover:text-white' : 'hover:bg-gray-400 hover:text-white'
  const selectedPillStyle = withoutBorder ? 'text-brand-700' : 'text-brand-700 bg-gray-900'
  return (
    <div
      onClick={() => onSelectPill()}
      className={`
        text-xs text-gray-300 px-3 py-1 cursor-pointer transition
        ${withoutBorder ? 'border-r last:border-r-0 text-gray-400' : 'border rounded-full text-gray-300'}
        ${selected ? selectedPillStyle : unselectedPillStyle}
      `}
    >
      {label}
    </div>
  )
}

export default Pill