import Link from 'next/link'

const OrgFeatureCard = ({ org }) => {
  return (
    <Link href={`/${org.login}`}>
    <div className="col-span-12 sm:col-span-6 lg:col-span-4 bg-dark-600 rounded-md px-6 py-6 flex shadow-none transition transform hover:-translate-y-1 hover:shadow-xl cursor-pointer">
        <div className="h-12 w-12 bg-no-repeat bg-center bg-cover rounded-lg" style={{ backgroundImage: `url('${org.avatar_url}')`}} />
        <div className="ml-4 flex flex-col justify-center">
          <p className="text-white">{org.name}</p>
          <p className="text-gray-400 text-sm mt-1">{org.public_repos} public repositories</p>
        </div>
    </div>
    </Link>
  )
}

export default OrgFeatureCard