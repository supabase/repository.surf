export const fetchAllAndWait = async(urls, headers = {}, options = {}) => {
  try {
    const response = await Promise.all(
      urls.map(url => fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
        ...options,
      }).then(res => res.json()))
    )
    return response
  } catch (error) {
    console.log('Error at fetchWrapper - fetchAllAndWait', error)
    throw error
  }
}

export const fetchAndWait = async (url, headers = {}, options = {}) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      ...options,
    })
    const body = await response.json()
    return body
  } catch (error) {
    console.log('Error at fetchWrapper - fetchAndWait:', error)
    throw error
  }
}

export const postAndWait = async (url, data, headers = {}, options = {}) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
      ...options,
    })
    const body = await response.json()
    return body
  } catch (error) {
    console.log('Error at fetchWrapper - postAndWait:', error)
    throw error
  }
}

export const patchAndWait = async (url, data, options = {}) => {
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
      ...options,
    })
    const body = await response.json()
    return body
  } catch (error) {
    console.log('Error at fetchWrapper - patchAndWait:', error)
    throw error
  }
}

export const deleteAndWait = async (url, data, options = {}) => {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
      ...options,
    })
    const body = await response.json()
    return body
  } catch (error) {
    console.log('Error at fetchWrapper - deleteAndWait:', error)
    throw error
  }
}
