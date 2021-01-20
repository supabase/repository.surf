import Link from 'next/link'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Icon, Button, Toggle, Badge } from '@supabase/ui'
import { retrieveUserOrganizations } from 'lib/helpers'
import { login, logout, getUserProfile, grantReadOrgPermissions } from 'lib/auth'
import { retrieveOrgSettings, saveOrgAccessToken, saveOrgPrivateRepoVisibility, saveOrgIssueTracking } from 'lib/settingsHelpers'

import Modal from 'components/Modal'
import RetrieveOrganizationModal from 'components/Modals/RetrieveOrganizationModal'

const Settings = () => {

  const [loaded, setLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [organizations, setOrganizations] = useState([])
  const [orgSettings, setOrgSettings] = useState({})

  useEffect(() => {
    let isCancelled = false;

    const initUserProfile = async() => {
      const userProfile = await getUserProfile()
      if (userProfile && userProfile.accessToken) {
        const { data: organizations, error } = await retrieveUserOrganizations(userProfile.accessToken)
        if (error) {
          console.error(error)
          userProfile.accessToken = null
        } else if (organizations.length > 0) {
          const organizationSettings = {}
          for (const org of organizations) {
            organizationSettings[org.id] = await retrieveOrgSettings(org)
          }
          if (!isCancelled) {
            setOrganizations(organizations)
            setOrgSettings(organizationSettings)
          }
        }
      }
      if (!isCancelled) {
        setUserProfile(userProfile)
        setLoaded(true)
      }
    }
    
    initUserProfile()

    return () => {
      isCancelled = true
    }
  }, [])

  const updateOrgAccessToken = (orgId, value) => {
    const updatedOrgSettings = { ...orgSettings }
    updatedOrgSettings[orgId].accessToken = value
    setOrgSettings(updatedOrgSettings)
  }

  const onToggleOrgAccessTokenVisible = (orgId) => {
    const updatedOrgSettings = { ...orgSettings }
    updatedOrgSettings[orgId].showToken = !updatedOrgSettings[orgId].showToken
    setOrgSettings(updatedOrgSettings)
  }

  const onSaveOrgAccessToken = async(event, org) => {
    if (event) {
      document.activeElement.blur();
      event.preventDefault()
      event.stopPropagation()
    }
    const res = await saveOrgAccessToken(org, orgSettings[org.id].accessToken)
    if (res.success) {
      toast.success(res.message)
    } else {
      toast.error(res.message)
    }
  }

  const onToggleOrgPrivateRepoVisibility = async(org) => {
    const res = await saveOrgPrivateRepoVisibility(org, !orgSettings[org.id].showPrivateRepos)
    if (res.success) {
      const updatedOrgSettings = { ...orgSettings }
      updatedOrgSettings[org.id].showPrivateRepos = !updatedOrgSettings[org.id].showPrivateRepos
      setOrgSettings(updatedOrgSettings)
      toast.success(res.message)
    } else {
      toast.error(res.message)
    }
  }

  const onToggleOrgIssueTracking = async(org) => {
    if (orgSettings[org.id].accessToken) {
      const res = await saveOrgIssueTracking(org, !orgSettings[org.id].trackIssues)
      if (res.success) {
        const updatedOrgSettings = { ...orgSettings }
        updatedOrgSettings[org.id].trackIssues = !updatedOrgSettings[org.id].trackIssues
        setOrgSettings(updatedOrgSettings)
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    }
  }

  if (!userProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        {!loaded 
          ? (
            <Icon type="Loader" size={24} strokeWidth={2} className="text-white animate-spin" />
          )
          : (
            <>
            <p className="text-white">Sign in to have access to your settings</p>
              <Button
                className="mt-4"
                shadow
                type="primary"
                onClick={() => login()}
              >
                Sign in
              </Button>
            </>
          )
        }
      </div>
    )
  } else {
    return (
      <>
        <Modal
          showModal={showModal}
          onCloseModal={() => setShowModal(false)}
          className="sm:max-w-xl"
        >
          <RetrieveOrganizationModal grantReadOrgPermissions={grantReadOrgPermissions} />
        </Modal>
        <div className="sm:px-5 xl:px-0 container mx-auto" style={{ minHeight: 'calc(100% - 12rem)' }}>
          <div className="sm:px-10 flex mb-14">
            <div
              className="h-24 w-24 rounded-full bg-no-repeat bg-center bg-cover"
              style={{ backgroundImage: `url('${userProfile.avatarUrl}')`}}
            />
            <div className="flex-1 flex flex-col justify-center ml-10 text-white">
              <p className="text-2xl">{userProfile.name}</p>
              <p className="font-light text-gray-400">{userProfile.email}</p>
              <button
                onClick={async() => {
                  await logout()
                  window.location.href = '/'
                }}
                className="text-xs border rounded-full px-3 py-1 w-28 mt-2 transition opacity-50 hover:opacity-100 focus:outline-none"
              >
                Logout
              </button>
            </div>
          </div>
    
          <div>
            <div className="pb-5 sm:px-10 sm:pb-10 flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h1 className="text-white text-2xl">Organization settings</h1>
                <p className="mt-2 text-base text-gray-400">
                  Adjust settings for each organization under your Github account
                </p>
              </div>
              {userProfile.accessToken && (
                <Button className="mt-3 sm:mt-0" shadow type="primary" onClick={() => setShowModal()}>
                  Unable to find your organization?
                </Button>
              )}
            </div>
            <div className="flex flex-col items-start sm:px-10 text-white">
              {userProfile.accessToken
                ? (
                  <div className="w-full mb-10">
                    {organizations.length === 0 && (
                      <>
                        <p className="text-gray-100">
                          There are no organizations under your Github user (that you've given read access to)
                        </p>
                        <p className="text-gray-100 mt-4">
                          <span className="text-brand-700">Not what you expected?</span>{' '}
                          Try retrieving your organizations again via the button to the right
                        </p>
                      </>
                    )}
                    {Object.keys(orgSettings).length > 0 && organizations.map(org => (
                      <div key={org.login} className="w-full rounded-md border border-gray-400 p-6 mb-10">
                        <div className="flex items-center justify-between mb-6">
                          <Link href={`/${org.login}`}>
                            <div className="flex items-center cursor-pointer">
                              <div
                                className="h-10 w-10 rounded-full bg-no-repeat bg-center bg-cover"
                                style={{ backgroundImage: `url('${org.avatar_url}')`}}
                              />
                              <p className="ml-4">{org.login}</p>
                            </div>
                          </Link>
                        </div>
                        {orgSettings[org.id] && (
                          <form className="w-full space-y-8" onSubmit={(e) => onSaveOrgAccessToken(e, org)}>
                            <div>
                              <label>
                                Organization access token
                                <span className="block text-gray-400 text-sm mt-1">
                                  Set a Github access token for {org.login} to fetch private repositories
                                  (Create one {' '}
                                  <a
                                    href="https://github.com/settings/tokens/new"
                                    target="_blank"
                                    className="text-brand-700 transition-opacity opacity-50 hover:opacity-100"
                                  >
                                    here
                                  </a> - Only the read:org scope is required)
                                </span>
                              </label>
                              <div className="relative">
                                <input
                                  type={orgSettings[org.id].showToken ? 'text' : 'password' }
                                  value={orgSettings[org.id].accessToken || ''}
                                  onChange={(e) => updateOrgAccessToken(org.id, e.target.value)}
                                  className="w-full text-sm bg-gray-700 border border-gray-500 rounded-md mt-3 py-2 px-2 font-light focus:outline-none focus:border-brand-600"
                                />
                                <div
                                  className="absolute top-6 right-4 cursor-pointer transition opacity-50 hover:opacity-100"
                                  onClick={() => onToggleOrgAccessTokenVisible(org.id)}
                                >
                                  <Icon
                                    type={orgSettings[org.id].showToken ? 'EyeOff' : 'Eye' }
                                    size={16}
                                    strokeWidth={2}
                                    className="text-white" 
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                              <label>
                                <span className="mr-2">Show private repositories</span>
                                <span className="block text-gray-400 text-sm mt-1">
                                  Allow private repositories under {org.login} to be publicly visible on repository.surf.
                                </span>
                              </label>
                              <div className="mt-3 sm:mt-0" onClick={() => onToggleOrgPrivateRepoVisibility(org)}>
                                <Toggle checked={orgSettings[org.id].showPrivateRepos} />
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                              <label>
                                <div className="flex">
                                  <span className="mr-2">Toggle issue tracking</span>
                                  {/* <Badge dot color="green" size="small">Coming soon</Badge> */}
                                </div>
                                <span className="block text-gray-400 text-sm mt-1">
                                  Start tracking the issue counts for repositories under {org.login} (You will need to provide an access token first)
                                </span>
                              </label>
                              <div
                                className={`mt-3 sm:mt-0 ${!orgSettings[org.id].accessToken && 'opacity-50'}`}
                                onClick={() => onToggleOrgIssueTracking(org)}
                              >
                                <Toggle checked={orgSettings[org.id].trackIssues} disabled={!orgSettings[org.id].accessToken} />
                              </div>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                )
                : (
                  <>
                    <div className="mb-10 space-y-5">
                      <p className="text-sm">
                        You will need to <span className="text-brand-700">grant read access for each organization that you want</span> to adjust settings for to repository.surf via the button below.
                      </p>
                      <p className="text-sm">
                        The settings available for each organization include the following:
                      </p>
                      <ul className="text-sm list-disc list-inside space-y-1">
                        <li>Adding of organization access token to retrieve private repositories</li>
                        <li>Toggle the visiblity of private repositories (Coming soon)</li>
                        <li>Toggle the tracking of issues for each repository (Coming soon)</li>
                      </ul>
                    </div>
                    <Button
                      shadow
                      type="primary"
                      onClick={() => grantReadOrgPermissions()}
                    >
                      Retrieve organizations under you
                    </Button>
                  </>
                )
              }
            </div>
          </div>
        </div>
      </>
    )
  }  
}

export default Settings