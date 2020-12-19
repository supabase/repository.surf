const Footer = () => {
  return (
    <footer className="w-full h-16 border-t flex justify-center items-center border-gray-200 text-gray-400">
      <a
        className="flex justify-center items-center text-xs"
        href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by{' '}
        <img src="/supabase.png" alt="Supabase Logo" className="h-3 ml-3" />
      </a>
    </footer>
  )
}

export default Footer