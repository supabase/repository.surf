import { Transition, Icon } from '@supabase/ui'

const Dropdown = ({ showDropdown, options = [], selectedOptionKey = '' }) => (
  <Transition
    show={showDropdown}
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
  >
    <div>
      <div className="cursor-default fixed top-0 right-0 h-screen w-screen z-30" />
      <div className={`
        origin-top-right absolute -right-9 mt-2 w-56 rounded-md shadow-lg bg-gray-700
        ring-1 ring-black ring-opacity-5 z-30 overflow-y-hidden
      `}>
        <div className="py-1 space-y-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          {options.map((option, idx) => (
            <div
              key={`option_${idx}`}
              role="menuitem"
              onClick={() => option.action()}
              className="flex items-center justify-between text-white text-sm block px-4 mx-1 py-2 rounded-md hover:bg-gray-600"
            >
              {option.label}
              {option.key === selectedOptionKey && <Icon type="Check" size={16} strokeWidth={2} className="text-white" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  </Transition>
)

export default Dropdown