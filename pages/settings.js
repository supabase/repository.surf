import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { retrieveUserOrganizations } from 'lib/helpers'
import { login, getUserProfile, grantReadOrgPermissions } from 'lib/auth'
import { Icon, Button, Toggle, Badge } from '@supabase/ui'

const Settings = ({
  organization,
}) => {

  const [toggle, setToggle] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [organizations, setOrganizations] = useState([])
  const [orgSettings, setOrgSettings] = useState({})

  useEffect(() => {
    (async function initUserProfile() {
      const userProfile = await getUserProfile()
      if (userProfile) {
        setUserProfile(userProfile)
        if (userProfile.accessToken) {
          const organizations = await retrieveUserOrganizations(userProfile.accessToken)
          setOrganizations(organizations)
        }
      }
    })()
  }, [])

  useEffect(() => {
    if (organizations.length > 0) {
      console.log(organizations)
    }
  }, [organizations])

  const onSaveOrganizationSettings = (event, org) => {
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
        <p className="text-white">Sign in to have access to your settings</p>
        <Button
          className="mt-4"
          shadow
          type="primary"
          onClick={() => login()}
        >
          Sign in
        </Button>
      </div>
    )
  } else {
    return (
      <div className="px-5 xl:px-0 container mx-auto" style={{ minHeight: 'calc(100% - 12rem)' }}>
        <div className="sm:px-10 flex mb-20">
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
              <p className="mt-2 text-base text-gray-400">Settings for repositories under the organizations you belong to</p>
            </div>
            <Button shadow type="primary" onClick={() => grantReadOrgPermissions()}>
              Retrieve organizations again
            </Button>
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
                        <div
                          onClick={() => onSaveOrganizationSettings(null, org.login)}
                          className="text-white bg-brand-800 py-2 px-2 rounded-md cursor-pointer">
                          <Icon type="Save" size={20} strokeWidth={2} className="text-white" />
                        </div>
                      </div>
                      <form className="w-full space-y-8" onSubmit={(e) => onSaveOrganizationSettings(e, org.login)}>
                        <div>
                          <label>
                            Organization access token
                            <span className="block text-gray-400 text-sm mt-1">
                              Set a Github access token for {org.login} to fetch private repositories and mitigate the busting of rate-limit from calling Github's API
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
                            Allow private repositories to be publicly visible on repository.surf.
                            </span>
                          </label>
                          <div className="opacity-50" onClick={() => setToggle(!toggle)}>
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
                <Button
                  shadow
                  type="primary"
                  onClick={() => grantReadOrgPermissions()}
                >
                  Retrieve organization details
                </Button>
              )
            }
          </div>
        </div>
      </div>
    )
  }  
}

export default Settings