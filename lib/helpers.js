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

// This function converts a history of cumulative star counts
// to daily increases.
//
// Example:
// history: [{date: "2019-10-25", starNumber: 2},
//           {date: "2019-10-26", starNumber: 3},
//           {date: "2019-10-27", starNumber: 5},
//           {date: "2019-10-28", starNumber: 10}]
//
// output: [{date: "2019-10-25", starNumber: 2},
//          {date: "2019-10-26", starNumber: 1},
//          {date: "2019-10-27", starNumber: 2},
//          {date: "2019-10-28", starNumber: 5}]
export const convertCumulativeToDailyNewStars = (history) => {
  const result = []
  const copied = [...history]
  const reversed = copied.reverse()
  for (let i = 0; i < reversed.length; i++) {
    let increase
    if (i + 1 < reversed.length) {
      increase = reversed[i].starNumber - reversed[i + 1].starNumber
    } else {
      increase = reversed[i].starNumber
    }
    result.push({date: reversed[i].date, starNumber: increase})
  }
  return result.reverse()
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

const postToGitHubAPIv4 = async(query, githubAccessToken, variables={}) => {
  const url = 'https://api.github.com/graphql'
  const headers = {
    'Authorization': `bearer ${githubAccessToken}` 
  }
  const body = {query, variables}
  const result = await postAndWait(url, body, headers)
  return result
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
  const variables = {organization, repoName, cursor}

  const result = await postToGitHubAPIv4(query, githubAccessToken, variables)

  return(result.data.repository.stargazers)
}

// Input example:
// [["2020-04-21", "2020-04-22", "2020-04-23"],
//  ["2020-04-29", "2020-04-29"]]
//
// Corresponding output example:
// [{date: "2020-04-21", starNumber: 1},
//  {date: "2020-04-22", starNumber: 2},
//  {date: "2020-04-23", starNumber: 3},
//  {date: "2020-04-29", starNumber: 5}]
const starredAtArrayToHistory = (starredAtArray) => {
  const flatArray = starredAtArray.flat()
  let accumulativeCount = 0
  const starCountDateMap = {}

  flatArray.forEach(dateString => {
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

// Output example:
// { starHistory:
//  [{date: "2020-04-21", starNumber: 1},
//  {date: "2020-04-22", starNumber: 2},
//  {date: "2020-04-29", starNumber: 5},
//  {date: "2020-04-30", starNumber: 10}],
//   cursor: "Y3Vyc29yOnYyOpIAzgSA8pk=",
//   totalStarCount: 333}
//
// NOTE: The final result will be currentHistory + recentHistory combined.
// The recentHistory will be the history after the given cursor.
// The currentHistory should be the history before the given cursor, inclusive.
export const retrieveStarHistory = async(organization, repoName, githubAccessToken,
                        currentHistory, cursor, supabase, starsTable, callback) => {
  let starredAtArray = []
  // const startTime = new Date(); // for benchmarking
  let result = await getGithubStarGql({organization, repoName, cursor, githubAccessToken})
  let stargazers = result.edges
  const totalStarCount = result.totalCount
  // stargazers format (note: oldest first):
  // [{cursor: "Y3Vyc29yOnYyOpIAzg0_vtQ=", starredAt: "2020-05-29T19:27:49Z"},
  //  {cursor: "Y3Vyc29yOnYyOpIAzg0_zE0=", starredAt: "2020-05-29T20:02:34Z"},
  //  {cursor: "Y3Vyc29yOnYyOpIAzg0_zE0=", starredAt: "2020-05-30T20:02:34Z"}]

  // Count the number of times the API has been called
  let callCount = 1

  while (stargazers.length > 0) {
    // Get the cursor of the newest event.
    cursor = stargazers[stargazers.length - 1].cursor

    // Use slice(0, 10) to get the date only (and not time).
    starredAtArray.push(stargazers.map(x => x.starredAt.slice(0, 10)))
    // Retrieve the starring events before the cursor.
    result = await getGithubStarGql({organization, repoName, cursor, githubAccessToken})
    stargazers = result.edges

    callCount += 1
    if (callCount % 4 == 0) {
      const recentHistory = starredAtArrayToHistory(starredAtArray)
      const combined = combineStarHistories(currentHistory, recentHistory)
      // Give the intermediate results to the callback function.
      callback(combined, totalStarCount)

      // Then, update the SB cache with the intermediate results.
      await supabase
        .from(starsTable)
        .update({
          star_history: combined,
          updated_at: new Date().toISOString(),
          is_complete: false,
          cursor: cursor,
          total_star_count: totalStarCount
        })
        .match({
          organization: organization,
          repository: repoName
        })
    //   The following is for benchmarking:
    //   const currentTime = new Date();
    //   const elapsedSeconds = Math.round((currentTime - startTime) / 1000)
    //   console.log(`Elapsed seconds: ${elapsedSeconds}`)
    }
  }
  const recentHistory = starredAtArrayToHistory(starredAtArray)
  return {starHistory: combineStarHistories(currentHistory, recentHistory), cursor, totalStarCount}
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
//  historyUpdateTime: 1608888163296,
//  totalStarCount: 333}
//
// NOTE: The callback function will be called once every 10 API calls.
export const getRepositoryStarHistory = async(
    supabase, starsTable, organization, repoName,
    githubAccessToken, callback = () => {}) => {
  
  // First, check if we already have cached data in supabase.
  let { data, error } = await supabase
    .from(starsTable)
    .select('*')
    .eq('organization', organization)
    .eq('repository', repoName)

  if (error || !data) {
    console.error(error)
    return
  }

  // If there's no data, insert an empty row.
  if (data.length == 0) {
    const result = await supabase
      .from(starsTable)
      .insert([
        {
          organization: organization,
          repository: repoName,
          star_history: [],
          updated_at: new Date().toISOString(),
          is_complete: false,
          cursor: null,
          total_star_count: 0
        }
      ])
    data = result.data
    error = result.error

    if (error) {
      console.error(error)
      return
    }
  }

  // Check if it's valid within 1 hour
  data = data[0]
  const historyUpdateTime = new Date(data.updated_at).getTime()
  let currentTime = new Date().getTime()
  // If data is not complete, we need to finish populating it.
  if (data.is_complete && currentTime - historyUpdateTime <= (1*60*60*1000)) {
    // console.log(`Star history of ${repoName} still valid`)
    return {starHistory: data.star_history, historyUpdateTime, totalStarCount: data.total_star_count}
  } else {
    // console.log(`Star history of ${repoName} invalid, refreshing`)
    const {starHistory, totalStarCount} = await renewStarHistory(
      supabase, starsTable, organization, repoName,
      githubAccessToken, data.star_history, data.cursor, callback
    )
    currentTime = new Date().getTime()
    return {starHistory, historyUpdateTime: currentTime, totalStarCount}
  }
}

// Combine the newly retrieved history with currentHistory, and return it.
// NOTE: the callback function will be called once every 10 API calls.
// Output format: {starHistory, totalStarCount}
export const renewStarHistory = async(supabase, starsTable, organization,
                                repoName, githubAccessToken, currentHistory,
                                cursor, callback) => 
{
  const {starHistory, cursor: updatedCursor, totalStarCount} =
    await retrieveStarHistory(organization, repoName, githubAccessToken,
                  currentHistory, cursor, supabase, starsTable, callback)
  
  await supabase
    .from(starsTable)
    .update({
      star_history: starHistory,
      updated_at: new Date().toISOString(),
      is_complete: true,
      cursor: updatedCursor,
      total_star_count: totalStarCount
    })
    .match({
      organization: organization,
      repository: repoName
    })
  return {starHistory, totalStarCount}
}

export const retrieveLatestOpenIssueCount = (issueCounts) => {
  if (issueCounts.length > 0) {
    const latestCount = issueCounts[issueCounts.length - 1]
    return latestCount.open_issues
  } else {
    return 0
  }
}

export const retrieveLatestCloseIssueCount = (issueCounts) => {
  if (issueCounts.length > 0) {
    const latestCount = issueCounts[issueCounts.length - 1]
    return latestCount.closed_issues
  } else {
    return 0
  }
}

export const deriveOpenIssueCountComparison = (issueCounts) => {
  if (issueCounts.length > 0) {
    const formattedIssueCounts = issueCounts.map(repo => {
      return {
        open_issues: repo.open_issues,
        inserted_at: (Math.floor(new Date(repo.inserted_at) / 1000))
      }
    })

    const latestCount = formattedIssueCounts[formattedIssueCounts.length - 1]
    const previousDayTimestamp = latestCount.inserted_at - 86400
    const previousDayIssueCounts = formattedIssueCounts.filter(repo => {
      if (repo.inserted_at <= previousDayTimestamp) return repo
    })

    if (previousDayIssueCounts.length > 0) {
      const previousDayCount = previousDayIssueCounts[previousDayIssueCounts.length - 1]
      return (latestCount.open_issues - previousDayCount.open_issues)
    } else {
      return 0
    }
  } else {
    return 0
  }
}

export const retrieveStarGrowthToday = (starHistory) => {
  const currentDate = new Date()
  const dateToday = currentDate.toLocaleDateString().split('/').reverse().join('-')

  const starEventToday = starHistory.filter(row => {
    if (row.date === dateToday ) return row
  })

  const previousDate = new Date(new Date() - 24*60*60*1000)
  const datePrevious = previousDate.toLocaleDateString().split('/').reverse().join('-')
  
  const starEventPreviousDay = starHistory.filter(row => {
    if (row.date === datePrevious ) return row
  })

  if (starEventToday.length === 0 || starEventPreviousDay.length === 0) {
    return 0
  } else {
    return starEventToday[0].starNumber - starEventPreviousDay[0].starNumber
  }
}

export const retrieveStarGrowthMonth = (starHistory) => {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  const dateString = `${currentYear}-${currentMonth}-1`

  const filteredStarEvents = starHistory.filter(row => {
    if (row.date >= new Date(dateString).toISOString() ) return row
  })

  if (filteredStarEvents.length === 0) {
    return 0
  } else if (filteredStarEvents.length === 1) {
    return filteredStarEvents[0].starNumber
  } else {
    return filteredStarEvents[filteredStarEvents.length - 1].starNumber - filteredStarEvents[0].starNumber
  }
}