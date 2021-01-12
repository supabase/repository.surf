const CryptoJS = require('crypto-js')

export default function decrypt(req, res) {
  const { token } = req.body
  if (!token) {
    res.status(400).json({ error: 'Missing parameters: token' })
  }
  try {
    const decrypted_token = CryptoJS.AES.decrypt(token, process.env.REPOSITORY_SURF_ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
    res.send({ decrypted_token })
  } catch(error) {
    console.log(error)
    res.status(500).json({ error })
  }
}