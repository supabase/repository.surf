export const login = async(supabase) => {
  await supabase.auth.signIn({ provider: 'github' })
}

export const logout = async(supabase) => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error at logout:', error)
}