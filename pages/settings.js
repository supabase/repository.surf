import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Icon, Button, Toggle, Badge } from '@supabase/ui'
import { postAndWait } from 'lib/fetchWrapper'
import { retrieveUserOrganizations } from 'lib/helpers'
import { login, getUserProfile, grantReadOrgPermissions } from 'lib/auth'
import { saveOrgAccessToken, saveOrgPrivateRepoVisibility } from 'lib/settingsHelpers'

import Modal from 'components/Modal'
import RetrieveOrganizationModal from 'components/Modals/RetrieveOrganizationModal'

const Settings = ({ supabase }) => {

  const [loaded, setLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [organizations, setOrganizations] = useState([])
  const [orgSettings, setOrgSettings] = useState({})

  useEffect(() => {
    (async function initUserProfile() {
      const userProfile = await getUserProfile()
      if (userProfile) {
        if (userProfile.accessToken) {
          const { data: organizations, error } = await retrieveUserOrganizations(userProfile.accessToken)
          if (error) {
            userProfile.accessToken = null
          } else {
            setOrganizations(organizations)
          }
        }
        setUserProfile(userProfile)
      }
      setLoaded(true)
    })()
  }, [])

  useEffect(() => {
    (async function retrieveOrgSettings() {
      if (organizations.length > 0) {
        const organizationSettings = {}
        for (const org of organizations) {
          const { data } = await supabase.from('organizations').select('*').eq('id', org.id)
          if (data.length > 0) {
            // Load existing configuration for the organization
            organizationSettings[org.id] = {
              name: org.login,
              accessToken: '',
              showToken: false,
              showPrivateRepos: data[0].show_private_repos,
              issueTracking: false,
            }
            if (data[0].access_token) {
              const { decrypted_token } = await postAndWait('/api/decrypt', { token: data[0].access_token })
              organizationSettings[org.id].accessToken = decrypted_token
            }
          } else {
            // No existing configuration saved for the organization
            organizationSettings[org.id] = {
              name: org.login,
              accessToken: null,
              showToken: false,
              showPrivateRepos: false,
              issueTracking: false,
            }
          }
        }
        setOrgSettings(organizationSettings)
      }
    })()
  }, [organizations])

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
        <div className="px-5 xl:px-0 container mx-auto" style={{ minHeight: 'calc(100% - 12rem)' }}>
          <div className="sm:px-10 flex mb-14">
            <div
              className="h-24 w-24 rounded-full bg-no-repeat bg-center bg-cover"
              style={{ backgroundImage: `url('${userProfile.avatarUrl}')`}}
            />
            <div className="flex flex-col justify-center ml-10 text-white">
              <p className="text-2xl">{userProfile.name}</p>
              <p className="font-light text-gray-400">{userProfile.email}</p>
            </div>
          </div>
    
          <div>
            <div className="pb-5 sm:px-10 sm:pb-10 flex items-center justify-between">
              <div>
                <h1 className="text-white text-2xl">Organization settings</h1>
                <p className="mt-2 text-base text-gray-400">
                  Adjust settings for each organization under your Github account
                </p>
              </div>
              {userProfile.accessToken && (
                <Button shadow type="primary" onClick={() => setShowModal()}>
                  Retrieve organization
                </Button>
              )}
            </div>
            <div className="flex flex-col items-start sm:px-10 text-white">
              {userProfile.accessToken
                ? (
                  <div className="w-full mb-10">
                    {organizations.map(org => (
                      <div key={org.login} className="w-full rounded-md border border-gray-400 p-6 mb-10">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div
                              className="h-10 w-10 rounded-full bg-no-repeat bg-center bg-cover"
                              style={{ backgroundImage: `url('${org.avatar_url}')`}}
                            />
                            <p className="ml-4">{org.login}</p>
                          </div>
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
                            <div className="flex items-center justify-between">
                              <label>
                                <span className="mr-2">Show private repositories</span>
                                <span className="block text-gray-400 text-sm mt-1">
                                  Allow private repositories under {org.login} to be publicly visible on repository.surf.
                                </span>
                              </label>
                              <div onClick={() => onToggleOrgPrivateRepoVisibility(org)}>
                                <Toggle checked={orgSettings[org.id].showPrivateRepos} />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <label>
                                <div className="flex">
                                  <span className="mr-2">Toggle issue tracking</span>
                                  <Badge dot color="green" size="small">Coming soon</Badge>
                                </div>
                                <span className="block text-gray-400 text-sm mt-1">
                                  Start tracking the issue counts for repositories under {org.login}
                                </span>
                              </label>
                              <div className="opacity-50">
                                <Toggle checked={orgSettings[org.id].issueTracking} disabled />
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
                        You will need to grant read access for each organization that you want to adjust settings for to repository.surf via the button below.
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