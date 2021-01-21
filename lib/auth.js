import { createClient } from '@supabase/supabase-js'
import { USERS_TABLE } from 'lib/constants'

const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
export const supabase = createClient(supabaseURL, supabasePublicKey)

const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
const githubScope = "read:org read:user"

export const login = async() => {
  await supabase.auth.signIn({ provider: 'github' })
}

export const logout = async() => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error at logout:', error)
}

export const getUser = () => {
  const user = supabase.auth.user()
  return user ? user.user_metadata : null
}

export const getUserProfile = async() => {
  const userProfile = supabase.auth.user()
  if (userProfile) {
    const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('id', userProfile.id)
    if (error) {
      console.error(error)
    } else {
      return {
        id: userProfile.id,
        name: userProfile.user_metadata.full_name,
        email: userProfile.email,
        avatarUrl: userProfile.user_metadata.avatar_url,
        accessToken: data[0].access_token,
      }
    }
  }
  return userProfile
}

export const grantReadOrgPermissions = () => {
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=${githubScope}`
}