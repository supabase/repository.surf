import Link from 'next/link'

const IssueTrackerInfoModal = ({ orgName }) => {
  return (
    <div className="flex-1 text-white">
      <p className="text-2xl mb-5">
        Interested in tracking issues for {orgName}?
      </p>
      <p className="leading-relaxed text-sm">
        We track the issue counts of each repository under an organization via a cron lambda deployed on AWS that triggers over an interval of 1 hour.
      </p>
      <p className="leading-relaxed mt-3 text-sm">
        Feel free to explore how our issue tracking looks like {' '}
        <span className="text-brand-700"><Link href={"/supabase"}>here</Link></span>.
      </p>
      <p className="leading-relaxed mt-3 text-sm">
        If you'd like us to start tracking your issues, head over to your settings <span className="text-brand-700"><Link href='/settings'>here</Link></span>.
      </p>
      <p className="leading-relaxed text-sm mt-3">
        But if you've already turned on issue tracking for your organization - hang tight for the next hour!
      </p>
    </div>
  )
}

export default IssueTrackerInfoModal