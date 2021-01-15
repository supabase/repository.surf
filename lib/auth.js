import { createClient } from '@supabase/supabase-js'
import { postAndWait } from 'lib/fetchWrapper'
import { USERS_TABLE, ORGANIZATIONS_TABLE } from 'lib/constants'

const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
export const supabase = createClient(supabaseURL, supabasePublicKey)

const githubAccessToken = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN
const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
const githubScope = process.env.NEXT_PUBLIC_GITHUB_SCOPE

supabase.auth.onAuthStateChange(async(event, session) => {
  if (event === 'SIGNED_IN') {
    const { data: user, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .eq('id', session.user.id)

    if (error) {
      console.error(error)
    } else if (user.length === 0) {
      await supabase
        .from(USERS_TABLE)
        .insert([
          {
            id: session.user.id,
            name: session.user.user_metadata.full_name,
            email: session.user.email
          }
        ])
    }
  }
})

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

export const retrieveOrganizationConfig = async(orgId) => {
  const { data, error } = await supabase
    .from(ORGANIZATIONS_TABLE)
    .select('*')
    .eq('id', orgId)

  if (error) {
    console.error(error)
  } else if (data.length > 0) {
    let token = githubAccessToken
    if (data[0].access_token) {
      console.log("INFO: Using config token")
      const res = await postAndWait('/api/decrypt', { token: data[0].access_token })
      token = res.decrypted_token
    } else {
      console.log("INFO: Not using config token")
    }
    return {
      ...data[0],
      access_token: token
    }
  }
  console.log("INFO: Not using config token")
  return {
    access_token: githubAccessToken
  }
}