import { fetchAndWait, postAndWait } from 'lib/fetchWrapper'
import { createClient } from '@supabase/supabase-js'

const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET

const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
const supabase = createClient(supabaseURL, supabasePublicKey)

export default async function callback(req, res) {
  const code = req.query.code
  const url = `https://github.com/login/oauth/access_token?client_id=${githubClientId}&client_secret=${githubClientSecret}&code=${code}`

  const result = await postAndWait(url)
  if (result.error) {
    console.error("Failed to retrieve GH access token")
  } else if (result) {
    console.log(result)
  }

  const githubUserProfile = await fetchAndWait(
    `https://api.github.com/user`,
    { 'Authorization': `token ${result.access_token}` }
  )

  const { error } = await supabase
    .from('users')
    .update({
      name: githubUserProfile.name,
      access_token: result.access_token
    })
  
  if (error) console.error(error)

  res.redirect('http://localhost:3000/settings')
}