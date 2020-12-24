const Dropdown = ({ showDropdown, options = [] }) => (
  <>
    {showDropdown && <div className="cursor-default fixed top-0 right-0 h-screen w-screen z-10" />}
    <div className={`
      origin-top-right absolute -right-9 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-20
      transform transition ease-out duration-100 overflow-y-hidden ${showDropdown ? 'h-auto opacity-100 scale-100' : 'h-0 opacity-0 scale-95'}
    `}>
      <div className="py-1 text-white text-sm" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {options.map((option, idx) => (
          <div
            key={`option_${idx}`}
            role="menuitem"
            onClick={() => option.action()}
            className="block px-4 mx-1 py-2 rounded-md hover:bg-gray-600"
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  </>
)

export default Dropdown