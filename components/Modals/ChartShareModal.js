import { useRef, useState } from 'react'
import { Icon } from '@supabase/ui'
import { generateIframeCode } from 'lib/helpers'

const ChartShareModal = ({
  orgName,
  repoName,
  iframeChartType,
}) => {
  
  const textAreaRef = useRef(null)
  const [codeCopied, setCodeCopied] = useState(false)

  const onCopyCode = () => {
    navigator.clipboard.writeText(textAreaRef.current.value)
    setCodeCopied(true)
  }

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-5">
        <p className="text-white">Embed this chart</p>
        <div
          onClick={() => onCopyCode()}
          className={`
            rounded-md border border-gray-400 p-2 transition
            ${!codeCopied && 'cursor-pointer hover:bg-gray-500'}
          `}
        >
          {codeCopied
            ? <Icon type="Check" size={16} strokeWidth={2} className="text-brand-700" />
            : <Icon type="Clipboard" size={16} strokeWidth={2} className="text-white" />
          }
        </div>
      </div>
      <textarea
        ref={textAreaRef}
        value={generateIframeCode(orgName, repoName, iframeChartType)}
        rows={4}
        readOnly
        className="w-full bg-gray-500 rounded-md p-3 font-mono text-sm text-white"
        style={{ resize: 'none' }}
      />
    </div>
  )
}

export default ChartShareModal