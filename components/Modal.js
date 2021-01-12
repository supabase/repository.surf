import { Transition } from '@supabase/ui'

const Modal = ({
  showModal,
  onCloseModal,
  className = "sm:max-w-md",
  children
}) => {
  return (
    <Transition
      show={showModal}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0"
      enterTo="transform opacity-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100"
      leaveTo="transform opacity-0"
    >
      <div className="z-10 fixed inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block">

          <div
            className="fixed inset-0"
            aria-hidden="true"
            onClick={() => onCloseModal()}
          >
            <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
          </div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <Transition
            show={showModal}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 translate-y-4 scale-95"
            enterTo="transform opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 translate-y-0 scale-100"
            leaveTo="transform opacity-0 translate-y-4 scale-95"
          >
            <div
              className={`
                inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden
                shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full sm:p-6 bg-gray-700
                ${className}
              `}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              {children}
            </div>
          </Transition>

        </div>
      </div>
    </Transition>
  )
}

export default Modal