import { fetchAllAndWait, fetchAndWait, postAndWait } from 'lib/fetchWrapper'

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

// Original source: https://github.com/ansonyao/monthlyStarHistory/blob/master/frontend/src/Service/index.js
// License: https://github.com/ansonyao/monthlyStarHistory/blob/master/LICENSE
const getGithubStarGql = async ({organization, repoName, cursor, githubAccessToken}) => {
  const query = `
    query fetchGithubStars($organization: String!, $repoName: String!, $cursor: String) {
        repository(owner: $organization, name: $repoName) {
            stargazers(last: 100, before: $cursor) {
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
    // Get the cursor of the oldest event.
    cursor = stargazers[0].cursor

    // Use reverse() to get newest first.
    // And use slice(0, 10) to get the date only (and not time)
    starredAtArray.push(stargazers.reverse().map(x => x.starredAt.slice(0, 10)))
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

  // Use reverse() again to get oldest first.
  starredAtArray = starredAtArray.flat().reverse()

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