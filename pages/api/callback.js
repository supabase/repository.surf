import { fetchAndWait, postAndWait } from 'lib/fetchWrapper'
import { USERS_TABLE } from 'lib/constants'
import { supabase } from 'lib/auth'
const CryptoJS = require('crypto-js')

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT
const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET

export default async function callback(req, res) {
  const code = req.query.code
  const url = `https://github.com/login/oauth/access_token?client_id=${githubClientId}&client_secret=${githubClientSecret}&code=${code}`

  const result = await postAndWait(url)
  if (result.error) {
    console.error("Failed to retrieve GH access token")
  } else {
    let userProfile;
    let matchedField;
    const fieldsToCheck = ['github_id', 'email', 'name']

    const githubUserProfile = await fetchAndWait(
      `https://api.github.com/user`,
      { 'Authorization': `token ${result.access_token}` }
    )

    // [Joshen] Strategy to store access token given that we're
    // unable (?) to retrieve the user's github id on login
    // 1. Try to store access token by checking github_id
    // 2. If can't then try to retrieve by email
    // 3. If can't then try to retrieve by name
    // 4. If can't show some error message
    // Should resolve first timers trying to retrieve organizations
    // Subsequently, we'd have gotten their github IDs so wouldn't be an issue

    for (const field of fieldsToCheck) {
      const { data, error } = await supabase
        .from(USERS_TABLE)
        .select('*')
        .eq(field, field === 'github_id' ? githubUserProfile.id : githubUserProfile[field])
      if (error) {
        console.error(error)
      } else if (data.length === 1) {
        console.log(`Auth for retrieving orgs: User found with ${field}!`)
        userProfile = data[0]
        matchedField = field
        break;
      }
    }

    if (userProfile) {
      const { error } = await supabase
        .from(USERS_TABLE)
        .update({
          access_token: CryptoJS.AES.encrypt(
            result.access_token,
            process.env.REPOSITORY_SURF_ENCRYPTION_KEY
          ).toString(),
          ...(!userProfile.github_id && { github_id: githubUserProfile.id }),
          ...((userProfile.name !== githubUserProfile.name) && githubUserProfile.name && { name: githubUserProfile.name }),
          ...((userProfile.email !== githubUserProfile.email) && githubUserProfile.email && { name: githubUserProfile.name }),
        })
        .match({
          [matchedField]: matchedField === 'github_id' ? githubUserProfile.id : githubUserProfile[matchedField]
        })
      if (error) console.error(error)
    } else {
      console.log("Auth for retrieving orgs: User cannot be found", {
        id: githubUserProfile.id,
        name: githubUserProfile.name,
        email: githubUserProfile.email,
      })
    }
  }

  if (environment === 'production') {
    res.redirect('https://repository.surf/settings')
  } else {
    res.redirect('http://localhost:3000/settings')
  }
}