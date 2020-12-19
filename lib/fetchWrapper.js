export const fetchAndWait = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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

export const postAndWait = async (url, data, options = {}) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
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
