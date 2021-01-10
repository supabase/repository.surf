import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { retrieveUserOrganizations } from 'lib/helpers'
import { login, getUserProfile, grantReadOrgPermissions } from 'lib/auth'
import { Icon, Button, Toggle, Badge } from '@supabase/ui'

import Modal from 'components/Modal'
import RetrieveOrganizationModal from 'components/Modals/RetrieveOrganizationModal'

const Settings = ({}) => {

  const [loaded, setLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [toggle, setToggle] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [organizations, setOrganizations] = useState([])
  // TODO: Implement this part
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
    if (organizations.length > 0) {
      // Generate organizationSettings
    }
  }, [organizations])

  const onSaveOrganizationSettings = (event, org) => {
    // At the moment this is only for saving org access token
    if (event) {
      document.activeElement.blur();
      event.preventDefault()
      event.stopPropagation()
    }
    toast.success(`Successfully saved settings for ${org}`)
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
                <p className="mt-2 text-base text-gray-400">Adjust settings for each organization under your Github account</p>
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
                        <form className="w-full space-y-8" onSubmit={(e) => onSaveOrganizationSettings(e, org.login)}>
                          <div>
                            <label>
                              Organization access token
                              <span className="block text-gray-400 text-sm mt-1">
                                Set a Github access token for {org.login} to fetch private repositories
                              </span>
                            </label>
                            <input
                              type="text"
                              // value={filterList}
                              // onChange={(e) => setFilterList(e.target.value)}
                              className="w-full text-sm bg-gray-700 border border-gray-500 rounded-md mt-3 py-2 px-2 font-light focus:outline-none focus:border-brand-600"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label>
                              <div className="flex">
                                <span className="mr-2">Toggle visibility of private repositories</span>
                                <Badge dot color="green" size="small">Coming soon</Badge>
                              </div>
                              <span className="block text-gray-400 text-sm mt-1">
                                Allow private repositories under {org.login} to be publicly visible on repository.surf.
                              </span>
                            </label>
                            <div className="opacity-50" onClick={() => {}}>
                              <Toggle active={toggle} />
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
                              <Toggle disabled />
                            </div>
                          </div>
                        </form>
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