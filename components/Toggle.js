const sizes = {
    md: {
      slider: 'h-5 w-5',
      toggleOn: 'translate-x-5',
      toggleOff: 'translate-x-0',
      background: 'h-6 w-11 border-2',
    },
    sm: {
      slider: 'h-4 w-4',
      toggleOn: 'translate-x-5',
      toggleOff: 'translate-x-1',
      background: 'h-5 w-10 border-1',
    },
    xsm: {
        slider: 'h-3 w-3',
        toggleOn: 'translate-x-3.5 -translate-y-1',
        toggleOff: 'translate-x-0.5 -translate-y-1',
        background: 'h-3.5 w-7 border-1',
    },
  }
  
  export default function Toggle({
    onToggle = () => {},
    isOn = false,
    size = 'xsm',
    isDisabled = false,
  }) {
    const toggleSizes = sizes[size]
    return (
      <>
        <span
            role="checkbox"
            aria-checked="false"
            onClick={!isDisabled ? onToggle : () => {}}
            className={`${isOn ? 'bg-green-500' : 'bg-gray-200'} ${toggleSizes.background} ${
            isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
            } relative inline-block flex-shrink-0 border-transparent rounded-full transition-colors ease-in-out duration-200 focus:outline-none focus:ring `}
        >
            <span
            aria-hidden="true"
            className={`${isOn ? toggleSizes.toggleOn : toggleSizes.toggleOff} ${
                isDisabled ? 'cursor-not-allowed bg-white' : 'cursor-pointer bg-white'
            }  ${
                toggleSizes.slider
            } inline-block rounded-full shadow transform transition ease-in-out duration-200`}
            ></span>
        </span>
        <span className='text-base inline-block transform translate-x-1 -translate-y-1 text-gray-400'>Set baseline to 0</span>
      </>
    )
  }