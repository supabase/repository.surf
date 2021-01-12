const CryptoJS = require('crypto-js')

export default function encrypt(req, res) {
  const { string } = req.body
  if (!string) {
    res.status(400).json({ error: 'Missing parameters: string' })
  }
  try {
    const encrypted_token = CryptoJS.AES.encrypt(string, process.env.REPOSITORY_SURF_ENCRYPTION_KEY).toString()
    res.send({ encrypted_token })
  } catch(error) {
    console.log(error)
    res.status(500).json({ error })
  }
}