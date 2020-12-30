import { fetchAllAndWait, fetchAndWait, postAndWait } from 'lib/fetchWrapper'

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const updateUserPreferences = (organization, newPreferences) => {
  const userPreferences = JSON.parse(localStorage.getItem(`repoSurf_${organization}`))
  const updatedPreferences = {
    ...userPreferences,
    ...newPreferences
  }
  localStorage.setItem(`repoSurf_${organization}`, JSON.stringify(updatedPreferences))
}

export const generateIframeCode = (organization, repository, chartType) => {
  return `
    <iframe width=600 height=400 src="http://repository.surf/${organization}/${repository}/embed?chart=${chartType}"></iframe>
  `.trim()
}

export const groupBy = (list, keyGetter) => {
  const map = new Map();
  list.forEach((item) => {
       const key = keyGetter(item);
       const collection = map.get(key);
       if (!collection) {
           map.set(key, [item]);
       } else {
           collection.push(item);
       }
  });
  return map;
}

// Example:
//   h1:     [{date: "2019-10-25", starNumber: 2},
//            {date: "2019-10-26", starNumber: 3},
//            {date: "2019-10-27", starNumber: 5},
//            {date: "2019-10-28", starNumber: 10}]
//
//   h2:     [{date: "2019-10-20", starNumber: 20},
//            {date: "2019-10-26", starNumber: 50},
//
//   output: [{date: "2019-10-20", starNumber: 20},
//            {date: "2019-10-25", starNumber: 22},
//            {date: "2019-10-26", starNumber: 53},
//            {date: "2019-10-27", starNumber: 55},
//            {date: "2019-10-28", starNumber: 60}]
export const combineStarHistories = (h1, h2) => {
  // My approach for writing this function:
  // - Add dummy entries for "1900-01-01" with 0 stars.
  // - Initialize two pointers - p1 (for h1dummy) and p2 (for h2dummy).
  // - Set these pointers to the last indices of h1dummy and h2dummy.
  // - Take a look at the entries at the pointers.
  // - Sum up these two entries' star numbers, and create a new entry for
  //   output with the later date. (e.g., "2019-10-28" over "2019-10-26")
  // - If one of the entries has a later date, move that pointer back by one.
  //   If they have the same date, move both poitners back by one.

  // Add dummy entries to h1 and h2 and create new variables to hold them
  const h1dummy = [{date: "1900-01-01", starNumber: 0}].concat(h1)
  const h2dummy = [{date: "1900-01-01", starNumber: 0}].concat(h2)
  let p1 = h1dummy.length - 1
  let p2 = h2dummy.length - 1

  const output = []
  while (p1 >= 0 && p2 >= 0) {
    let entry1 = h1dummy[p1]
    let entry2 = h2dummy[p2]
    
    const totalStars = entry1.starNumber + entry2.starNumber
    if ( Date.parse(entry1.date) > Date.parse(entry2.date) ){
      output.push({date: entry1.date, starNumber: totalStars})
      p1 -= 1
    } else if ( Date.parse(entry1.date) === Date.parse(entry2.date )) {
      output.push({date: entry1.date, starNumber: totalStars})
      p1 -= 1
      p2 -= 1
    } else {
      output.push({date: entry2.date, starNumber: totalStars})
      p2 -= 1
    }
  }

  return output.slice(0, output.length - 1).reverse()
}

// Original source: https://github.com/ansonyao/monthlyStarHistory/blob/master/frontend/src/Service/index.js
// License: https://github.com/ansonyao/monthlyStarHistory/blob/master/LICENSE
const getGithubStarGql = async ({organization, repoName, cursor, githubAccessToken}) => {
  const query = `
    query fetchGithubStars($organization: String!, $repoName: String!, $cursor: String) {
        repository(owner: $organization, name: $repoName) {
            stargazers(first: 100, after: $cursor) {
                totalCount
                edges{
                    starredAt
                    cursor
                }
            }
        }
        rateLimit {
            limit
            cost
            remaining
            resetAt
        }
    }
  `
  
  const url = 'https://api.github.com/graphql'
  const headers = {
    'Authorization': `bearer ${githubAccessToken}` 
  }
  const body =  {
    query,
    variables: {organization, repoName, cursor},
  }
  const result = await postAndWait(url, body, headers)
  return(result.data.repository.stargazers)
}

// Output example:
// [{date: "2020-04-21", starNumber: 1},
//  {date: "2020-04-22", starNumber: 2},
//  {date: "2020-04-29", starNumber: 5},
//  {date: "2020-04-30", starNumber: 10}]
export const retrieveStarHistory = async(organization, repoName, githubAccessToken) => {
  let starredAtArray = []
  let cursor = null
  // const startTime = new Date(); // for benchmarking
  let result = await getGithubStarGql({organization, repoName, cursor, githubAccessToken})
  let stargazers = result.edges
  // stargazers format (note: oldest first):
  // [{cursor: "Y3Vyc29yOnYyOpIAzg0_vtQ=", starredAt: "2020-05-29T19:27:49Z"},
  //  {cursor: "Y3Vyc29yOnYyOpIAzg0_zE0=", starredAt: "2020-05-29T20:02:34Z"},
  //  {cursor: "Y3Vyc29yOnYyOpIAzg0_zE0=", starredAt: "2020-05-30T20:02:34Z"}]

  // Count the number of times the API has been called (for benchmarking)
  // let callCount = 1

  while (stargazers.length > 0) {
    // Get the cursor of the newest event.
    cursor = stargazers[stargazers.length - 1].cursor

    // Use slice(0, 10) to get the date only (and not time).
    starredAtArray.push(stargazers.map(x => x.starredAt.slice(0, 10)))
    // Retrieve the starring events before the cursor.
    result = await getGithubStarGql({organization, repoName, cursor, githubAccessToken})
    stargazers = result.edges

    // For benchmarking:
    // callCount += 1
    // if (callCount % 10 == 0) {
    //   console.log(callCount)
    //   const currentTime = new Date();
    //   const elapsedSeconds = Math.round((currentTime - startTime) / 1000)
    //   console.log(`Elapsed seconds: ${elapsedSeconds}`)
    // }
  }

  starredAtArray = starredAtArray.flat()
  let accumulativeCount = 0
  const starCountDateMap = {}

  starredAtArray.forEach(dateString => {
    accumulativeCount += 1
    const dates = Object.keys(starCountDateMap)
    if (dates.indexOf(dateString) === -1) {
      starCountDateMap[dateString] = accumulativeCount
    } else {
      starCountDateMap[dateString] += 1
    }
  })

  const starCountDateEvents = Object.keys(starCountDateMap).map(date => {
    return {
      date: date,
      starNumber: starCountDateMap[date]
    }
  })

  return starCountDateEvents
}

export const retrieveStarHistoryLegacy = async(organization, repoName, githubAccessToken) => {
  const MAX_PER_PAGE = 100
  const repository = await fetchAndWait(
    `https://api.github.com/repos/${organization}/${repoName}`,
    { 'Authorization': `token ${githubAccessToken}` }
  )
  const totalStars = repository.stargazers_count

  if (totalStars > 0) {
    const totalPages = Math.ceil(repository.stargazers_count / MAX_PER_PAGE)
    const pageUrls = []

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      pageUrls.push(`https://api.github.com/repos/${organization}/${repoName}/stargazers?per_page=${MAX_PER_PAGE}&page=${pageNumber}`)
    }

    const starEvents = await fetchAllAndWait(pageUrls, {
      'Authorization': `token ${githubAccessToken}`,
      'Accept': 'application/vnd.github.v3.star+json', 
    })
    const starHistory = starEvents.flat()

    const formattedStarHistory = starHistory.map(starEvent => {
      return { ...starEvent, starred_at: starEvent.starred_at.slice(0, 10) }
    })

    let accumulativeCount = 0
    const starCountDateMap = {}

    formattedStarHistory.forEach(starEvent => {
      accumulativeCount += 1
      const dates = Object.keys(starCountDateMap)
      if (dates.indexOf(starEvent.starred_at) === -1) {
        starCountDateMap[starEvent.starred_at] = accumulativeCount
      } else {
        starCountDateMap[starEvent.starred_at] += 1
      }
    })

    const starCountDateEvents = Object.keys(starCountDateMap).map(date => {
      return {
        date: date,
        starNumber: starCountDateMap[date]
      }
    })

    return starCountDateEvents
  } else {
    return []
  }
}

// Get the given repo's star history and return it.
// Output format:
// {starHistory:
//   [{date: "2019-10-25", starNumber: 33},
//    {date: "2019-10-26", starNumber: 41},
//    {date: "2019-10-27", starNumber: 46},
//    {date: "2019-10-28", starNumber: 51}]
//  historyUpdateTime: 1608888163296}
export const getRepositoryStarHistory = async(supabase, starsTable, organization, repoName, githubAccessToken) => {
  const { data, error } = await supabase
    .from(starsTable)
    .select('*')
    .eq('organization', organization)
    .eq('repository', repoName)

  if (error) {
    console.log(error)
  } else if (data) {
    if (data.length == 0) {
      const starHistory = await renewStarHistory(supabase, starsTable, organization, repoName, githubAccessToken)
      return {starHistory, historyUpdateTime: new Date().getTime()}
    } else {
      // Check if it's valid within 12 hours
      const historyUpdateTime = new Date(data[0].updated_at).getTime()
      const currentTime = new Date().getTime()
      if (currentTime - historyUpdateTime <= (12*60*60*1000)) {
        return {starHistory: data[0].star_history, historyUpdateTime}
      } else {
        const starHistory = await renewStarHistory(supabase, starsTable, organization, repoName, githubAccessToken, true)
        return {starHistory, historyUpdateTime: currentTime}
      }
    }
  }
}

export const renewStarHistory = async(supabase, starsTable, organization, repoName, githubAccessToken, update = false) => {
  const starHistory = await retrieveStarHistory(organization, repoName, githubAccessToken)
  if (update) {
    await supabase
      .from(starsTable)
      .update({
        star_history: starHistory,
        updated_at: new Date().toISOString(),
      })
      .match({
        organization: organization,
        repository: repoName
      })
  } else {
    await supabase
      .from(starsTable)
      .insert([
        {
          organization: organization,
          repository: repoName,
          star_history: starHistory,
        }
      ])
  }
  return starHistory
}
