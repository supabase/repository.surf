import Transition from 'lib/Transition'
import { Icon } from '@supabase/ui'

const Sidebar = ({
  showSidebar = false,
  direction='right',
  onCloseSidebar,
}) => {
  return (
    <Transition
      show={showSidebar}
      enter="transition ease-out duration-100"
      enterFrom={`transform ${direction === 'right' ? 'translate-x-64' : '-translate-x-64'}`}
      enterTo="transform translate-x-0"
      leave="transition ease-in duration-75"
      leaveFrom="transform translate-x-0"
      leaveTo={`transform ${direction === 'right' ? 'translate-x-64' : '-translate-x-64'}`}
    >
      <div
        className={`
          bg-gray-800 flex flex-col w-64 z-50 fixed top-14 p-4
          ${direction === 'right' ? 'right-0' : 'left-0'}
        `}
        style={{ height: 'calc(100vh - 3.5rem)'}}
      >
        <div className="flex items-center justify-between text-white">
          <p>Repositories</p>
          <div className="flex items-center space-x-4">
            <div className="cursor-pointer">
              <Icon type="Sliders" size={16} strokeWidth={2} />
            </div>
            <div className="cursor-pointer" onClick={() => onCloseSidebar()}>
              <Icon type="X" size={20} strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  )
}

export default Sidebar