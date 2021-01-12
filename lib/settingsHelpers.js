import { supabase } from 'lib/auth'
import { postAndWait } from 'lib/fetchWrapper'

const upsertOrgSettings = async(org, settings) => {
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', org.id)

  if (data.length > 0) {
    const { error } = await supabase
      .from('organizations')
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
      .from('organizations')
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

export const saveOrgAccessToken = async(org, token) => {
  if (token.length === 0) {
    return await upsertOrgSettings(org, { access_token: null })
  } else {
    const { encrypted_token } = await postAndWait('/api/encrypt', { string: token })
    return await upsertOrgSettings(org, { access_token: encrypted_token })
  }

}

export const saveOrgPrivateRepoVisibility = async(org, toggleValue) => {
  return await upsertOrgSettings(org, { show_private_repos: toggleValue })
}