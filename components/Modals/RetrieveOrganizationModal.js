const RetrieveOrganizationModal = ({
  grantReadOrgPermissions = () => {}
}) => {
  return (
    <div className="flex-1 text-white">
      <p className="text-2xl mb-5">
        Want to retrieve another organization?
      </p>
      <p className="leading-relaxed text-sm mt-3">
        To do this, you will first need to revoke your current authorization via {' '}
        <a href="https://github.com/settings/connections/applications/8b38cc996af0a52a6548" target="_blank" className="text-brand-700">
          here
        </a> and selecting the "Revoke access" button.
      </p>
      <p className="leading-relaxed text-sm mt-3">
        Once that is done, click <span className="text-brand-700 cursor-pointer" onClick={() => grantReadOrgPermissions()}>here</span> to re-authorize with repository.surf and grant us access to the organizations that you want.
      </p>
    </div>
  )
}

export default RetrieveOrganizationModal