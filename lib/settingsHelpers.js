import { supabase } from 'lib/auth'
import { ORGANIZATIONS_TABLE } from 'lib/constants'
import { fetchAndWait, postAndWait } from 'lib/fetchWrapper'

const upsertOrgSettings = async(org, settings) => {
  const { data } = await supabase
    .from(ORGANIZATIONS_TABLE)
    .select('*')
    .eq('id', org.id)

  if (data.length > 0) {
    const { error } = await supabase
      .from(ORGANIZATIONS_TABLE)
      .update(settings)
      .match({ id: org.id })
    if (error) {
      console.error(error)
      return { success: false, message: `Failed to update settings for ${org.login}` }
    } else {
      return { success: true, message: `Successfully updated settings for ${org.login}` }
    }
  } else {
    const { error } = await supabase
      .from(ORGANIZATIONS_TABLE)
      .insert([
        {
          id: org.id,
          name: org.login,
          ...settings,
        }
      ])
    if (error) {
      console.error(error)
      return { success: false, message: `Failed to update settings for ${org.login}` }
    } else {
      return { success: true, message: `Successfully saved settings for ${org.login}` }
    }
  }
}

const testGithubAccessTokenValidity = async(token) => {
  const result = await fetchAndWait(
    `https://api.github.com/user`,
    { 'Authorization': `token ${token}` }
  )
  if (result.message || result.message === 'Bad credentials') {
    return false
  } else {
    return true
  }
}

export const saveOrgAccessToken = async(org, token) => {
  if (token.length === 0) {
    return await upsertOrgSettings(org, { access_token: null })
  } else {
    const validToken = await testGithubAccessTokenValidity(token)
    if (validToken) {
      const { encrypted_token } = await postAndWait('/api/encrypt', { string: token })
      return await upsertOrgSettings(org, { access_token: encrypted_token })
    } else {
      return { success: false, message: `Invalid access token provided`}
    }
  }
}

export const retrieveOrgSettings = async(org) => {
  let orgSettings = {}
  const { data } = await supabase
    .from(ORGANIZATIONS_TABLE)
    .select('*')
    .eq('id', org.id)

  if (data.length > 0) {
    // Load existing configuration for the organization
    orgSettings = {
      name: org.login,
      accessToken: '',
      showToken: false,
      showPrivateRepos: data[0].show_private_repos,
      issueTracking: false,
    }
    if (data[0].access_token) {
      const { decrypted_token } = await postAndWait('/api/decrypt', { token: data[0].access_token })
      orgSettings.accessToken = decrypted_token
    }
  } else {
    // No existing configuration saved for the organization
    orgSettings = {
      name: org.login,
      accessToken: null,
      showToken: false,
      showPrivateRepos: false,
      issueTracking: false,
    }
  }
  return orgSettings
}

export const saveOrgPrivateRepoVisibility = async(org, toggleValue) => {
  return await upsertOrgSettings(org, { show_private_repos: toggleValue })
}