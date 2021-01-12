import { Icon } from '@supabase/ui'

const Footer = ({

}) => {
  return (
    <div className="bg-gray-900 h-24 flex items-center px-4 2xl:px-0">
      <div className="container mx-auto flex items-center justify-between">
        {/* <img className="h-5" src="/logo-word.png" /> */}
        <a href="https://supabase.io" target="_blank" className="flex items-center">
          <p className="text-white text-sm font-light">Powered by </p>
          <img className="ml-3 h-5 relative" style={{ top: '1px' }} src="/logo-dark.png" />
        </a>
        <div className="flex items-center space-x-8">
          <a href="https://twitter.com/supabase_io" target="_blank">
            <Icon type="Twitter" size={20} strokeWidth={2} className="text-white" />
          </a>
          <a href="https://github.com/supabase/repository.surf" target="_blank">
            <Icon type="GitHub" size={20} strokeWidth={2} className="text-white" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default Footer