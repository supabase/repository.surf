import { createClient } from '@supabase/supabase-js'

const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
const supabase = createClient(supabaseURL, supabasePublicKey)

const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
const githubScope = process.env.NEXT_PUBLIC_GITHUB_SCOPE

supabase.auth.onAuthStateChange(async(event, session) => {
  if (event === 'SIGNED_IN') {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)

    if (error) {
      console.error(error)
    } else if (user.length === 0) {
      await supabase
        .from('users')
        .insert([
          {
            id: session.user.id,
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
    .from('users')
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