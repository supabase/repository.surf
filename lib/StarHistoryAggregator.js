import { combineStarHistories, uuid } from 'lib/helpers'
import RepoStarHistoryRetriever from 'lib/RepoStarHistoryRetriever'

// NOTE: starRetrievers is an object of star history retrievers.
// Example: {'supabase/supabase': RepoStarHistoryRetriever1, 'supabase/realtime': RepoStarHistoryRetriever2}
export default class StarHistoryAggregator {
  constructor(supabase, starsTable, organization,
              githubAccessToken, starRetrievers, repoNames) {
    this.supabase = supabase
    this.starsTable = starsTable
    this.organization = organization
    this.githubAccessToken = githubAccessToken
    this.starRetrievers = starRetrievers
    this.aggregatedStarHistory = []
    this.aggregationLoadedTime = null
    this.repoNames = repoNames
    this.aggregationCount = 0
    this.subscriptions = new Map()

    this._aggregateStarHistories()
  }

  async _aggregateStarHistories(){
    // For each repoName, create a repoStarHistoryRetriever and
    // subscribe to its update.
    this.repoNames.forEach(repoName => {
      const starHistoryKey = `${this.organization}/${repoName}`
      let starHistoryRetriever
      if (starHistoryKey in this.starRetrievers) {
        starHistoryRetriever = this.starRetrievers[starHistoryKey]
      } else {
        starHistoryRetriever = new RepoStarHistoryRetriever(this.supabase,
            this.starsTable, this.organization, repoName, this.githubAccessToken)
        this.starRetrievers[starHistoryKey] = starHistoryRetriever
      }

      // If historyUpdateTime is not null, then that means that the data
      // retrieval has already finished.
      if (starHistoryRetriever.historyUpdateTime) {
        this.handleStarRetrievalCompleted(starHistoryRetriever.starHistory)
      }

      starHistoryRetriever.onLoaded(this._handleUpdate)
    })
  }

  // A function for handling the updates from a starHistoryRetriever.
  // This should be called every time one of the starHistoryRetrievers finishes loading.
  _handleUpdate = (starHistory, historyUpdateTime, isLoading, totalStarCount) => {
    // If historyUpdateTime is null, then that means that the data
    // retrieval hasn't finished yet.
    if (!historyUpdateTime) {
      return
    }
    
    this.handleStarRetrievalCompleted(starHistory)
  }

  // This function will be called each time we detect
  // a star history retrieval process being completed.
  handleStarRetrievalCompleted(starHistory) {
    // Update the aggregated star history and increment count.
    this.aggregatedStarHistory =
      combineStarHistories(this.aggregatedStarHistory, starHistory)
    this.aggregationCount += 1

    // If all the aggregation has finished, update the aggregationLoadedTime
    // to the oldest time one of the star histories has been loaded.
    if (this.aggregationCount === this.repoNames.length) {
      const updateTimes =
        Object.entries(this.starRetrievers).map(x => x[1].historyUpdateTime)
      this.aggregationLoadedTime = Math.min(...updateTimes)
    }

    this._notifyAllSubscribers()
  }

  _notifyAllSubscribers() {
    this.subscriptions.forEach((x) => 
      x.callback(this.aggregatedStarHistory, this.aggregationLoadedTime, this.aggregationCount)
    )
  }

  onAggregationUpdated(callback){
    try {
      const id = uuid()
      let self = this
      const subscription = {
        callback,
        unsubscribe: () => {
          self.subscriptions.delete(id)
        },
      }
      this.subscriptions.set(id, subscription)
      return { subscription, error: null }
    } catch (error) {
      console.error(error)
      return { subscription: null, error }
    }
  }
}
