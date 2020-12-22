import { fetchAllAndWait, fetchAndWait } from 'lib/fetchWrapper'

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

export const retrieveStarHistory = async(organization, repoName, githubAccessToken) => {
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
export const renewStarHistory = async(supabase, starsTable, organization, repoName, githubAccessToken) => {
  const starHistory = await retrieveStarHistory(organization, repoName, githubAccessToken)
  await supabase
    .from(starsTable)
    .insert([
      {
        organization: organization,
        repository: repoName,
        star_history: starHistory,
      }
    ])
  return starHistory
}