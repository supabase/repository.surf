import { createClient } from '@supabase/supabase-js'
import { ORGANIZATIONS_TABLE } from 'lib/constants'

const CryptoJS = require('crypto-js')
const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const githubAccessToken = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN
const encryptionKey = process.env.REPOSITORY_SURF_ENCRYPTION_KEY

const supabase = createClient(supabaseURL, supabaseServiceRoleKey)

export default async function fetchOrgConfig(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Missing query: name' })
  }

  const { data, error } = await supabase
    .from(ORGANIZATIONS_TABLE)
    .select('*')
    .eq('id', id)
  
  if (error) {
    console.error(error)
    res.status(500).json({ error })
  } else if (data.length > 0) {
    let token = githubAccessToken
    if (data[0].access_token) {
      console.log(`INFO: ${id} using org config token`)
      token = CryptoJS.AES.decrypt(data[0].access_token, encryptionKey).toString(CryptoJS.enc.Utf8)
    } else {
      console.log(`INFO: ${id} Not using org config token`)
    }
    return res.send({
      ...data[0],
      access_token: token
    })
  }

  console.log(`INFO: ${id} Not using org config token`)  
  return res.send({ access_token: githubAccessToken })
}